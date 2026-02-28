import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import ProgressBar from '../ui/ProgressBar';
import Chip from '../ui/Chip';
import Button from '../ui/Button';
import { useCountUp } from '../../hooks/useAnimations';
import './DriftReasoningModal.css';

export default function DriftReasoningModal({ isOpen, onClose, drift, onAccept }) {
  const [showBars, setShowBars] = useState(false);
  const { value: scoreValue, start: startCount } = useCountUp(
    drift?.collision_potential_score || 91,
    800,
    false
  );

  useEffect(() => {
    if (isOpen) {
      startCount();
      const timer = setTimeout(() => setShowBars(true), 900);
      return () => clearTimeout(timer);
    } else {
      setShowBars(false);
    }
  }, [isOpen, startCount]);

  if (!drift?.reasoning) return null;

  const reasoning = drift.reasoning;
  const bars = [
    { label: 'Complementary Skills', value: reasoning.skills_complementarity, color: 'primary' },
    { label: 'Shared Hidden Interests', value: reasoning.shared_interests_score, color: 'teal' },
    { label: 'Timing Alignment', value: reasoning.timing_alignment, color: 'mint' },
    { label: 'Gap Profile Match', value: reasoning.gap_profile_match, color: 'gold' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Why this drift?">
      <div className="reasoning-modal">
        {/* Section 1 — The Gap */}
        <div className="reasoning-section">
          <h4 className="reasoning-subheader">Your attractor analysis</h4>
          <p className="reasoning-gap-text">{reasoning.gap_description}.</p>

          <div className="reasoning-timeline">
            <div className="reasoning-timeline__dot reasoning-timeline__dot--start" />
            <div className="reasoning-timeline__line" />
            <div className="reasoning-timeline__gap-label">
              {reasoning.days_since_intersection}-day gap 🔴
            </div>
            <div className="reasoning-timeline__dot reasoning-timeline__dot--end" />
            <div className="reasoning-timeline__labels">
              <span>{reasoning.days_since_intersection} days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Section 2 — Collision Breakdown */}
        <div className="reasoning-section">
          <h4 className="reasoning-subheader">
            Why {drift.collision_potential_score}%?
            <span className="reasoning-info">ⓘ</span>
          </h4>

          <div className="reasoning-score-display">
            <span className="reasoning-big-score gradient-text">{scoreValue}%</span>
            <span className="reasoning-score-sub">Collision Potential Score</span>
          </div>

          <div className="reasoning-bars">
            {bars.map((bar, i) => (
              <motion.div
                key={bar.label}
                className="reasoning-bar-row"
                initial={{ opacity: 0, x: -20 }}
                animate={showBars ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="reasoning-bar-label">
                  <span>{bar.label}</span>
                  <span className="reasoning-bar-value">{bar.value}%</span>
                </div>
                <ProgressBar
                  value={showBars ? bar.value : 0}
                  color={bar.color}
                  animated={true}
                />
              </motion.div>
            ))}
          </div>

          <p className="reasoning-disclaimer">
            Based on anonymised profiles. We never reveal who.
          </p>
        </div>

        {/* Section 3 — What Might Happen */}
        <div className="reasoning-section">
          <h4 className="reasoning-subheader">Possible outcomes</h4>
          <div className="reasoning-chips">
            {reasoning.scenario_chips.map((chip, i) => {
              const icons = ['💡', '🔄', '🌐'];
              return (
                <Chip key={chip} label={`${icons[i] || '✨'} ${chip}`} />
              );
            })}
          </div>
          <p className="reasoning-outcomes-note">
            Or nothing. That's fine too. Drift is about possibility, not pressure.
          </p>
        </div>

        <Button variant="primary" fullWidth onClick={() => { onAccept?.(); onClose(); }}>
          Accept This Drift
        </Button>
      </div>
    </Modal>
  );
}
