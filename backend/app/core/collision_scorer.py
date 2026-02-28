import random
from typing import Set
from ..models.drift import CollisionScore
from ..models.student import StudentProfile, AttractorState


class CollisionScorer:
    """
    Scores creative/social collision potential between two students.
    NOT a similarity scorer — scores COMPLEMENTARITY.
    High score = each has what the other is missing.

    C(a,b) = α·Φ(a,b) + β·Θ(a,b) + γ·Ω(a,b) + δ·Γ(a,b)
    α=0.35, β=0.30, γ=0.15, δ=0.20
    """

    DOMAIN_MAP = {
        'robotics': 'spatial-mechanical',
        'sculpture': 'spatial-mechanical',
        'architecture': 'spatial-mechanical',
        '3d modeling': 'spatial-mechanical',
        'hardware': 'spatial-mechanical',
        'writing': 'narrative-expression',
        'music': 'narrative-expression',
        'filmmaking': 'narrative-expression',
        'music production': 'narrative-expression',
        'poetry': 'narrative-expression',
        'photography': 'narrative-expression',
        'data science': 'pattern-systems',
        'economics': 'pattern-systems',
        'biology': 'pattern-systems',
        'machine learning': 'pattern-systems',
        'data analysis': 'pattern-systems',
        'statistics': 'pattern-systems',
        'python': 'computational',
        'react': 'computational',
        'ui/ux': 'design-thinking',
        'graphic design': 'design-thinking',
        'marketing': 'persuasion-communication',
        'public speaking': 'persuasion-communication',
        'debate': 'persuasion-communication',
        'electronics': 'engineering-build',
        'research': 'analytical-inquiry',
        'philosophy': 'analytical-inquiry',
        'startups': 'entrepreneurial',
        'business': 'entrepreneurial',
        'ai': 'pattern-systems',
        'video editing': 'narrative-expression',
    }

    CAMPUS_DEPARTMENTS = {
        'CS', 'Design', 'Arts', 'Architecture', 'Business',
        'Physics', 'Chemistry', 'Philosophy', 'Music',
        'Drama', 'Economics', 'Psychology', 'Sports', 'Literature'
    }

    def score(
        self,
        student_a: StudentProfile,
        student_b: StudentProfile,
        attractor_a: AttractorState = None,
        attractor_b: AttractorState = None
    ) -> CollisionScore:
        """Score complementarity between two students."""

        skill_complement = self._skill_complementarity(
            student_a.skills, student_b.skills
        )

        hidden_thread = self._find_hidden_thread(
            student_a.interests, student_b.interests
        )

        timing = self._timing_overlap(student_a, student_b)

        if attractor_a and attractor_b:
            gap_match = self._gap_profile_match(attractor_a, attractor_b)
        else:
            gap_match = random.uniform(0.5, 0.95)

        overall = (
            skill_complement * 0.35 +
            hidden_thread * 0.30 +
            timing * 0.15 +
            gap_match * 0.20
        )

        return CollisionScore(
            overall=round(overall * 100, 1),
            skill_complementarity=round(skill_complement, 3),
            shared_hidden_interests=round(hidden_thread, 3),
            timing_alignment=round(timing, 3),
            gap_profile_match=round(gap_match, 3)
        )

    def _skill_complementarity(self, skills_a, skills_b):
        """
        Φ(a,b) = |S_a △ S_b| / |S_a ∪ S_b| · (1 - |S_a ∩ S_b| / |S_a ∪ S_b|)
        High complementarity → high score. Penalizes overlap.
        """
        set_a, set_b = set(s.lower() for s in skills_a), set(s.lower() for s in skills_b)
        union = set_a.union(set_b)
        if not union:
            return 0.5
        symmetric_diff = set_a.symmetric_difference(set_b)
        intersection = set_a.intersection(set_b)
        ratio = len(symmetric_diff) / len(union)
        overlap_penalty = 1 - (len(intersection) / len(union))
        return ratio * overlap_penalty

    def _find_hidden_thread(self, interests_a, interests_b):
        """
        Θ(a,b): Rewards pairs who share a deep domain but have different
        surface interests — the "hidden thread."
        """
        domains_a = {self.DOMAIN_MAP.get(i.lower(), i.lower()) for i in interests_a}
        domains_b = {self.DOMAIN_MAP.get(i.lower(), i.lower()) for i in interests_b}

        domain_overlap = domains_a.intersection(domains_b)
        surface_a = set(i.lower() for i in interests_a)
        surface_b = set(i.lower() for i in interests_b)
        surface_overlap = surface_a.intersection(surface_b)

        hidden = max(len(domain_overlap) - len(surface_overlap), 0)
        return min(hidden / 3, 1.0)

    def _timing_overlap(self, a, b):
        """
        Ω(a,b): Simplified for MVP — random float 0.6-1.0.
        Replace with real calendar data in production.
        """
        return random.uniform(0.6, 1.0)

    def _gap_profile_match(self, attractor_a: AttractorState, attractor_b: AttractorState):
        """
        Γ(a,b) = |G_a ∩ E_b| / |G_a| · |G_b ∩ E_a| / |G_b|
        Each student fills the other's gap. Both fractions must be high.
        """
        gap_a = self.CAMPUS_DEPARTMENTS - set(attractor_a.departments_visited)
        gap_b = self.CAMPUS_DEPARTMENTS - set(attractor_b.departments_visited)
        explored_a = set(attractor_a.departments_visited)
        explored_b = set(attractor_b.departments_visited)

        fill_a = len(gap_a.intersection(explored_b)) / max(len(gap_a), 1)
        fill_b = len(gap_b.intersection(explored_a)) / max(len(gap_b), 1)

        return fill_a * fill_b
