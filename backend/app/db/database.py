"""
In-memory database for MVP/demo. Replace with SQLite + SQLModel in production.
"""
from datetime import datetime
from typing import Dict, List, Optional
from ..models.student import StudentProfile, AttractorState
from ..models.drift import DriftNudge
from ..models.event import CampusEvent, DiscoverySlot
from ..models.fingerprint import SerendipityFingerprint, FingerprintAxes


class InMemoryDB:
    def __init__(self):
        self.students: Dict[str, StudentProfile] = {}
        self.attractors: Dict[str, AttractorState] = {}
        self.drifts: Dict[str, DriftNudge] = {}
        self.student_drifts: Dict[str, List[str]] = {}  # student_id -> [drift_ids]
        self.fingerprints: Dict[str, SerendipityFingerprint] = {}
        self.events: List[CampusEvent] = []
        self.discovery_slots: List[DiscoverySlot] = []
        self._seed_data()

    def _seed_data(self):
        """Seed with demo data."""
        # Demo student
        demo = StudentProfile(
            id='stu-001',
            name='Aryan Sharma',
            department='Computer Science',
            year=2,
            skills=['Python', 'React', 'Machine Learning'],
            interests=['AI', 'Music', 'Photography', 'Startups'],
            time_budget_minutes=45,
            free_only=False,
            drift_score=247,
            drift_streak=4
        )
        self.students[demo.id] = demo

        self.attractors[demo.id] = AttractorState(
            student_id=demo.id,
            departments_visited=['CS', 'Mathematics'],
            canteen_counters_used=['Counter 2', 'Counter 5'],
            event_types_attended=['Technical Talk'],
            new_connections_count=0,
            content_domains_explored=['Programming', 'AI/ML', 'Web Dev']
        )

        self.fingerprints[demo.id] = SerendipityFingerprint(
            student_id=demo.id,
            axes=FingerprintAxes(
                cross_departmental=35,
                spontaneous=45,
                social=20,
                creative=40,
                exploratory=30,
                timing_flexibility=60
            ),
            total_drifts=12,
            meaningful_drifts=3,
            meaningful_rate=0.25,
            best_drift_type='canteen',
            best_time_of_day='Lunch (12-2PM)'
        )

        self.student_drifts[demo.id] = []

        # Sample events
        self.events = [
            CampusEvent(
                id='evt-001',
                title='Open Mic Night',
                department='Music',
                type='performance',
                location='Music Department Hall',
                start_time=datetime(2026, 2, 28, 19, 30),
                duration_minutes=120,
                is_free=True,
                expected_attendees=['Music', 'Arts', 'Literature'],
                discovery_slot=True
            ),
            CampusEvent(
                id='evt-002',
                title='Startup Pitch Practice',
                department='Business',
                type='social',
                location='Entrepreneurship Cell',
                start_time=datetime(2026, 3, 1, 16, 0),
                duration_minutes=90,
                is_free=True,
                expected_attendees=['Business', 'CS', 'Design'],
                discovery_slot=True
            ),
            CampusEvent(
                id='evt-003',
                title='Life Drawing Session',
                department='Fine Arts',
                type='workshop',
                location='Fine Arts Studio 3',
                start_time=datetime(2026, 3, 1, 14, 0),
                duration_minutes=120,
                is_free=True,
                expected_attendees=['Fine Arts', 'Design', 'Architecture'],
                discovery_slot=False
            ),
        ]

        self.discovery_slots = [
            DiscoverySlot(
                id='ds-001',
                organizer_id='club-photo',
                organizer_type='club',
                name='Photography Club — Portfolio Reviews',
                location='Building C, Room 204',
                available_times=[datetime(2026, 3, 1, 15, 0)],
                description='Get your portfolio reviewed.',
                tags=['creative', 'portfolio', 'photography']
            ),
        ]


# Singleton instance
db = InMemoryDB()
