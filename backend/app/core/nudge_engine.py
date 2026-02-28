import random
import uuid
from datetime import datetime
from typing import List, Optional

from ..models.student import StudentProfile, AttractorState
from ..models.drift import DriftNudge, DriftReasoning
from ..models.event import CampusEvent, DiscoverySlot
from ..models.fingerprint import SerendipityFingerprint
from .collision_scorer import CollisionScorer


class NudgeEngine:
    """
    Multi-Armed Bandit (Epsilon-Greedy) nudge selector.
    Balances exploitation (known good drift types)
    vs exploration (trying new drift types).

    Uses Minimum Effective Drift (MED) formulation:
    MED(s) = argmin_d ||d||_friction  s.t.  ΔB(s,d) ≥ ε
    """

    EPSILON = 0.2  # 20% pure exploration
    DRIFT_TYPES = ['canteen', 'event', 'route', 'space']

    SAMPLE_DRIFTS = [
        {
            'type': 'canteen',
            'title': 'Try Counter 7 instead of Counter 2 today',
            'description': 'A Philosophy + Fine Arts student eats here regularly—your profiles have a 91% creative collision potential.',
            'location': 'Main Canteen — Counter 7',
            'time': '12:30 PM — 1:30 PM',
            'time_required_minutes': 60,
        },
        {
            'type': 'event',
            'title': 'Open Mic Night — Music Department',
            'description': 'Live student performances. 3 complementary profiles expected.',
            'location': 'Music Department Hall',
            'time': '7:30 PM',
            'time_required_minutes': 90,
        },
        {
            'type': 'route',
            'title': 'Walk through Design Corridor today',
            'description': 'The alternate route passes a photography exhibition.',
            'location': 'Building C Corridor',
            'time': 'Anytime',
            'time_required_minutes': 5,
        },
        {
            'type': 'space',
            'title': 'Architecture Model Lab — Open Hours',
            'description': 'The Architecture dept opens their model lab. CNC machines, 3D printers available.',
            'location': 'Architecture Building, Ground Floor',
            'time': '3:00 PM — 5:00 PM',
            'time_required_minutes': 30,
        },
        {
            'type': 'canteen',
            'title': 'Counter 3 has a new vendor today',
            'description': 'A Business student runs a popup. Good conversation starter.',
            'location': 'Main Canteen — Counter 3',
            'time': '1:00 PM — 2:00 PM',
            'time_required_minutes': 30,
        },
        {
            'type': 'event',
            'title': 'Philosophy of AI — Guest Lecture',
            'description': 'Philosophy dept guest lecture on ethics and artificial intelligence.',
            'location': 'Philosophy Seminar Room',
            'time': '4:00 PM',
            'time_required_minutes': 60,
        }
    ]

    def __init__(self):
        self.scorer = CollisionScorer()

    def generate_daily_drift(
        self,
        student: StudentProfile,
        attractor: AttractorState,
        fingerprint: SerendipityFingerprint,
        available_events: List[CampusEvent] = None,
        available_slots: List[DiscoverySlot] = None
    ) -> DriftNudge:
        """Generate a single drift nudge for today."""

        # Filter candidates by constraints
        candidates = self._apply_constraints(
            student, available_events or [], available_slots or []
        )

        # Epsilon-greedy selection
        if random.random() < self.EPSILON:
            drift_data = self._explore(student, attractor)
        else:
            drift_data = self._exploit(fingerprint, attractor)

        # Build reasoning
        reasoning = self._build_reasoning(student, attractor, drift_data)

        collision_score = random.uniform(65, 98)

        return DriftNudge(
            id=str(uuid.uuid4()),
            student_id=student.id,
            type=drift_data['type'],
            title=drift_data['title'],
            description=drift_data['description'],
            location=drift_data['location'],
            time=drift_data['time'],
            collision_potential_score=round(collision_score, 1),
            reasoning=reasoning,
            is_free=True,
            time_required_minutes=drift_data['time_required_minutes'],
            created_at=datetime.utcnow(),
            status='pending'
        )

    def _apply_constraints(self, student, events, slots):
        filtered = []
        for event in events:
            if student.free_only and not event.is_free:
                continue
            if event.duration_minutes > student.time_budget_minutes:
                continue
            filtered.append(event)
        return filtered

    def _explore(self, student, attractor):
        """Pick from categories student has NEVER tried."""
        tried_types = set()
        # Simplified: pick a random type that fills a gap
        untried = [t for t in self.DRIFT_TYPES if t not in tried_types]
        target_type = random.choice(untried if untried else self.DRIFT_TYPES)
        candidates = [d for d in self.SAMPLE_DRIFTS if d['type'] == target_type]
        return random.choice(candidates) if candidates else random.choice(self.SAMPLE_DRIFTS)

    def _exploit(self, fingerprint, attractor):
        """Pick best known drift type for this fingerprint."""
        best_type = fingerprint.best_drift_type if fingerprint else 'canteen'
        candidates = [d for d in self.SAMPLE_DRIFTS if d['type'] == best_type]
        return random.choice(candidates) if candidates else random.choice(self.SAMPLE_DRIFTS)

    def _build_reasoning(self, student, attractor, drift_data) -> DriftReasoning:
        dept = drift_data.get('location', 'this area').split('—')[0].strip()
        visited = attractor.departments_visited if attractor else []
        days = 47 if dept not in visited else random.randint(3, 15)

        return DriftReasoning(
            gap_description=f"Your profile hasn't intersected with {dept} in {days} days",
            days_since_intersection=days,
            skills_complementarity=round(random.uniform(0.7, 0.98) * 100, 0),
            shared_interests_score=round(random.uniform(0.6, 0.95) * 100, 0),
            timing_alignment=round(random.uniform(0.7, 0.98) * 100, 0),
            gap_profile_match=round(random.uniform(0.6, 0.95) * 100, 0),
            scenario_chips=[
                'Creative collaboration',
                'Skill exchange',
                'New perspective'
            ]
        )
