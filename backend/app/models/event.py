from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel, Field
import uuid


class CampusEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    department: str
    type: str  # 'talk', 'workshop', 'performance', 'social', 'sports'
    location: str
    start_time: datetime
    duration_minutes: int
    is_free: bool = True
    expected_attendees: List[str] = Field(default_factory=list)
    discovery_slot: bool = False


class DiscoverySlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    organizer_id: str
    organizer_type: Literal['club', 'vendor', 'event']
    name: str
    location: str
    available_times: List[datetime]
    description: str
    tags: List[str] = Field(default_factory=list)


class DiscoverySlotCreate(BaseModel):
    organizer_id: str
    organizer_type: Literal['club', 'vendor', 'event']
    name: str
    location: str
    available_times: List[datetime]
    description: str
    tags: List[str] = Field(default_factory=list)
