from typing import List
from ..models.drift import DriftNudge
from ..models.fingerprint import FingerprintAxes


class FingerprintBuilder:
    """
    Builds personal serendipity fingerprint from drift history.
    Gets smarter with every logged drift outcome.

    F(s,t) = F(s,t-1)·(1-η) + η·∇_F L(s,t)
    
    Fingerprint Axis Score for axis k:
    F_k(s) = Σ(d ∈ H*_s) 1[d ∈ category_k]·o_d / (Σ(d ∈ H_s) 1[d ∈ category_k] + λ)
    λ = 2 (Laplace smoothing for cold start)
    """

    LAPLACE_SMOOTHING = 2  # Cold start fix

    def build(self, drift_history: List[DriftNudge]) -> FingerprintAxes:
        meaningful = [
            d for d in drift_history
            if d.outcome and d.outcome.was_interesting
        ]
        total = len(drift_history)

        if total == 0:
            return self._default_fingerprint()

        # Cross-departmental: % of meaningful drifts that crossed depts
        cross_dept = sum(
            1 for d in meaningful
            if getattr(d, 'crossed_department', False)
            or (d.outcome and any(
                t in d.outcome.fingerprint_tags
                for t in ['cross-departmental', 'cross-dept']
            ))
        ) / max(len(meaningful) + self.LAPLACE_SMOOTHING, 1)

        # Spontaneous: % accepted with < 30 min time budget
        spontaneous = sum(
            1 for d in drift_history
            if d.status == 'accepted'
            and d.time_required_minutes < 30
        ) / max(total + self.LAPLACE_SMOOTHING, 1)

        # Social: % of meaningful drifts tagged as social/connection
        social = sum(
            1 for d in meaningful
            if d.outcome and any(
                t in d.outcome.fingerprint_tags
                for t in ['connection', 'collaboration', 'social']
            )
        ) / max(len(meaningful) + self.LAPLACE_SMOOTHING, 1)

        # Exploratory: rate of unique location/event-type exploration
        unique_types = len(set(
            d.type for d in drift_history if d.status == 'accepted'
        ))
        exploratory = min(unique_types / 6, 1.0)

        # Creative: meaningful drifts tagged creative
        creative = sum(
            1 for d in meaningful
            if d.outcome and 'creative' in d.outcome.fingerprint_tags
        ) / max(len(meaningful) + self.LAPLACE_SMOOTHING, 1)

        # Timing flexibility: spread of accepted drift times
        timing_flexibility = 0.65  # simplified for MVP

        return FingerprintAxes(
            cross_departmental=round(cross_dept * 100),
            spontaneous=round(spontaneous * 100),
            social=round(social * 100),
            creative=round(creative * 100),
            exploratory=round(exploratory * 100),
            timing_flexibility=round(timing_flexibility * 100)
        )

    def _default_fingerprint(self) -> FingerprintAxes:
        """Population baseline for new users."""
        return FingerprintAxes(
            cross_departmental=20,
            spontaneous=30,
            social=25,
            creative=15,
            exploratory=20,
            timing_flexibility=40
        )
