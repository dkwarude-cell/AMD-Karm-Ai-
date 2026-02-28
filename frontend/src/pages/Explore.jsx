import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Modal from '../components/ui/Modal';
import useDriftStore from '../store/useDriftStore';
import { MOCK_EVENTS, MOCK_DISCOVERY_SLOTS } from '../data/mockData';
import { getEvents, getActiveSlots } from '../lib/api';
import './Explore.css';

const EVENT_FILTERS = ['All', 'Talk', 'Workshop', 'Performance', 'Social', 'Sports'];

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [slots, setSlots] = useState(MOCK_DISCOVERY_SLOTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const { showToast, toastMessage } = useDriftStore();

  useEffect(() => {
    // Try API, fallback to mock
    getEvents()
      .then((res) => { if (res.data?.length > 0) setEvents(res.data); })
      .catch(() => {});
    getActiveSlots()
      .then((res) => { if (res.data?.length > 0) setSlots(res.data); })
      .catch(() => {});
  }, []);

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
    <div className="explore-page">
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
        {filteredEvents.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="explore-event-card" onClick={() => setSelectedEvent(event)} style={{ cursor: 'pointer' }}>
              <div className="explore-event-card__header">
                <h3 className="explore-event-card__title">{event.title}</h3>
                {event.is_free && (
                  <Tag className="explore-event-card__free">Free</Tag>
                )}
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
        ))}
        {filteredEvents.length === 0 && (
          <div className="explore-empty">
            No events in this category right now. Check back later — the campus is always moving.
          </div>
        )}
      </div>

      {/* Discovery Slots */}
      <h2 className="explore-section-title">Discovery Slots</h2>
      <p className="explore-section-sub">Open invitations from clubs and organizers</p>
      <div className="explore-slots">
        {slots.map((slot, i) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className="explore-slot-card">
              <h3 className="explore-slot-card__name">{slot.name}</h3>
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
        ))}
      </div>

      {/* Event Detail Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.title || ''}>
        {selectedEvent && (
          <div className="explore-event-detail">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              {selectedEvent.type} • {selectedEvent.department}
            </p>
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
        )}
      </Modal>
    </div>
  );
}
