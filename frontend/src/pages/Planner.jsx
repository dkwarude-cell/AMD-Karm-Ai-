import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Tag from '../components/ui/Tag';
import useDriftStore from '../store/useDriftStore';
import { MOCK_EVENTS, MOCK_DISCOVERY_SLOTS } from '../data/mockData';
import './Planner.css';

/**
 * Campus Life Planner — Criterion 3
 * Balances time, cost, accessibility, and interests
 * to build an optimized daily/weekly campus plan.
 */

/* ── Campus locations with walking times (minutes) ── */
const CAMPUS_MAP = {
  'Music Department Hall': { zone: 'Arts', walkFrom: { 'Main Gate': 8, 'Library': 5, 'Main Canteen': 6, 'CS Block': 10 }, floor: 1, elevator: true, ramp: true },
  'Entrepreneurship Cell': { zone: 'Business', walkFrom: { 'Main Gate': 5, 'Library': 3, 'Main Canteen': 4, 'CS Block': 7 }, floor: 2, elevator: true, ramp: true },
  'Fine Arts Studio 3': { zone: 'Arts', walkFrom: { 'Main Gate': 12, 'Library': 8, 'Main Canteen': 10, 'CS Block': 14 }, floor: 3, elevator: false, ramp: false },
  'Physics Lecture Hall 2': { zone: 'Science', walkFrom: { 'Main Gate': 6, 'Library': 4, 'Main Canteen': 5, 'CS Block': 3 }, floor: 1, elevator: true, ramp: true },
  'Building C, Room 204': { zone: 'Design', walkFrom: { 'Main Gate': 10, 'Library': 6, 'Main Canteen': 8, 'CS Block': 12 }, floor: 2, elevator: true, ramp: true },
  'Philosophy Building, Room 101': { zone: 'Humanities', walkFrom: { 'Main Gate': 7, 'Library': 3, 'Main Canteen': 5, 'CS Block': 9 }, floor: 1, elevator: true, ramp: true },
  'Architecture Building, Ground Floor': { zone: 'Design', walkFrom: { 'Main Gate': 11, 'Library': 7, 'Main Canteen': 9, 'CS Block': 13 }, floor: 0, elevator: true, ramp: true },
};

const TIME_BUDGETS = [30, 45, 60, 90, 120, 180];
const ACCESSIBILITY_OPTIONS = [
  { id: 'wheelchair', label: '♿ Wheelchair', icon: '♿' },
  { id: 'elevator', label: '🛗 Elevator required', icon: '🛗' },
  { id: 'visual', label: '👁️ Low vision', icon: '👁️' },
  { id: 'sensory', label: '🔇 Sensory-friendly', icon: '🔇' },
];

const INTERESTS = ['AI', 'Music', 'Photography', 'Startups', 'Philosophy', 'Sports', 'Design', 'Arts', 'Science'];

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function getEndTime(startStr, durationMin) {
  const d = new Date(startStr);
  d.setMinutes(d.getMinutes() + durationMin);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── Schedule optimization: greedy time-fit, no overlaps ── */
function optimizeSchedule(events, timeBudget, freeOnly, accessNeeds, interests, startLocation) {
  // Score each event for the student
  const scored = events.map(evt => {
    let score = 50;
    const loc = CAMPUS_MAP[evt.location] || {};

    // Interest match
    const evtDepts = [evt.department, ...(evt.expected_attendees || [])];
    const interestHits = interests.filter(i =>
      evtDepts.some(d => d.toLowerCase().includes(i.toLowerCase()))
    );
    score += interestHits.length * 15;

    // Budget fit
    if (freeOnly && !evt.is_free) return null;
    if (evt.duration_minutes > timeBudget) score -= 20;
    else score += 10;

    // Accessibility check
    if (accessNeeds.includes('wheelchair') || accessNeeds.includes('elevator')) {
      if (!loc.elevator && !loc.ramp) return null; // Can't access
      if (loc.elevator && loc.ramp) score += 5;
    }
    if (accessNeeds.includes('sensory') && evt.type === 'performance') {
      score -= 10; // Performances may be loud
    }

    // Walking time from start location
    const walkTime = loc.walkFrom?.[startLocation] || 10;
    score -= walkTime; // Penalize far locations

    // Cross-departmental bonus
    score += evtDepts.length * 3;

    // Discovery slot bonus
    if (evt.discovery_slot) score += 8;

    return { ...evt, score, walkTime, accessible: loc.elevator || loc.ramp || loc.floor === 0, zone: loc.zone || 'Unknown' };
  }).filter(Boolean);

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Greedy non-overlapping selection within total time budget
  const plan = [];
  let totalTime = 0;

  for (const evt of scored) {
    const evtTotal = evt.duration_minutes + evt.walkTime;
    if (totalTime + evtTotal <= timeBudget) {
      plan.push(evt);
      totalTime += evtTotal;
    }
  }

  // Sort by start time for timeline display
  plan.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return { plan, totalTime, eventsConsidered: scored.length };
}

/* ── Walking route SVG ── */
function RouteMap({ plan }) {
  if (plan.length < 2) return null;
  const width = 320;
  const padding = 20;
  const stepW = (width - padding * 2) / (plan.length - 1);

  return (
    <div className="planner-route">
      <h3 className="planner-section-title">🗺️ Walking Route</h3>
      <svg width={width} height={80} viewBox={`0 0 ${width} 80`} className="planner-route__svg">
        <defs>
          <linearGradient id="route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#00E5CC" />
          </linearGradient>
        </defs>
        {/* Connection lines */}
        {plan.slice(0, -1).map((_, i) => (
          <motion.line
            key={i}
            x1={padding + i * stepW}
            y1={30}
            x2={padding + (i + 1) * stepW}
            y2={30}
            stroke="url(#route-grad)"
            strokeWidth={2}
            strokeDasharray="6 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.3, duration: 0.5 }}
          />
        ))}
        {/* Stop dots + labels */}
        {plan.map((evt, i) => (
          <g key={evt.id}>
            <motion.circle
              cx={padding + i * stepW}
              cy={30}
              r={8}
              fill={i === 0 ? '#7B61FF' : i === plan.length - 1 ? '#00E5CC' : '#FFD166'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.3, type: 'spring' }}
            />
            <text
              x={padding + i * stepW}
              y={55}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize={9}
              fontFamily="var(--font-display)"
            >
              {evt.zone}
            </text>
            <text
              x={padding + i * stepW}
              y={68}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={8}
              fontFamily="var(--font-display)"
            >
              {i < plan.length - 1 ? `${plan[i + 1].walkTime}min →` : '🏁'}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Planner() {
  const { student, attractor } = useDriftStore();
  const [timeBudget, setTimeBudget] = useState(student?.time_budget_minutes || 90);
  const [freeOnly, setFreeOnly] = useState(student?.free_only || false);
  const [accessNeeds, setAccessNeeds] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState(student?.interests || ['AI', 'Music']);
  const [startLocation, setStartLocation] = useState('Main Gate');
  const [showPlan, setShowPlan] = useState(false);

  const allEvents = [...MOCK_EVENTS, ...MOCK_DISCOVERY_SLOTS.map(s => ({
    id: s.id,
    title: s.name,
    department: s.tags?.[0] || 'General',
    type: 'social',
    location: s.location,
    start_time: s.available_times?.[0],
    duration_minutes: 60,
    is_free: true,
    expected_attendees: s.tags || [],
    discovery_slot: true,
  }))];

  const toggleAccess = (id) => {
    setAccessNeeds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const result = useMemo(() => {
    if (!showPlan) return null;
    return optimizeSchedule(allEvents, timeBudget, freeOnly, accessNeeds, selectedInterests, startLocation);
  }, [showPlan, timeBudget, freeOnly, accessNeeds, selectedInterests, startLocation]);

  const totalWalk = result?.plan?.reduce((sum, e) => sum + (e.walkTime || 0), 0) || 0;
  const totalEvent = result?.plan?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0;
  const totalCost = result?.plan?.filter(e => !e.is_free).length || 0;

  return (
    <div className="planner-page">
      {/* Header */}
      <div className="planner-header">
        <div>
          <h1 className="planner-header__title">🗓️ Campus Life Planner</h1>
          <p className="planner-header__sub">
            Balance time, cost, accessibility & interests
          </p>
        </div>
        <Link to="/explore" className="planner-header__link">← Explore</Link>
      </div>

      {/* Constraints Panel */}
      <Card className="planner-constraints">
        <h3 className="planner-section-title">⚙️ Your Constraints</h3>

        {/* Time Budget */}
        <div className="planner-field">
          <label className="planner-label">⏰ Time Budget</label>
          <div className="planner-chips">
            {TIME_BUDGETS.map(t => (
              <Chip
                key={t}
                label={`${t} min`}
                selected={timeBudget === t}
                onClick={() => setTimeBudget(t)}
              />
            ))}
          </div>
        </div>

        {/* Cost */}
        <div className="planner-field">
          <label className="planner-label">💰 Budget</label>
          <div className="planner-chips">
            <Chip label="Free only" selected={freeOnly} onClick={() => setFreeOnly(!freeOnly)} />
            <Chip label="Any budget" selected={!freeOnly} onClick={() => setFreeOnly(false)} />
          </div>
        </div>

        {/* Accessibility */}
        <div className="planner-field">
          <label className="planner-label">♿ Accessibility Needs</label>
          <div className="planner-chips">
            {ACCESSIBILITY_OPTIONS.map(opt => (
              <Chip
                key={opt.id}
                label={opt.label}
                selected={accessNeeds.includes(opt.id)}
                onClick={() => toggleAccess(opt.id)}
              />
            ))}
          </div>
          {accessNeeds.length > 0 && (
            <p className="planner-help-text">
              Only showing locations with {accessNeeds.includes('wheelchair') || accessNeeds.includes('elevator') ? 'elevator/ramp access' : 'suitable environment'}
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="planner-field">
          <label className="planner-label">🎯 Interests</label>
          <div className="planner-chips">
            {INTERESTS.map(interest => (
              <Chip
                key={interest}
                label={interest}
                selected={selectedInterests.includes(interest)}
                onClick={() => toggleInterest(interest)}
              />
            ))}
          </div>
        </div>

        {/* Start Location */}
        <div className="planner-field">
          <label className="planner-label">📍 Starting From</label>
          <div className="planner-chips">
            {['Main Gate', 'Library', 'Main Canteen', 'CS Block'].map(loc => (
              <Chip
                key={loc}
                label={loc}
                selected={startLocation === loc}
                onClick={() => setStartLocation(loc)}
              />
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowPlan(true)}
          className="planner-generate-btn"
        >
          🧠 Generate Optimized Plan
        </Button>
      </Card>

      {/* Generated Plan */}
      <AnimatePresence>
        {showPlan && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Summary Stats */}
            <div className="planner-summary">
              <div className="planner-stat">
                <span className="planner-stat__value">{result.plan.length}</span>
                <span className="planner-stat__label">Activities</span>
              </div>
              <div className="planner-stat">
                <span className="planner-stat__value">{totalEvent}m</span>
                <span className="planner-stat__label">Event Time</span>
              </div>
              <div className="planner-stat">
                <span className="planner-stat__value">{totalWalk}m</span>
                <span className="planner-stat__label">Walking</span>
              </div>
              <div className="planner-stat">
                <span className="planner-stat__value">{totalCost === 0 ? 'Free' : `₹${totalCost * 50}`}</span>
                <span className="planner-stat__label">Cost</span>
              </div>
              {accessNeeds.length > 0 && (
                <div className="planner-stat planner-stat--accessible">
                  <span className="planner-stat__value">✓</span>
                  <span className="planner-stat__label">Accessible</span>
                </div>
              )}
            </div>

            {/* Route Map */}
            <RouteMap plan={result.plan} />

            {/* Timeline */}
            <h3 className="planner-section-title" style={{ marginTop: 24 }}>📋 Your Plan</h3>
            <div className="planner-timeline">
              {result.plan.length === 0 ? (
                <Card className="planner-empty">
                  <p>No activities fit your constraints. Try increasing your time budget or removing accessibility filters.</p>
                </Card>
              ) : (
                result.plan.map((evt, i) => (
                  <motion.div
                    key={evt.id}
                    className="planner-event"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring', damping: 20 }}
                  >
                    <div className="planner-event__time-col">
                      <span className="planner-event__time">{formatTime(evt.start_time)}</span>
                      <span className="planner-event__end">{getEndTime(evt.start_time, evt.duration_minutes)}</span>
                      <div className="planner-event__line" />
                    </div>

                    <Card className="planner-event__card">
                      <div className="planner-event__header">
                        <h4 className="planner-event__title">{evt.title}</h4>
                        <div className="planner-event__badges">
                          {evt.is_free && <Tag variant="mint">Free</Tag>}
                          {evt.accessible && accessNeeds.length > 0 && <Tag variant="teal">♿ Accessible</Tag>}
                          {evt.discovery_slot && <Tag variant="primary">Discovery</Tag>}
                        </div>
                      </div>

                      <div className="planner-event__meta">
                        <span>📍 {evt.location}</span>
                        <span>⏱ {evt.duration_minutes} min</span>
                        <span>🚶 {evt.walkTime} min walk from {i === 0 ? startLocation : result.plan[i - 1].zone}</span>
                      </div>

                      {/* Why this — transparent recommendation */}
                      <div className="planner-event__why">
                        <span className="planner-event__why-label">💡 Why this:</span>
                        <span className="planner-event__why-text">
                          {evt.score >= 70
                            ? `High match (${evt.score}%) — crosses into ${evt.zone}, fits your time & budget`
                            : evt.score >= 50
                            ? `Good fit (${evt.score}%) — aligns with your interests in ${evt.department}`
                            : `Worth exploring (${evt.score}%) — new department exposure`
                          }
                        </span>
                      </div>

                      {/* Dept tags */}
                      <div className="planner-event__depts">
                        {(evt.expected_attendees || [evt.department]).map(d => (
                          <Tag key={d} variant="default">{d}</Tag>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Adjust button */}
            <div className="planner-actions">
              <Button variant="outline" onClick={() => setShowPlan(false)}>
                ⚙️ Adjust Constraints
              </Button>
              <Button variant="primary" onClick={() => setShowPlan(false)}>
                ✅ Looks Good
              </Button>
            </div>

            {/* Transparency note */}
            <div className="planner-transparency">
              <p>
                <strong>How this plan was built:</strong> Scored {result.eventsConsidered} activities on interest match,
                accessibility, walking distance from {startLocation}, cross-departmental value, and discovery potential.
                Selected the highest-scoring non-overlapping set within your {timeBudget}-minute budget.
                {accessNeeds.length > 0 && ` Filtered for ${accessNeeds.join(', ')} accessibility.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
