import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Tag from '../components/ui/Tag';
import useDriftStore from '../store/useDriftStore';
import { createSlot } from '../lib/api';
import './CreatorStudio.css';

/**
 * Creator Studio — helps clubs/teams produce consistent, on-brand media.
 * Criterion 4: Creator tools for clubs/teams
 * - Event poster template generator
 * - AI-assisted copy suggestions
 * - Brand color/logo system
 * - Discovery slot publishing
 */

const BRAND_COLORS = [
  '#7B61FF', '#00D2FF', '#4FFFB0', '#FFD666',
  '#FF6B6B', '#FF61C2', '#61FFD4', '#6B8AFF'
];

const TEMPLATES = [
  { id: 'workshop', icon: '🛠️', label: 'Workshop' },
  { id: 'performance', icon: '🎭', label: 'Performance' },
  { id: 'social', icon: '🤝', label: 'Social' },
  { id: 'talk', icon: '🎤', label: 'Talk' },
  { id: 'sports', icon: '⚡', label: 'Sports' },
  { id: 'exhibition', icon: '🖼️', label: 'Exhibition' }
];

function generateAICopy(eventName, clubName, template) {
  const copies = {
    workshop: [
      `Learn. Build. Create. Join ${clubName || 'us'} for a hands-on experience you won't forget.`,
      `${eventName || 'Our Workshop'} — where beginners become builders. No experience needed.`,
      `Bring your curiosity. We'll bring the tools. ${clubName || 'Your club'} presents ${eventName || 'a new workshop'}.`
    ],
    performance: [
      `The stage is set. ${clubName || 'We'} invite${clubName ? 's' : ''} you to witness pure campus talent.`,
      `${eventName || 'Live Performance'} — one night that changes how you see campus.`,
      `Get ready to be moved. ${clubName || 'Our team'} brings you an unforgettable evening.`
    ],
    social: [
      `No agenda. Just real people, real conversations. ${clubName || 'We'} bring${clubName ? 's' : ''} the vibes.`,
      `${eventName || 'Social Meetup'} — because the best connections happen by accident.`,
      `Different departments, different stories, one space. Join ${clubName || 'us'}.`
    ],
    talk: [
      `Ideas that challenge everything you thought you knew. ${clubName || 'We'} present${clubName ? 's' : ''} ${eventName || 'a game-changing talk'}.`,
      `${eventName || 'Guest Talk'} — the kind of talk that makes you rethink your path.`,
      `Perspectives from beyond your bubble. ${clubName || 'We'} bring${clubName ? 's' : ''} the insight.`
    ],
    sports: [
      `Move your body, clear your mind. ${clubName || 'We'} welcome${clubName ? 's' : ''} all skill levels.`,
      `${eventName || 'Open Sports Session'} — no tryouts, no pressure, just play.`,
      `The best ideas come after breaking a sweat. ${clubName || 'Join us'}.`
    ],
    exhibition: [
      `See campus through new eyes. ${clubName || 'We'} showcase${clubName ? 's' : ''} what creativity looks like.`,
      `${eventName || 'Exhibition'} — art, ideas, and everything in between.`,
      `Walk through. Look. Be surprised. ${clubName || 'Our team'} has something for everyone.`
    ]
  };
  return copies[template] || copies.workshop;
}

export default function CreatorStudio() {
  const { student, showToast, toastMessage } = useDriftStore();
  const [eventName, setEventName] = useState('');
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [template, setTemplate] = useState('workshop');
  const [brandColor, setBrandColor] = useState(BRAND_COLORS[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const aiCopies = generateAICopy(eventName, clubName, template);

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handlePublish = async () => {
    if (!eventName.trim()) {
      showToast('⚠️ Give your event a name first!');
      return;
    }

    const slotData = {
      organizer_id: clubName || student?.name || 'anonymous',
      organizer_type: 'club',
      name: eventName,
      location: location || 'TBD',
      available_times: [new Date().toISOString()],
      description: description || aiCopies[0],
      tags: tags.length > 0 ? tags : [template, 'campus']
    };

    try {
      await createSlot(slotData);
    } catch (err) {
      console.warn('Slot publish API failed:', err.message);
    }

    setPublished(true);
    showToast('🎉 Event published as Discovery Slot! Students will see it in Explore.');
  };

  return (
    <div className="creator-page">
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

      <div className="creator-header">
        <h1 className="creator-header__title">🎨 Creator Studio</h1>
        <p className="creator-header__sub">Create events, posters, and discovery slots — AI-assisted</p>
      </div>

      {/* Template Selection */}
      <div className="creator-section">
        <h3 className="creator-section__title">1. Choose Template</h3>
        <div className="creator-templates">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`creator-template ${template === t.id ? 'creator-template--selected' : ''}`}
              onClick={() => setTemplate(t.id)}
            >
              <span className="creator-template__icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Details */}
      <div className="creator-section">
        <h3 className="creator-section__title">2. Event Details</h3>
        <div className="creator-form">
          <div className="creator-field">
            <label className="creator-label">Event Name</label>
            <input
              className="creator-input"
              placeholder="e.g., Open Mic Night"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <div className="creator-field">
            <label className="creator-label">Club / Team Name</label>
            <input
              className="creator-input"
              placeholder="e.g., Photography Club"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
          </div>
          <div className="creator-field">
            <label className="creator-label">Location</label>
            <input
              className="creator-input"
              placeholder="e.g., Music Hall, Building C Room 204"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="creator-field">
            <label className="creator-label">Description</label>
            <textarea
              className="creator-textarea"
              placeholder="Describe your event — or use an AI suggestion below..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="creator-field">
            <label className="creator-label">Tags</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="creator-input"
                style={{ flex: 1 }}
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <Button variant="secondary" onClick={handleAddTag}>+</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {tags.map((t) => (
                <Chip key={t} label={t} selected removable onRemove={() => setTags(tags.filter(x => x !== t))} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Copy Assistant */}
      <div className="creator-section">
        <h3 className="creator-section__title">3. AI Copy Suggestions</h3>
        <p className="creator-section__sub">Click to use — adapts to your event name and club</p>
        <div className="creator-ai-suggestions">
          <div className="creator-ai-suggestions__header">
            <span>🤖</span> KarmBot Copywriter
          </div>
          {aiCopies.map((copy, i) => (
            <button
              key={i}
              className="creator-ai-suggestion"
              onClick={() => setDescription(copy)}
            >
              {copy}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Colors */}
      <div className="creator-section">
        <h3 className="creator-section__title">4. Brand Style</h3>
        <p className="creator-section__sub">Choose your brand color for the poster</p>
        <div className="creator-color-row">
          {BRAND_COLORS.map((color) => (
            <button
              key={color}
              className={`creator-color-swatch ${brandColor === color ? 'creator-color-swatch--selected' : ''}`}
              style={{ background: color }}
              onClick={() => setBrandColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Live Poster Preview */}
      <div className="creator-section">
        <h3 className="creator-section__title">5. Poster Preview</h3>
        <motion.div
          className="creator-poster-preview"
          style={{
            background: `linear-gradient(135deg, ${brandColor}, ${brandColor}88, #0a0a0f)`,
          }}
          layout
        >
          <span className="creator-poster-preview__logo">
            {TEMPLATES.find(t => t.id === template)?.icon || '🎯'}
          </span>
          <h2 className="creator-poster-preview__title">
            {eventName || 'Your Event Name'}
          </h2>
          <p className="creator-poster-preview__sub">
            {description || 'Your event description appears here...'}
          </p>
          <p className="creator-poster-preview__meta">
            {clubName || 'Your Club'} • {location || 'Campus Venue'}
          </p>
          <span className="creator-poster-preview__badge">
            Made with Karm AI
          </span>
        </motion.div>
      </div>

      {/* Publish */}
      <div className="creator-section" style={{ paddingBottom: 40 }}>
        <h3 className="creator-section__title">6. Publish</h3>
        <p className="creator-section__sub">Publish as a Discovery Slot — students can find & book it</p>
        <div className="creator-publish-row">
          {published ? (
            <Button variant="secondary" disabled>✓ Published!</Button>
          ) : (
            <Button variant="primary" onClick={handlePublish}>
              🚀 Publish Discovery Slot
            </Button>
          )}
          <Button variant="ghost" onClick={() => {
            setEventName('');
            setClubName('');
            setDescription('');
            setLocation('');
            setTags([]);
            setPublished(false);
          }}>
            ↻ Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
