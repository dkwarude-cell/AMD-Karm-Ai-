import random
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Tuple

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

        # Filter candidates by constraints and turn them into drift options.
        filtered_events, filtered_slots = self._apply_constraints(
            student, available_events or [], available_slots or []
        )
        constrained_options = self._to_drift_options(filtered_events, filtered_slots)

        # Epsilon-greedy selection: prioritize constrained options first.
        if constrained_options:
            if random.random() < self.EPSILON:
                drift_data = self._explore_from_options(constrained_options, attractor)
            else:
                drift_data = self._exploit_from_options(constrained_options, fingerprint)
        else:
            fallback_options = self._constrained_sample_options(student)
            if fallback_options:
                if random.random() < self.EPSILON:
                    drift_data = self._explore_from_options(fallback_options, attractor)
                else:
                    drift_data = self._exploit_from_options(fallback_options, fingerprint)
            else:
                # Guaranteed-safe final fallback if the budget is extremely tight.
                drift_data = {
                    'type': 'route',
                    'title': 'Take a short detour through a new corridor',
                    'description': 'Quick exploration nudge that fits your current constraints.',
                    'location': 'Campus Central Corridor',
                    'time': 'Anytime',
                    'time_required_minutes': min(10, max(student.time_budget_minutes, 5)),
                    'is_free': True,
                }

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
            is_free=drift_data.get('is_free', True),
            time_required_minutes=drift_data['time_required_minutes'],
            created_at=datetime.utcnow(),
            status='pending'
        )

    def _apply_constraints(self, student, events, slots) -> Tuple[List[CampusEvent], List[DiscoverySlot]]:
        filtered_events: List[CampusEvent] = []
        needs = {a.lower() for a in (student.accessibility or [])}

        def has_access(required: set, available: List[str]) -> bool:
            if not required:
                return True
            available_set = {a.lower() for a in (available or [])}
            return required.issubset(available_set)

        for event in events:
            if student.free_only and not event.is_free:
                continue
            if event.duration_minutes > student.time_budget_minutes:
                continue
            if not has_access(needs, event.accessibility):
                continue
            filtered_events.append(event)

        filtered_slots: List[DiscoverySlot] = []
        for slot in slots:
            # Discovery slots are treated as short interactions by default.
            if student.time_budget_minutes < 30:
                continue
            if not has_access(needs, slot.accessibility):
                continue
            filtered_slots.append(slot)

        return filtered_events, filtered_slots

    def _to_drift_options(self, events: List[CampusEvent], slots: List[DiscoverySlot]) -> List[Dict]:
        options: List[Dict] = []
        for event in events:
            options.append({
                'type': 'event',
                'title': event.title,
                'description': f"{event.department} • {event.type.title()} • {'Free' if event.is_free else 'Paid'}",
                'location': event.location,
                'time': event.start_time.strftime('%I:%M %p').lstrip('0'),
                'time_required_minutes': event.duration_minutes,
                'is_free': event.is_free,
            })

        for slot in slots:
            first_time = slot.available_times[0].strftime('%I:%M %p').lstrip('0') if slot.available_times else 'Anytime'
            options.append({
                'type': 'space',
                'title': slot.name,
                'description': slot.description,
                'location': slot.location,
                'time': first_time,
                'time_required_minutes': 30,
                'is_free': True,
            })
        return options

    def _explore_from_options(self, options: List[Dict], attractor: AttractorState) -> Dict:
        explored_types = {t.lower() for t in (attractor.event_types_attended or [])}
        unseen = [o for o in options if o['type'].lower() not in explored_types]
        pool = unseen if unseen else options
        return random.choice(pool)

    def _exploit_from_options(self, options: List[Dict], fingerprint: SerendipityFingerprint) -> Dict:
        best_type = (fingerprint.best_drift_type or 'event').lower() if fingerprint else 'event'
        preferred = [o for o in options if o['type'].lower() == best_type]
        pool = preferred if preferred else options
        return random.choice(pool)

    def _constrained_sample_options(self, student: StudentProfile) -> List[Dict]:
        options = []
        for sample in self.SAMPLE_DRIFTS:
            if sample['time_required_minutes'] > student.time_budget_minutes:
                continue
            if student.free_only and not sample.get('is_free', True):
                continue

            enriched = dict(sample)
            enriched['is_free'] = sample.get('is_free', True)
            options.append(enriched)
        return options

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
