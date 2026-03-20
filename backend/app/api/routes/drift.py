"""
Drift routes — generate, accept, skip, log outcome.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from ...models.drift import (
    DriftNudge, DriftReasoning, DriftOutcome, DriftOutcomeRequest,
    CollisionScore, DriftGenerateRequest
)
from ...core.nudge_engine import NudgeEngine
from ...core.collision_scorer import CollisionScorer
from ...core.fingerprint_builder import FingerprintBuilder
from ...core.attractor_mapper import AttractorMapper
from ...db.database import db
from ...models.fingerprint import SerendipityFingerprint

router = APIRouter(prefix="/drift", tags=["drift"])

nudge_engine = NudgeEngine()
collision_scorer = CollisionScorer()
fingerprint_builder = FingerprintBuilder()
attractor_mapper = AttractorMapper()


def _extract_department(location: str) -> str:
    if not location:
        return ""
    for sep in ['—', ',', '-']:
        if sep in location:
            return location.split(sep)[0].strip()
    return location.strip()


def _extract_counter(location: str) -> str:
    if not location:
        return ""
    if 'Counter' in location:
        idx = location.find('Counter')
        return location[idx:].strip()
    return ""


def _diversity_score(attractor) -> int:
    dept_score = (len(attractor.departments_visited) / 14) * 40
    canteen_score = (attractor.canteen_variety_score / 100) * 20
    event_score = (attractor.event_diversity_score / 100) * 25
    connection_score = (min(attractor.new_connections_count, 5) / 5) * 15
    return round(dept_score + canteen_score + event_score + connection_score)


def _update_attractor_from_drift(attractor, drift, was_interesting: bool):
    dept = _extract_department(drift.location)
    if dept and dept not in attractor.departments_visited:
        attractor.departments_visited.append(dept)

    if drift.type == 'canteen':
        counter = _extract_counter(drift.location)
        if counter and counter not in attractor.canteen_counters_used:
            attractor.canteen_counters_used.append(counter)

    if drift.type not in attractor.event_types_attended:
        attractor.event_types_attended.append(drift.type)

    if drift.type not in attractor.content_domains_explored:
        attractor.content_domains_explored.append(drift.type)

    if was_interesting:
        attractor.new_connections_count += 1

    attractor.last_updated = datetime.utcnow()


def _infer_best_drift_type(history):
    scores = {}
    for d in history:
        if not d:
            continue
        t = d.type
        inc = 2 if d.outcome and d.outcome.was_interesting else (1 if d.status == 'accepted' else 0)
        if inc > 0:
            scores[t] = scores.get(t, 0) + inc
    return max(scores, key=scores.get) if scores else 'canteen'


def _infer_best_time_of_day(history):
    buckets = {'Morning (8-12)': 0, 'Lunch (12-2PM)': 0, 'Afternoon (2-6PM)': 0, 'Evening (6PM+)': 0}
    for d in history:
        if d.status != 'accepted':
            continue
        t = (d.time or '').lower()
        if 'am' in t:
            buckets['Morning (8-12)'] += 1
        elif '12' in t or '1:' in t or '2:' in t:
            buckets['Lunch (12-2PM)'] += 1
        elif 'pm' in t and any(h in t for h in ['3:', '4:', '5:']):
            buckets['Afternoon (2-6PM)'] += 1
        elif 'pm' in t:
            buckets['Evening (6PM+)'] += 1
    return max(buckets, key=buckets.get)


@router.post("/generate", response_model=DriftNudge)
async def generate_drift(req: DriftGenerateRequest):
    student = db.students.get(req.student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    attractor = db.attractors.get(req.student_id)
    if not attractor:
        raise HTTPException(404, "Attractor state not found")

    fingerprint = db.fingerprints.get(req.student_id)
    if not fingerprint:
        fingerprint = SerendipityFingerprint(student_id=req.student_id)

    drift = nudge_engine.generate_daily_drift(student, attractor, fingerprint)
    drift.id = f"drift-{uuid.uuid4().hex[:8]}"

    # Store
    db.drifts[drift.id] = drift
    if req.student_id not in db.student_drifts:
        db.student_drifts[req.student_id] = []
    db.student_drifts[req.student_id].append(drift.id)

    return drift


@router.post("/{drift_id}/accept")
async def accept_drift(drift_id: str, student_id: str):
    drift = db.drifts.get(drift_id)
    if not drift:
        raise HTTPException(404, "Drift not found")

    student = db.students.get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    drift.status = "accepted"
    # drift accepted

    # Increment streak + score
    student.drift_streak += 1
    student.drift_score += 10

    return {"status": "accepted", "drift_id": drift_id, "new_score": student.drift_score, "new_streak": student.drift_streak}


@router.post("/{drift_id}/skip")
async def skip_drift(drift_id: str, student_id: str):
    drift = db.drifts.get(drift_id)
    if not drift:
        raise HTTPException(404, "Drift not found")

    student = db.students.get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    drift.status = "skipped"
    student.drift_streak = 0

    return {"status": "skipped", "drift_id": drift_id, "streak_reset": True}


@router.post("/{drift_id}/outcome")
async def log_outcome(drift_id: str, req: DriftOutcomeRequest, student_id: str = ""):
    drift = db.drifts.get(drift_id)
    if not drift:
        raise HTTPException(404, "Drift not found")

    sid = student_id or drift.student_id
    student = db.students.get(sid)
    if not student:
        raise HTTPException(404, "Student not found")

    attractor = db.attractors.get(sid)
    if not attractor:
        raise HTTPException(404, "Attractor state not found")

    diversity_before = _diversity_score(attractor)
    bubble_before = attractor_mapper.compute_bubble_percentage(attractor)
    prev_fp = db.fingerprints.get(sid)
    best_type_before = prev_fp.best_drift_type if prev_fp else 'canteen'

    drift.outcome = DriftOutcome(
        drift_id=drift_id,
        was_interesting=req.was_interesting,
        description=req.description,
    )
    drift.status = "accepted"  # mark completed

    if req.was_interesting:
        student.drift_score += 25

    _update_attractor_from_drift(attractor, drift, req.was_interesting)

    # Rebuild fingerprint
    history = [db.drifts[did] for did in db.student_drifts.get(sid, []) if did in db.drifts]
    axes = fingerprint_builder.build(history)
    meaningful = sum(1 for d in history if d.outcome and d.outcome.was_interesting)
    best_type_after = _infer_best_drift_type(history)
    best_time_after = _infer_best_time_of_day(history)
    fp = SerendipityFingerprint(
        student_id=sid,
        axes=axes,
        total_drifts=len(history),
        meaningful_drifts=meaningful,
        meaningful_rate=(meaningful / len(history)) if history else 0.0,
        best_drift_type=best_type_after,
        best_time_of_day=best_time_after
    )
    db.fingerprints[sid] = fp

    diversity_after = _diversity_score(attractor)
    bubble_after = attractor_mapper.compute_bubble_percentage(attractor)

    return {
        "status": "completed",
        "drift_id": drift_id,
        "was_interesting": req.was_interesting,
        "new_score": student.drift_score,
        "feedback_metrics": {
            "diversity_score_before": diversity_before,
            "diversity_score_after": diversity_after,
            "diversity_delta": diversity_after - diversity_before,
            "bubble_before": bubble_before,
            "bubble_after": bubble_after,
            "bubble_delta": round(bubble_after - bubble_before, 1),
            "recommendation_shift": {
                "best_drift_type_before": best_type_before,
                "best_drift_type_after": best_type_after,
                "shifted": best_type_before != best_type_after
            }
        }
    }
