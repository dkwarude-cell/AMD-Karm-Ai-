import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import StatCard from '../components/ui/StatCard';
import Chip from '../components/ui/Chip';
import useDriftStore from '../store/useDriftStore';
import useOnboardingStore from '../store/useOnboardingStore';
import FingerprintRadar from '../components/fingerprint/FingerprintRadar';
import { updateProfile } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const TIME_OPTIONS = [
  { value: 10, label: '⚡ 10 min' },
  { value: 20, label: '🕐 20 min' },
  { value: 45, label: '☕ 45 min' },
  { value: null, label: '🌊 Flexible' }
];

export default function Profile() {
  const navigate = useNavigate();
  const { student, attractor, fingerprint, driftHistory, setStudent, showToast, toastMessage, setOnboarded } = useDriftStore();
  const { setCompleted: setOnboardingCompleted, reset: resetOnboarding } = useOnboardingStore();
  const [editing, setEditing] = useState(false);
  const [editTimeBudget, setEditTimeBudget] = useState(student?.time_budget_minutes ?? 45);
  const [editFreeOnly, setEditFreeOnly] = useState(student?.free_only ?? false);

  const meaningfulDrifts = driftHistory.filter(
    (d) => d.outcome && d.outcome.was_interesting
  ).length;

  const handleSavePrefs = async () => {
    const updated = {
      ...student,
      time_budget_minutes: editTimeBudget,
      free_only: editFreeOnly
    };
    setStudent(updated);
    setEditing(false);
    showToast('✅ Preferences saved!');
    try {
      await updateProfile(student.id, {
        time_budget_minutes: editTimeBudget,
        free_only: editFreeOnly
      });
    } catch (err) {
      console.warn('Profile update API failed:', err.message);
    }
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    setOnboarded(false);
    navigate('/onboarding');
  };

  return (
    <div className="profile-page">
      {/* Toast */}
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

      <div className="profile-header">
        <div className="profile-avatar">
          {student?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <h1 className="profile-name">{student?.name}</h1>
        <p className="profile-dept">
          {student?.department} • Year {student?.year}
        </p>
      </div>

      {/* Drift Score Card */}
      <Card glow className="profile-score-card">
        <div className="profile-score-card__row">
          <div>
            <span className="profile-score-card__label">Drift Score</span>
            <span className="profile-score-card__value gradient-text">
              {student?.drift_score}
            </span>
          </div>
          <div>
            <span className="profile-score-card__label">Streak</span>
            <span className="profile-score-card__streak">
              🔥 {student?.drift_streak} days
            </span>
          </div>
        </div>
      </Card>

      {/* Skills & Interests */}
      <div className="profile-section">
        <h3 className="profile-section__title">Skills</h3>
        <div className="profile-tags">
          {student?.skills?.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      </div>

      {student?.interests?.length > 0 && (
        <div className="profile-section">
          <h3 className="profile-section__title">Interests</h3>
          <div className="profile-tags">
            {student?.interests?.map((interest) => (
              <Tag key={interest}>{interest}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="profile-section">
        <h3 className="profile-section__title">Campus Activity</h3>
        <div className="profile-stats-grid">
          <StatCard
            icon="📡"
            value={`${attractor?.bubble_percentage}%`}
            label="Campus Explored"
            progress={attractor?.bubble_percentage}
            progressColor={attractor?.bubble_percentage > 60 ? 'mint' : attractor?.bubble_percentage > 25 ? 'gold' : 'coral'}
          />
          <StatCard
            icon="🌀"
            value={driftHistory.length}
            label="Total Drifts"
          />
          <StatCard
            icon="✨"
            value={meaningfulDrifts}
            label="Meaningful"
          />
          <StatCard
            icon="📈"
            value={`${Math.round((meaningfulDrifts / Math.max(driftHistory.length, 1)) * 100)}%`}
            label="Meaningful Rate"
          />
        </div>
      </div>

      {/* Mini Fingerprint */}
      <div className="profile-section">
        <h3 className="profile-section__title">Serendipity Fingerprint</h3>
        <Card>
          <FingerprintRadar axes={fingerprint?.axes} />
        </Card>
      </div>

      {/* Preferences */}
      <div className="profile-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="profile-section__title">Drift Preferences</h3>
          {!editing && (
            <Button variant="ghost" onClick={() => setEditing(true)}>✏️ Edit</Button>
          )}
        </div>
        <Card className="profile-prefs">
          {editing ? (
            <>
              <div className="profile-pref-row">
                <span>⏰ Daily Budget</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {TIME_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.label}
                      label={opt.label}
                      selected={editTimeBudget === opt.value}
                      onClick={() => setEditTimeBudget(opt.value)}
                    />
                  ))}
                </div>
              </div>
              <div className="profile-pref-row">
                <span>💰 Free Only</span>
                <button
                  className={`setup-toggle ${editFreeOnly ? 'setup-toggle--on' : ''}`}
                  onClick={() => setEditFreeOnly(!editFreeOnly)}
                  style={{ width: 48, height: 24, borderRadius: 12, border: 'none', background: editFreeOnly ? 'var(--accent-primary)' : 'var(--surface-secondary)', cursor: 'pointer', position: 'relative' }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: editFreeOnly ? 26 : 4,
                    transition: 'left 0.2s ease'
                  }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button variant="primary" onClick={handleSavePrefs}>Save</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-pref-row">
                <span>⏰ Daily Budget</span>
                <span className="profile-pref-value">
                  {student?.time_budget_minutes ? `${student.time_budget_minutes} min` : 'Flexible'}
                </span>
              </div>
              <div className="profile-pref-row">
                <span>💰 Free Only</span>
                <span className="profile-pref-value">
                  {student?.free_only ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="profile-pref-row">
                <span>🎯 Best Drift Type</span>
                <span className="profile-pref-value">
                  {fingerprint?.best_drift_type || 'Canteen'}
                </span>
              </div>
              <div className="profile-pref-row">
                <span>🕐 Best Time</span>
                <span className="profile-pref-value">
                  {fingerprint?.best_time_of_day || 'Lunch'}
                </span>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Reset */}
      <div className="profile-section" style={{ paddingBottom: 100 }}>
        <Button variant="ghost" onClick={handleResetOnboarding} style={{ color: 'var(--text-tertiary)' }}>
          🔄 Re-do Onboarding
        </Button>
      </div>
    </div>
  );
}
