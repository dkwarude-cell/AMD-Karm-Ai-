"""
Profile routes — create, read, update student profile.
"""
from fastapi import APIRouter, HTTPException

from ...models.student import StudentProfile, StudentProfileCreate, StudentProfileUpdate, AttractorState
from ...models.fingerprint import SerendipityFingerprint, FingerprintAxes
from ...db.database import db

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("/create", response_model=StudentProfile)
async def create_profile(req: StudentProfileCreate):
    import uuid
    student_id = f"stu-{uuid.uuid4().hex[:6]}"

    student = StudentProfile(
        id=student_id,
        name=req.name,
        department=req.department,
        year=req.year,
        skills=req.skills or [],
        interests=req.interests or [],
        time_budget_minutes=req.time_budget_minutes,
        free_only=req.free_only,
        drift_score=0,
        drift_streak=0
    )
    db.students[student_id] = student

    # Init attractor
    db.attractors[student_id] = AttractorState(
        student_id=student_id,
        departments_visited=[req.department],
        canteen_counters_used=[],
        event_types_attended=[],
        new_connections_count=0,
        content_domains_explored=[]
    )

    # Init fingerprint
    db.fingerprints[student_id] = SerendipityFingerprint(
        student_id=student_id,
        axes=FingerprintAxes(),
        total_drifts=0,
        meaningful_drifts=0,
        meaningful_rate=0.0,
        best_drift_type=None,
        best_time_of_day=None
    )

    db.student_drifts[student_id] = []

    return student


@router.get("/{student_id}", response_model=StudentProfile)
async def get_profile(student_id: str):
    student = db.students.get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    return student


@router.patch("/{student_id}", response_model=StudentProfile)
async def update_profile(student_id: str, req: StudentProfileUpdate):
    student = db.students.get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(student, key, val)

    return student
