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
from ...db.database import db

router = APIRouter(prefix="/drift", tags=["drift"])

nudge_engine = NudgeEngine()
collision_scorer = CollisionScorer()
fingerprint_builder = FingerprintBuilder()


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
        fingerprint = fingerprint_builder._default_fingerprint(req.student_id)

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

    drift.outcome = DriftOutcome(
        drift_id=drift_id,
        was_interesting=req.was_interesting,
        description=req.description,
    )
    drift.status = "accepted"  # mark completed

    if req.was_interesting:
        student.drift_score += 25

    # Rebuild fingerprint
    history = [db.drifts[did] for did in db.student_drifts.get(sid, []) if did in db.drifts]
    fp = fingerprint_builder.build(sid, history)
    db.fingerprints[sid] = fp

    return {
        "status": "completed",
        "drift_id": drift_id,
        "was_interesting": req.was_interesting,
        "new_score": student.drift_score
    }
