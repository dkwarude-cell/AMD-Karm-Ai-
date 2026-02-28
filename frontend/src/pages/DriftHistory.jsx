import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import useDriftStore from '../store/useDriftStore';
import FingerprintRadar from '../components/fingerprint/FingerprintRadar';
import './DriftHistory.css';

export default function DriftHistory() {
  const { driftHistory, fingerprint, logOutcome, toastMessage } = useDriftStore();
  const [filter, setFilter] = useState('all');
  const [outcomeFormId, setOutcomeFormId] = useState(null);
  const [outcomeDesc, setOutcomeDesc] = useState('');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'accepted', label: 'Accepted ✓' },
    { key: 'meaningful', label: 'Meaningful ✨' },
    { key: 'skipped', label: 'Skipped ×' }
  ];

  const filtered = driftHistory.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'accepted') return d.status === 'accepted';
    if (filter === 'meaningful') return d.outcome && d.outcome.was_interesting;
    if (filter === 'skipped') return d.status === 'skipped';
    return true;
  });

  const getCardType = (drift) => {
    if (drift.outcome && drift.outcome.was_interesting) return 'meaningful';
    if (drift.status === 'skipped') return 'skipped';
    if (drift.status === 'accepted' && !drift.outcome) return 'pending';
    return 'neutral';
  };

  const handleLogOutcome = (driftId, wasInteresting) => {
    logOutcome(driftId, wasInteresting, outcomeDesc.trim() || undefined);
    setOutcomeFormId(null);
    setOutcomeDesc('');
  };

  const meaningfulCount = driftHistory.filter(
    (d) => d.outcome && d.outcome.was_interesting
  ).length;

  return (
    <div className="history-page">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="toast"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="history-header">
        <h1 className="history-header__title">↩ Your Drift History</h1>
        <p className="history-header__sub">
          Each outcome shapes your serendipity fingerprint
        </p>
      </div>

      {/* Filter Row */}
      <div className="history-filters">
        {filters.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            selected={filter === f.key}
            onClick={() => setFilter(f.key)}
          />
        ))}
      </div>

      {/* Timeline */}
      <div className="history-timeline">
        <div className="history-timeline__line" />

        {filtered.map((drift, i) => {
          const type = getCardType(drift);
          return (
            <motion.div
              key={drift.id}
              className={`history-item history-item--${type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="history-item__dot" />

              <Card className="history-card">
                <div className="history-card__date">
                  {drift.day} {drift.date}
                </div>

                <h3 className="history-card__title">{drift.title}</h3>

                {type === 'meaningful' && (
                  <>
                    <span className="history-card__status history-card__status--meaningful">
                      ✨ Something happened
                    </span>
                    {drift.outcome?.description && (
                      <div className="history-card__quote">
                        <div className="history-card__quote-bar" />
                        <p>{drift.outcome.description}</p>
                      </div>
                    )}
                    <span className="history-card__footer">
                      +1 Cross-disciplinary connection • Fingerprint updated
                    </span>
                  </>
                )}

                {type === 'neutral' && (
                  <>
                    <span className="history-card__status history-card__status--neutral">
                      Accepted • Nothing notable
                    </span>
                    <span className="history-card__footer">
                      Algorithm noted • Adjusting timing patterns
                    </span>
                  </>
                )}

                {type === 'pending' && (
                  <>
                    <span className="history-card__status history-card__status--neutral">
                      ✓ Accepted
                    </span>
                    {outcomeFormId === drift.id ? (
                      <div className="history-card__outcome-form">
                        <p className="history-card__outcome-prompt">How was this drift?</p>
                        <textarea
                          className="history-card__outcome-input"
                          placeholder="What happened? (optional)"
                          value={outcomeDesc}
                          onChange={(e) => setOutcomeDesc(e.target.value)}
                          rows={2}
                        />
                        <div className="history-card__outcome-actions">
                          <Button variant="primary" onClick={() => handleLogOutcome(drift.id, true)}>
                            ✨ Something happened!
                          </Button>
                          <Button variant="secondary" onClick={() => handleLogOutcome(drift.id, false)}>
                            Nothing notable
                          </Button>
                          <Button variant="ghost" onClick={() => { setOutcomeFormId(null); setOutcomeDesc(''); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setOutcomeFormId(drift.id)}
                        style={{ marginTop: 8 }}
                      >
                        📝 Log Outcome
                      </Button>
                    )}
                  </>
                )}

                {type === 'skipped' && (
                  <>
                    <span className="history-card__status history-card__status--skipped">
                      Skipped
                    </span>
                    <span className="history-card__footer">
                      Will reduce Thursday-Friday evening nudges
                    </span>
                  </>
                )}
              </Card>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="history-empty">
            Your first drift is waiting. The campus has no idea you're coming.
          </div>
        )}
      </div>

      {/* Fingerprint Section */}
      <Card className="history-fingerprint">
        <h2 className="history-fingerprint__title">Your Serendipity Fingerprint</h2>
        <p className="history-fingerprint__sub">
          {meaningfulCount} meaningful drifts this month
        </p>

        <FingerprintRadar axes={fingerprint?.axes} />

        <p className="history-fingerprint__note">
          Your fingerprint is evolving. Keep drifting to unlock new patterns.
        </p>
      </Card>
    </div>
  );
}
