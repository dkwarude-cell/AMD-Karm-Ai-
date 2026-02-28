from typing import List, Dict
from ..models.student import AttractorState


class AttractorMapper:
    """
    Builds and updates a student's attractor state.
    Tracks where they are stuck and computes bubble percentage.
    
    Uses the Attractor State Function B(s,t):
    B(s,t) = 1 - ∏(k=1..K) (1 - |V_k(s,t)| / |U_k|)^w_k
    """

    TOTAL_DEPARTMENTS = 14
    TOTAL_CANTEEN_COUNTERS = 8
    TOTAL_EVENT_TYPES = 8
    TOTAL_CONTENT_DOMAINS = 22

    ALL_DEPARTMENTS = [
        'Design & Architecture', 'Performing Arts', 'Philosophy',
        'Literature', 'Economics', 'Psychology', 'Sports Science',
        'Music', 'Fine Arts', 'Chemistry', 'Physics', 'Business',
        'Civil Engineering', 'Biotech'
    ]

    def compute_bubble_percentage(self, attractor: AttractorState) -> float:
        """
        Product complement formulation: a student who explores nothing
        in any single dimension pulls the entire score toward zero.
        B(s,t) = 1 - ∏(1 - V_k/U_k)^w_k
        """
        dept_ratio = len(attractor.departments_visited) / self.TOTAL_DEPARTMENTS
        canteen_ratio = len(attractor.canteen_counters_used) / self.TOTAL_CANTEEN_COUNTERS
        event_ratio = len(attractor.event_types_attended) / self.TOTAL_EVENT_TYPES
        content_ratio = len(attractor.content_domains_explored) / self.TOTAL_CONTENT_DOMAINS

        weights = [0.35, 0.20, 0.30, 0.15]
        ratios = [dept_ratio, canteen_ratio, event_ratio, content_ratio]

        # Product complement formulation
        product = 1.0
        for ratio, weight in zip(ratios, weights):
            product *= (1 - ratio) ** weight

        bubble = 1 - product
        return round(bubble * 100, 1)

    def get_unexplored_areas(self, attractor: AttractorState) -> List[Dict]:
        visited = set(attractor.departments_visited)
        unexplored = [d for d in self.ALL_DEPARTMENTS if d not in visited]
        return [
            {'name': dept, 'drift_cta': f'Drift to {dept} →'}
            for dept in unexplored[:5]
        ]
