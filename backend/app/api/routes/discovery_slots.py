"""
Discovery Slots routes — list and create discovery slots.
"""
from fastapi import APIRouter
from typing import List
import uuid

from ...models.event import DiscoverySlot, DiscoverySlotCreate
from ...db.database import db

router = APIRouter(prefix="/discovery-slots", tags=["discovery-slots"])


@router.get("/active", response_model=List[DiscoverySlot])
async def get_active_slots():
    return db.discovery_slots


@router.post("/create", response_model=DiscoverySlot)
async def create_slot(req: DiscoverySlotCreate):
    slot = DiscoverySlot(
        id=f"ds-{uuid.uuid4().hex[:6]}",
        organizer_id=req.organizer_id,
        organizer_type=req.organizer_type,
        name=req.name,
        location=req.location,
        available_times=req.available_times,
        description=req.description,
        tags=req.tags or []
    )
    db.discovery_slots.append(slot)
    return slot
