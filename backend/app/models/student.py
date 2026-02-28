from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid


class StudentProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    department: str
    year: int = Field(ge=1, le=4)
    skills: List[str] = Field(max_length=5)
    interests: List[str] = Field(max_length=8, default_factory=list)
    time_budget_minutes: int = 45
    free_only: bool = False
    accessibility: List[str] = Field(default_factory=list)  # wheelchair, visual, hearing, sensory
    created_at: datetime = Field(default_factory=datetime.utcnow)
    drift_score: int = 0
    drift_streak: int = 0


class AttractorState(BaseModel):
    student_id: str
    departments_visited: List[str] = Field(default_factory=list)
    canteen_counters_used: List[str] = Field(default_factory=list)
    event_types_attended: List[str] = Field(default_factory=list)
    new_connections_count: int = 0
    content_domains_explored: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    @property
    def bubble_percentage(self) -> float:
        from ..core.attractor_mapper import AttractorMapper
        mapper = AttractorMapper()
        return mapper.compute_bubble_percentage(self)

    @property
    def departments_ratio(self) -> str:
        return f"{len(self.departments_visited)} of 14"

    @property
    def canteen_variety_score(self) -> float:
        return round(len(self.canteen_counters_used) / 8 * 100, 1)

    @property
    def event_diversity_score(self) -> float:
        return round(len(self.event_types_attended) / 8 * 100, 1)


class StudentProfileCreate(BaseModel):
    name: str
    department: str
    year: int = Field(ge=1, le=4)
    skills: List[str] = Field(max_length=5)
    interests: List[str] = Field(max_length=8, default_factory=list)
    time_budget_minutes: int = 45
    free_only: bool = False
    accessibility: List[str] = Field(default_factory=list)


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    time_budget_minutes: Optional[int] = None
    free_only: Optional[bool] = None
    accessibility: Optional[List[str]] = None
