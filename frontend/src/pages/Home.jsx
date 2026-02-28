import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import useDriftStore from '../store/useDriftStore';
import { useGreeting } from '../hooks/useAnimations';
import { MOCK_MICRO_DRIFT, MOCK_TONIGHT_DRIFT } from '../data/mockData';
import DriftReasoningModal from '../components/drift/DriftReasoningModal';
import './Home.css';

export default function Home() {
  const greeting = useGreeting();
  const navigate = useNavigate();
  const {
    student,
    attractor,
    todaysDrift,
    isReasoningOpen,
    toastMessage,
    acceptDrift,
    skipDrift,
    openReasoning,
    closeReasoning,
    fetchDrift,
    fetchBubble,
    showToast,
    loading
  } = useDriftStore();

  const [acceptAnimating, setAcceptAnimating] = useState(false);
  const [floatingScore, setFloatingScore] = useState(false);

  // Fetch drift + bubble on mount
  useEffect(() => {
    fetchDrift();
    fetchBubble();
  }, []);

  const handleAccept = () => {
    if (!todaysDrift) return;
    setAcceptAnimating(true);
    setFloatingScore(true);
    acceptDrift(todaysDrift.id);
    setTimeout(() => setAcceptAnimating(false), 600);
    setTimeout(() => setFloatingScore(false), 1200);
  };

  const handleSkip = () => {
    if (!todaysDrift) return;
    skipDrift(todaysDrift.id);
  };

  const handleMicroDrift = () => {
    showToast(`👣 ${MOCK_MICRO_DRIFT.title} — Just go for it!`);
  };

  const handleTonightDrift = () => {
    navigate('/explore');
  };

  const driftAccepted = todaysDrift?.status === 'accepted';
  const driftSkipped = todaysDrift?.status === 'skipped';

  return (
    <div className="home-page">
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

      {/* Top Bar */}
      <div className="home-topbar">
        <div className="home-topbar__left">
          <span className="home-topbar__greeting">
            Good {greeting}, {student?.name?.split(' ')[0]} 👋
          </span>
          <a href="/bubble" className="home-topbar__bubble-pill" onClick={(e) => { e.preventDefault(); navigate('/bubble'); }}>
            ⬡ {attractor?.bubble_percentage}% explored 🔴
          </a>
        </div>
        <div className="home-topbar__avatar" style={{
          borderWidth: Math.min(student?.drift_streak || 1, 4) + 'px'
        }}>
          {student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>

      {/* Hero Drift Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          variant="portal"
          glow={driftAccepted}
          className={`hero-drift-card ${driftAccepted ? 'hero-drift-card--accepted' : ''} ${driftSkipped ? 'hero-drift-card--skipped' : ''}`}
        >
          {/* Top Row */}
          <div className="hero-drift-card__top">
            <span className="hero-drift-card__label">
              🌀 TODAY'S DRIFT
            </span>
            <span className="hero-drift-card__time">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="hero-drift-card__divider" />

          {/* Main Instruction */}
          <h2 className="hero-drift-card__title">
            {todaysDrift?.title}
          </h2>

          {/* Reasoning Preview */}
          <p className="hero-drift-card__reasoning">
            {todaysDrift?.description}
          </p>

          {/* Collision Score */}
          <div className="hero-drift-card__score-section">
            <span className="hero-drift-card__score gradient-text">
              {todaysDrift?.collision_potential_score}%
            </span>
            <span className="hero-drift-card__score-label">
              creative collision potential
            </span>
          </div>

          {/* Gentle note */}
          <p className="hero-drift-card__note">
            You don't have to talk to anyone. Just be somewhere different. 🌱
          </p>

          <div className="hero-drift-card__divider" />

          {/* Action buttons */}
          <div className="hero-drift-card__actions">
            {!driftAccepted && !driftSkipped && (
              <>
                <motion.div
                  animate={acceptAnimating ? {
                    scale: [1, 1.15, 1],
                  } : {}}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  <Button variant="primary" onClick={handleAccept}>
                    ✓ Accept
                  </Button>
                </motion.div>
                <Button variant="secondary" onClick={handleSkip}>
                  → Skip
                </Button>
                <Button variant="ghost" onClick={openReasoning}>
                  ? Why This
                </Button>
              </>
            )}
            {driftAccepted && (
              <div className="hero-drift-card__accepted">
                <span className="hero-drift-card__accepted-icon">✓</span>
                <span>Drift Accepted</span>
              </div>
            )}
            {driftSkipped && (
              <div className="hero-drift-card__skipped-msg">
                Noted. Algorithm adjusts.
              </div>
            )}
          </div>

          {/* Floating score animation */}
          <AnimatePresence>
            {floatingScore && (
              <motion.div
                className="floating-score"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -60 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                +1 Drift 🌱
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Secondary Cards */}
      <div className="home-secondary-cards">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ flex: 1 }}
        >
          <Card className="secondary-card" onClick={handleMicroDrift} style={{ cursor: 'pointer' }}>
            <span className="secondary-card__icon">👣</span>
            <h3 className="secondary-card__title">{MOCK_MICRO_DRIFT.title}</h3>
            <p className="secondary-card__body">{MOCK_MICRO_DRIFT.description}</p>
            <span className="secondary-card__footer">
              Free • {MOCK_MICRO_DRIFT.time_required_minutes} min
            </span>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ flex: 1 }}
        >
          <Card className="secondary-card" onClick={handleTonightDrift} style={{ cursor: 'pointer' }}>
            <span className="secondary-card__icon">✨</span>
            <h3 className="secondary-card__title">{MOCK_TONIGHT_DRIFT.title}</h3>
            <p className="secondary-card__body">{MOCK_TONIGHT_DRIFT.description}</p>
            <Tag className="secondary-card__tag">
              {MOCK_TONIGHT_DRIFT.complementary_profiles} complementary profiles attending
            </Tag>
            <span className="secondary-card__footer">
              Free • {MOCK_TONIGHT_DRIFT.time}
            </span>
          </Card>
        </motion.div>
      </div>

      {/* Reasoning Modal */}
      <DriftReasoningModal
        isOpen={isReasoningOpen}
        onClose={closeReasoning}
        drift={todaysDrift}
        onAccept={handleAccept}
      />
    </div>
  );
}
