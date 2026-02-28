"""
Bubble routes — campus bubble percentage + unexplored areas.
"""
from fastapi import APIRouter, HTTPException
from typing import List

from ...core.attractor_mapper import AttractorMapper
from ...models.student import AttractorState
from ...db.database import db

router = APIRouter(prefix="/bubble", tags=["bubble"])

mapper = AttractorMapper()


@router.get("/{student_id}")
async def get_bubble(student_id: str):
    attractor = db.attractors.get(student_id)
    if not attractor:
        raise HTTPException(404, "Attractor state not found")

    bubble = mapper.compute_bubble_percentage(attractor)
    return {
        "student_id": student_id,
        "bubble_percentage": bubble,
        "departments_visited": attractor.departments_visited,
        "counters_used": attractor.canteen_counters_used,
        "event_types": attractor.event_types_attended
    }


@router.get("/{student_id}/unexplored")
async def get_unexplored(student_id: str):
    attractor = db.attractors.get(student_id)
    if not attractor:
        raise HTTPException(404, "Attractor state not found")

    unexplored = mapper.get_unexplored_areas(attractor)
    return {
        "student_id": student_id,
        "unexplored_areas": unexplored
    }
