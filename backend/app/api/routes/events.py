"""
Events routes — campus events browsing.
"""
from fastapi import APIRouter, Query
from typing import Optional, List

from ...models.event import CampusEvent
from ...db.database import db

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[CampusEvent])
async def get_events(
    event_type: Optional[str] = Query(None, description="Filter by type: workshop, social, performance, talk"),
    department: Optional[str] = Query(None, description="Filter by department"),
    free_only: bool = Query(False, description="Only show free events"),
    max_duration_minutes: Optional[int] = Query(None, description="Only show events that fit within this duration"),
    accessibility: Optional[str] = Query(None, description="Comma-separated accessibility needs, e.g. wheelchair,elevator")
):
    events = db.events

    if event_type:
        events = [e for e in events if e.type == event_type]
    if department:
        events = [e for e in events if e.department.lower() == department.lower()]
    if free_only:
        events = [e for e in events if e.is_free]
    if max_duration_minutes is not None:
        events = [e for e in events if e.duration_minutes <= max_duration_minutes]
    if accessibility:
        needs = {x.strip().lower() for x in accessibility.split(',') if x.strip()}
        if needs:
            events = [
                e for e in events
                if needs.issubset({a.lower() for a in (e.accessibility or [])})
            ]

    return events
