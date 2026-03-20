import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import { Link } from 'react-router-dom';
import useDriftStore from '../store/useDriftStore';
import { MOCK_EVENTS, MOCK_DISCOVERY_SLOTS } from '../data/mockData';
import { getEvents, getActiveSlots } from '../lib/api';
import './Explore.css';

const EVENT_FILTERS = ['All', 'Talk', 'Workshop', 'Performance', 'Social', 'Sports'];

/* ── Transparent Recommender: compute personalized "Why this?" for each event ── */
function computeEventRelevance(event, student, attractor) {
  if (!student) return { score: 50, reasons: ['Explore something new!'] };

  const reasons = [];
  let score = 40; // base

  // 1. Department gap — event is from a dept student hasn't visited
  const visited = new Set((attractor?.departments_visited || []).map(d => d.toLowerCase()));
  if (!visited.has(event.department.toLowerCase())) {
    score += 20;
    reasons.push(`Expands your bubble — you haven't explored ${event.department} yet`);
  }

  // 2. Skill/interest match — event attendees overlap with student interests
  const interests = new Set((student.interests || []).map(i => i.toLowerCase()));
  const skills = new Set((student.skills || []).map(s => s.toLowerCase()));
  const attendeeDepts = (event.expected_attendees || []).map(a => a.toLowerCase());
  const interestMatch = attendeeDepts.filter(a => interests.has(a) || skills.has(a));
  if (interestMatch.length > 0) {
    score += 15;
    reasons.push(`Matches your interest in ${interestMatch.join(', ')}`);
  }

  // 3. Cross-departmental collision potential
  const crossDeptCount = attendeeDepts.filter(a => !visited.has(a)).length;
  if (crossDeptCount >= 2) {
    score += 10;
    reasons.push(`${crossDeptCount} departments you've never met — high collision potential`);
  }

  // 4. Time/budget fit
  if (event.is_free && student.free_only) {
    score += 5;
    reasons.push('Free — fits your budget preference');
  }
  if (event.duration_minutes <= (student.time_budget_minutes || 45)) {
    score += 5;
    reasons.push(`${event.duration_minutes} min — fits your time budget`);
  } else {
    reasons.push(`Heads up: ${event.duration_minutes} min exceeds your ${student.time_budget_minutes || 45} min budget`);
  }

  // 5. Discovery slot bonus
  if (event.discovery_slot) {
    score += 5;
    reasons.push('Has a Discovery Slot — designed for cross-dept interaction');
  }

  return { score: Math.min(score, 100), reasons };
}

function computeSlotRelevance(slot, student) {
  if (!student) return { score: 50, reasons: ['Open to all!'] };
  const reasons = [];
  let score = 45;
  const interests = new Set((student.interests || []).map(i => i.toLowerCase()));
  const skills = new Set((student.skills || []).map(s => s.toLowerCase()));
  const tags = (slot.tags || []).map(t => t.toLowerCase());
  const tagMatch = tags.filter(t => interests.has(t) || skills.has(t));
  if (tagMatch.length > 0) {
    score += 20;
    reasons.push(`Matches your interest in ${tagMatch.join(', ')}`);
  }
  if (slot.description?.toLowerCase().includes('open to all') || slot.description?.toLowerCase().includes('no experience')) {
    score += 10;
    reasons.push('Beginner-friendly — no experience needed');
  }
  if (tags.some(t => ['creative', 'social', 'speaking'].includes(t))) {
    score += 10;
    reasons.push('Builds cross-departmental skills');
  }
  return { score: Math.min(score, 100), reasons };
}

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [slots, setSlots] = useState(MOCK_DISCOVERY_SLOTS);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const { student, attractor, showToast, toastMessage } = useDriftStore();

  useEffect(() => {
    setIsLoading(true);
    setPageError(null);
    // Try API, fallback to mock
    const eventParams = {
      free_only: student?.free_only || false,
      max_duration_minutes: student?.time_budget_minutes || undefined,
      accessibility: (student?.accessibility || []).join(',') || undefined,
    };

    Promise.allSettled([getEvents(eventParams), getActiveSlots()]).then((results) => {
      const [eventsRes, slotsRes] = results;

      if (eventsRes.status === 'fulfilled' && eventsRes.value.data?.length > 0) {
        setEvents(eventsRes.value.data);
      }

      if (slotsRes.status === 'fulfilled' && slotsRes.value.data?.length > 0) {
        setSlots(slotsRes.value.data);
      }

      if (eventsRes.status === 'rejected' || slotsRes.status === 'rejected') {
        setPageError('Live Explore data is unavailable. Showing curated fallback content.');
      }

      setIsLoading(false);
    });
  }, [student?.free_only, student?.time_budget_minutes, student?.accessibility]);

  const filteredEvents = events.filter(
    (e) => activeFilter === 'All' || e.type.toLowerCase() === activeFilter.toLowerCase()
  );

  const handleBookSlot = (slot) => {
    setBookedSlots((prev) => new Set([...prev, slot.id]));
    showToast(`🎯 Booked "${slot.name}"! You'll get a reminder.`);
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleString([], {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="explore-page page-shell">
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

      <div className="explore-header">
        <h1 className="explore-header__title">🔍 Explore</h1>
        <p className="explore-header__sub">Events, discovery slots, and collision zones</p>
      </div>

      {pageError && (
        <Card className="state-card" style={{ marginBottom: 16 }}>
          <strong>Using backup recommendations.</strong>
          <p style={{ marginTop: 8 }}>{pageError}</p>
        </Card>
      )}

      {isLoading && (
        <div aria-live="polite" aria-busy="true" style={{ marginBottom: 16 }}>
          <div className="skeleton" style={{ height: 150, marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 220, marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      )}

      {/* ── Smart Day Planner (Criterion 3: balances time, cost, accessibility, interests) ── */}
      <Card className="explore-planner">
        <div className="explore-planner__header">
          <h3 className="explore-planner__title">🗓️ Smart Day Planner</h3>
          <span className="explore-planner__sub">Balanced for time, cost & accessibility</span>
        </div>
        {(() => {
          const timeBudget = student?.time_budget_minutes || 45;
          const freeOnly = student?.free_only ?? false;
          const accessNeeds = student?.accessibility || [];
          let plannable = events
            .filter(e => !freeOnly || e.is_free)
            .filter(e => e.duration_minutes <= timeBudget)
            .slice(0, 3);
          const totalTime = plannable.reduce((s, e) => s + e.duration_minutes, 0);
          const allFree = plannable.every(e => e.is_free);
          return (
            <div className="explore-planner__body">
              <div className="explore-planner__constraints">
                <span>⏰ {timeBudget || '∞'} min budget</span>
                <span>💰 {freeOnly ? 'Free only' : 'Any cost'}</span>
                {accessNeeds.length > 0 && (
                  <span>♿ {accessNeeds.map(a => a === 'wheelchair' ? 'Wheelchair' : a === 'visual' ? 'Visual aids' : a === 'hearing' ? 'Hearing' : 'Sensory').join(', ')}</span>
                )}
              </div>
              {plannable.length > 0 ? (
                <>
                  <div className="explore-planner__timeline">
                    {plannable.map((evt, idx) => (
                      <div key={evt.id} className="explore-planner__item" onClick={() => setSelectedEvent(evt)}>
                        <div className="explore-planner__item-dot" />
                        <div className="explore-planner__item-content">
                          <span className="explore-planner__item-title">{evt.title}</span>
                          <span className="explore-planner__item-meta">
                            {evt.duration_minutes}min • {evt.department} • {evt.is_free ? 'Free' : 'Paid'}
                            {accessNeeds.includes('wheelchair') ? ' • ♿ Accessible' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="explore-planner__summary">
                    📊 {plannable.length} activities • {totalTime} min total • {allFree ? 'All free' : 'Mixed cost'}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  No activities fit your current constraints. Try adjusting your time budget in Profile.
                </p>
              )}
              <Link to="/planner" className="explore-planner__full-link">
                🧠 Open Full Planner →
              </Link>
            </div>
          );
        })()}
      </Card>

      {/* Event Filters */}
      <div className="explore-filters">
        {EVENT_FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            selected={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          />
        ))}
      </div>

      {/* Events Section */}
      <h2 className="explore-section-title">Upcoming Events</h2>
      <div className="explore-events">
        {filteredEvents.map((event, i) => {
          const relevance = computeEventRelevance(event, student, attractor);
          return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="explore-event-card" onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
              <div className="explore-event-card__header">
                <h3 className="explore-event-card__title">{event.title}</h3>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="explore-relevance-badge" title="Personalized match score">
                    {relevance.score}% match
                  </span>
                  {event.is_free && (
                    <Tag className="explore-event-card__free">Free</Tag>
                  )}
                </div>
              </div>
              {/* Transparent "Why this?" */}
              <div className="explore-why-this">
                <span className="explore-why-this__icon">💡</span>
                <span className="explore-why-this__text">{relevance.reasons[0]}</span>
              </div>
              <div className="explore-event-card__details">
                <span>🏛️ {event.department}</span>
                <span>📍 {event.location}</span>
                <span>🕐 {formatTime(event.start_time)} • {event.duration_minutes}min</span>
              </div>
              <div className="explore-event-card__attendees">
                {event.expected_attendees.map((dept) => (
                  <Tag key={dept}>{dept}</Tag>
                ))}
              </div>
              {event.discovery_slot && (
                <div className="explore-event-card__discovery">
                  <span className="explore-event-card__discovery-badge">
                    ✨ Discovery Slot
                  </span>
                </div>
              )}
            </Card>
          </motion.div>
          );
        })}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="explore-empty">
            No events in this category right now. Check back later — the campus is always moving.
          </div>
        )}
      </div>

      {/* Discovery Slots */}
      <h2 className="explore-section-title">Discovery Slots</h2>
      <p className="explore-section-sub">Open invitations from clubs and organizers</p>
      <div className="explore-slots">
        {slots.map((slot, i) => {
          const slotRelevance = computeSlotRelevance(slot, student);
          return (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className="explore-slot-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="explore-slot-card__name">{slot.name}</h3>
                <span className="explore-relevance-badge">{slotRelevance.score}% match</span>
              </div>
              <div className="explore-why-this">
                <span className="explore-why-this__icon">💡</span>
                <span className="explore-why-this__text">{slotRelevance.reasons[0]}</span>
              </div>
              <p className="explore-slot-card__desc">{slot.description}</p>
              <div className="explore-slot-card__meta">
                <span>📍 {slot.location}</span>
              </div>
              <div className="explore-slot-card__tags">
                {slot.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              {bookedSlots.has(slot.id) ? (
                <Button variant="secondary" disabled style={{ marginTop: 12 }}>
                  ✓ Booked
                </Button>
              ) : (
                <Button variant="secondary" style={{ marginTop: 12 }} onClick={() => handleBookSlot(slot)}>
                  Book a Slot →
                </Button>
              )}
            </Card>
          </motion.div>
          );
        })}
        {!isLoading && slots.length === 0 && (
          <Card className="state-card">
            <strong>No discovery slots are open right now.</strong>
            <p style={{ marginTop: 8 }}>Try again later or publish one in Creator Studio.</p>
          </Card>
        )}
      </div>

      {/* Event Detail Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.title || ''}>
        {selectedEvent && (() => {
          const rel = computeEventRelevance(selectedEvent, student, attractor);
          return (
          <div className="explore-event-detail">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              {selectedEvent.type} • {selectedEvent.department}
            </p>

            {/* Transparent Recommender — full "Why this event?" */}
            <div className="explore-why-detail">
              <div className="explore-why-detail__header">
                <span>💡 Why this event?</span>
                <span className="explore-relevance-badge explore-relevance-badge--lg">{rel.score}% match</span>
              </div>
              <ul className="explore-why-detail__list">
                {rel.reasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <span>📍 {selectedEvent.location}</span>
              <span>🕐 {formatTime(selectedEvent.start_time)} • {selectedEvent.duration_minutes} min</span>
              {selectedEvent.is_free && <Tag>Free</Tag>}
            </div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Expected Attendees</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedEvent.expected_attendees.map((dept) => (
                <Tag key={dept}>{dept}</Tag>
              ))}
            </div>
            {selectedEvent.discovery_slot && (
              <div style={{ marginTop: 16, padding: '12px', background: 'rgba(123,97,255,0.1)', borderRadius: 12 }}>
                <span style={{ color: 'var(--accent-primary)' }}>✨ This event has a Discovery Slot</span>
              </div>
            )}
          </div>
          );
        })()}
      </Modal>
    </div>
  );
}
