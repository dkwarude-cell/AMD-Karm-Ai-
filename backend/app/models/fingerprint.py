from datetime import datetime
from pydantic import BaseModel, Field


class FingerprintAxes(BaseModel):
    cross_departmental: float = 20
    spontaneous: float = 30
    social: float = 25
    creative: float = 15
    exploratory: float = 20
    timing_flexibility: float = 40


class SerendipityFingerprint(BaseModel):
    student_id: str
    axes: FingerprintAxes = Field(default_factory=FingerprintAxes)
    total_drifts: int = 0
    meaningful_drifts: int = 0
    meaningful_rate: float = 0.0
    best_drift_type: str = "canteen"
    best_time_of_day: str = "Lunch (12-2PM)"
    last_updated: datetime = Field(default_factory=datetime.utcnow)
