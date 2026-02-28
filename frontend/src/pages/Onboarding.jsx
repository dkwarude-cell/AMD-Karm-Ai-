import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Card from '../components/ui/Card';
import useOnboardingStore from '../store/useOnboardingStore';
import useDriftStore from '../store/useDriftStore';
import { ALL_DEPARTMENTS, SKILL_SUGGESTIONS } from '../data/mockData';
import { createProfile } from '../lib/api';
import './Onboarding.css';

const TIME_OPTIONS = [
  { value: 10, label: '⚡ 10 min' },
  { value: 20, label: '🕐 20 min' },
  { value: 45, label: '☕ 45 min' },
  { value: null, label: '🌊 Flexible' }
];

const INTEREST_SUGGESTIONS = [
  'AI/ML', 'Music', 'Photography', 'Dance', 'Debate', 'Philosophy',
  'Startups', 'Gaming', 'Sustainability', 'Film', 'Poetry', 'Robotics',
  'Cooking', 'Sports', 'Art', 'Literature', 'Theater', 'Astronomy'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    step, direction, nextStep, prevStep,
    department, setDepartment,
    year, setYear,
    name, setName,
    skills, addSkill, removeSkill,
    interests, addInterest, removeInterest,
    timeBudget, setTimeBudget,
    freeOnly, setFreeOnly,
    accessibility, toggleAccessibility,
    isReadyToSubmit, setCompleted
  } = useOnboardingStore();

  const { setStudent, setOnboarded, showToast } = useDriftStore();
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !skills.includes(s)
  );

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const studentName = name.trim() || 'Anonymous Drifter';
    const profileData = {
      id: 'stu-' + Date.now().toString(36),
      name: studentName,
      department,
      year: year || 2,
      skills,
      interests,
      time_budget_minutes: timeBudget || 45,
      free_only: freeOnly,
      accessibility: accessibility || [],
      created_at: new Date().toISOString(),
      drift_score: 0,
      drift_streak: 0
    };

    setStudent(profileData);
    setCompleted(true);
    setOnboarded(true);

    // Try to persist to backend
    try {
      await createProfile(profileData);
    } catch (err) {
      console.warn('Profile API save failed, using local:', err.message);
    }

    showToast(`🌀 Welcome, ${studentName.split(' ')[0]}! Your first drift awaits.`);
    navigate('/');
    setSubmitting(false);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 })
  };

  return (
    <div className="onboarding-page">
      {/* Progress bar */}
      <div className="onboarding-progress">
        <div
          className="onboarding-progress__fill"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <motion.div
            key="step-0"
            className="onboarding-step onboarding-mirror"
            variants={slideVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Animated Rings */}
            <div className="mirror-rings">
              <svg viewBox="0 0 300 300" className="mirror-rings__svg">
                {[1, 2, 3, 4, 5, 6].map((ring) => (
                  <circle
                    key={ring}
                    cx="150"
                    cy="150"
                    r={ring * 22}
                    fill="none"
                    stroke={
                      ring === 1
                        ? 'rgba(123, 97, 255, 0.8)'
                        : ring <= 3
                        ? 'rgba(123, 97, 255, 0.3)'
                        : 'rgba(123, 97, 255, 0.08)'
                    }
                    strokeWidth={ring === 1 ? 3 : 1.5}
                    className={`mirror-ring mirror-ring--${ring}`}
                  />
                ))}
                <text x="150" y="148" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
                  You
                </text>
                <text x="150" y="204" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
                  Your usual spots
                </text>
                <text x="150" y="278" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="8">
                  Unknown campus
                </text>
              </svg>
            </div>

            <h1 className="mirror-headline">
              You are living in 18% of your campus.
            </h1>
            <p className="mirror-sub">
              The other 82% is where the best things happen.
            </p>

            {/* Stat strip */}
            <div className="mirror-stats">
              <Card className="mirror-stat">
                <span className="mirror-stat__icon">🏛️</span>
                <span className="mirror-stat__value">2 of 14</span>
                <span className="mirror-stat__label">Departments</span>
              </Card>
              <Card className="mirror-stat">
                <span className="mirror-stat__icon">🍽️</span>
                <span className="mirror-stat__value">18%</span>
                <span className="mirror-stat__label">Canteen</span>
              </Card>
              <Card className="mirror-stat">
                <span className="mirror-stat__icon">👥</span>
                <span className="mirror-stat__value">0 new</span>
                <span className="mirror-stat__label">Connections</span>
              </Card>
            </div>

            <Button variant="primary" fullWidth onClick={nextStep}>
              Show me the rest
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            className="onboarding-step onboarding-concept"
            variants={slideVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="concept-illustration">
              <div className="concept-figures">
                <div className="concept-figure">👤</div>
                <div className="concept-arc">
                  <svg viewBox="0 0 200 60" className="concept-arc__svg">
                    <path
                      d="M 20 50 Q 100 -10 180 50"
                      fill="none"
                      stroke="var(--accent-secondary)"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                  </svg>
                  <span className="concept-arc__badge">91% collision potential</span>
                </div>
                <div className="concept-figure">👤</div>
              </div>
            </div>

            <h1 className="concept-headline">Not who to meet.</h1>
            <p className="concept-sub-headline">Where to be.</p>
            <p className="concept-body">
              Karm AI never says 'meet this person'. It says 'be at Counter 7 at noon'. 
              What happens next is yours.
            </p>

            <div className="concept-features">
              <div className="concept-feature">
                <span>🎯</span>
                <span>One nudge per day — never overwhelming</span>
              </div>
              <div className="concept-feature">
                <span>💡</span>
                <span>Full reasoning — always transparent</span>
              </div>
              <div className="concept-feature">
                <span>🔒</span>
                <span>Your data stays on your device</span>
              </div>
            </div>

            <div className="onboarding-nav-row">
              <Button variant="ghost" onClick={prevStep}>← Back</Button>
              <Button variant="primary" onClick={nextStep}>
                Sounds different. Good.
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            className="onboarding-step onboarding-setup"
            variants={slideVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h2 className="setup-headline">Tell us enough to surprise you</h2>
            <p className="setup-sub">We only need the basics. The rest we figure out.</p>

            {/* Name */}
            <div className="setup-section">
              <label className="setup-label">Your name</label>
              <input
                className="setup-skills-input"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Department */}
            <div className="setup-section">
              <label className="setup-label">Department</label>
              <div className="setup-chips-grid">
                {ALL_DEPARTMENTS.map((dept) => (
                  <Chip
                    key={dept}
                    label={dept}
                    selected={department === dept}
                    onClick={() => setDepartment(dept)}
                  />
                ))}
              </div>
            </div>

            {/* Year */}
            <div className="setup-section">
              <label className="setup-label">Year</label>
              <div className="setup-chips-row">
                {[1, 2, 3, 4].map((y) => (
                  <Chip
                    key={y}
                    label={`${y}${y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'}`}
                    selected={year === y}
                    onClick={() => setYear(y)}
                  />
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="setup-section">
              <label className="setup-label">Your skills (up to 5)</label>
              <div className="setup-skills-input-wrapper">
                <input
                  className="setup-skills-input"
                  type="text"
                  placeholder="Type to search..."
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && skillInput && filteredSuggestions.length > 0 && (
                  <div className="setup-suggestions">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        className="setup-suggestion"
                        onMouseDown={() => {
                          addSkill(s);
                          setSkillInput('');
                          setShowSuggestions(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="setup-selected-skills">
                {skills.map((s) => (
                  <Chip key={s} label={s} removable onRemove={() => removeSkill(s)} selected />
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="setup-section">
              <label className="setup-label">Interests (up to 8)</label>
              <div className="setup-chips-grid">
                {INTEREST_SUGGESTIONS.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    selected={interests.includes(interest)}
                    onClick={() =>
                      interests.includes(interest)
                        ? removeInterest(interest)
                        : addInterest(interest)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Time Budget */}
            <div className="setup-section">
              <label className="setup-label">Daily drift budget</label>
              <div className="setup-chips-row">
                {TIME_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.label}
                    label={opt.label}
                    selected={timeBudget === opt.value}
                    onClick={() => setTimeBudget(opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* Free Only Toggle */}
            <div className="setup-section">
              <div className="setup-toggle-row">
                <div>
                  <label className="setup-label">Free drifts only</label>
                  <p className="setup-toggle-sub">We'll only suggest zero-cost experiences</p>
                </div>
                <button
                  className={`setup-toggle ${freeOnly ? 'setup-toggle--on' : ''}`}
                  onClick={() => setFreeOnly(!freeOnly)}
                >
                  <div className="setup-toggle__knob" />
                </button>
              </div>
            </div>

            {/* Accessibility Needs */}
            <div className="setup-section">
              <label className="setup-label">Accessibility needs (optional)</label>
              <p className="setup-toggle-sub">We'll adapt routes & venues to be accessible for you</p>
              <div className="setup-chips-grid" style={{ marginTop: 8 }}>
                {[
                  { id: 'wheelchair', label: '♿ Wheelchair access' },
                  { id: 'visual', label: '👁️ Visual aids' },
                  { id: 'hearing', label: '🦻 Hearing support' },
                  { id: 'sensory', label: '🧘 Sensory-friendly' },
                ].map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    selected={accessibility.includes(opt.id)}
                    onClick={() => toggleAccessibility(opt.id)}
                  />
                ))}
              </div>
            </div>

            <div className="onboarding-nav-row">
              <Button variant="ghost" onClick={prevStep}>← Back</Button>
              <Button
                variant="primary"
                disabled={!isReadyToSubmit() || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Setting up...' : 'Start Drifting →'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
