from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
import uuid


class DriftReasoning(BaseModel):
    gap_description: str
    days_since_intersection: int
    skills_complementarity: float
    shared_interests_score: float
    timing_alignment: float
    gap_profile_match: float
    scenario_chips: List[str]


class DriftOutcome(BaseModel):
    drift_id: str
    was_interesting: bool
    description: Optional[str] = None
    logged_at: datetime = Field(default_factory=datetime.utcnow)
    fingerprint_tags: List[str] = Field(default_factory=list)


class DriftNudge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    type: Literal['canteen', 'event', 'route', 'space']
    title: str
    description: str
    location: str
    time: str
    collision_potential_score: float = Field(ge=0, le=100)
    reasoning: DriftReasoning
    is_free: bool = True
    time_required_minutes: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: Literal['pending', 'accepted', 'skipped'] = 'pending'
    outcome: Optional[DriftOutcome] = None


class DriftOutcomeRequest(BaseModel):
    was_interesting: bool
    description: Optional[str] = None


class DriftGenerateRequest(BaseModel):
    student_id: str


class CollisionScore(BaseModel):
    overall: float
    skill_complementarity: float
    shared_hidden_interests: float
    timing_alignment: float
    gap_profile_match: float
