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
    free_only: bool = Query(False, description="Only show free events")
):
    events = db.events

    if event_type:
        events = [e for e in events if e.type == event_type]
    if department:
        events = [e for e in events if e.department.lower() == department.lower()]
    if free_only:
        events = [e for e in events if e.is_free]

    return events
