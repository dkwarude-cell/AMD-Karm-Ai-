import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useDriftStore from '../../store/useDriftStore';
import { MOCK_EVENTS, MOCK_DISCOVERY_SLOTS } from '../../data/mockData';
import './KarmBot.css';

/**
 * KarmBot — Conversational campus assistant with budget & constraint awareness.
 * Handles natural-language-like queries:
 *  - "What's free tonight?"
 *  - "Find something under 30 minutes"
 *  - "Show me workshops"
 *  - "I'm bored"
 *  - Budget-aware recommendations
 */

const QUICK_PROMPTS = [
  "What's happening tonight?",
  "Find something free & short",
  "Recommend a workshop",
  "I want to meet new people",
  "Help me break my bubble"
];

function matchEvents(query, student) {
  const q = query.toLowerCase();
  let results = [...MOCK_EVENTS];
  let explanation = '';

  // Time filters
  if (q.includes('tonight') || q.includes('evening')) {
    results = results.filter(e => {
      const h = new Date(e.start_time).getHours();
      return h >= 17;
    });
    explanation = 'Showing evening events';
  }

  // Type filters
  if (q.includes('workshop')) {
    results = results.filter(e => e.type === 'workshop');
    explanation = 'Filtered to workshops';
  } else if (q.includes('talk') || q.includes('lecture')) {
    results = results.filter(e => e.type === 'talk');
    explanation = 'Filtered to talks & lectures';
  } else if (q.includes('social') || q.includes('meet') || q.includes('people') || q.includes('network')) {
    results = results.filter(e => e.type === 'social' || e.type === 'performance');
    explanation = 'Showing social & interactive events — great for meeting people';
  } else if (q.includes('sport') || q.includes('fitness')) {
    results = results.filter(e => e.type === 'sports');
    explanation = 'Filtered to sports events';
  }

  // Budget constraints
  if (q.includes('free') || student?.free_only) {
    results = results.filter(e => e.is_free);
    explanation += (explanation ? '. ' : '') + 'Free events only';
  }

  // Time budget
  let timeBudget = student?.time_budget_minutes || 120;
  const timeMatch = q.match(/(\d+)\s*(min|minute)/);
  if (timeMatch) {
    timeBudget = parseInt(timeMatch[1]);
  } else if (q.includes('short') || q.includes('quick')) {
    timeBudget = 30;
  }
  if (timeBudget < 120 || q.includes('short') || q.includes('quick') || timeMatch) {
    results = results.filter(e => e.duration_minutes <= timeBudget);
    explanation += (explanation ? '. ' : '') + `Under ${timeBudget} minutes`;
  }

  // Bubble-breaking
  if (q.includes('bubble') || q.includes('new') || q.includes('explore') || q.includes('bored')) {
    const visited = new Set((student?.department ? [student.department] : []).map(d => d.toLowerCase()));
    results.sort((a, b) => {
      const aNew = a.expected_attendees.filter(d => !visited.has(d.toLowerCase())).length;
      const bNew = b.expected_attendees.filter(d => !visited.has(d.toLowerCase())).length;
      return bNew - aNew;
    });
    explanation += (explanation ? '. ' : '') + 'Sorted by bubble-breaking potential';
  }

  return { results: results.slice(0, 3), explanation: explanation || 'Best matches for you' };
}

function generateWhyThis(event, student) {
  const reasons = [];
  const interests = new Set((student?.interests || []).map(i => i.toLowerCase()));
  const visited = new Set((student?.department ? [student.department] : []).map(d => d.toLowerCase()));

  if (!visited.has(event.department.toLowerCase())) {
    reasons.push(`New dept for you — breaks your bubble`);
  }
  const matchingDepts = event.expected_attendees.filter(a => interests.has(a.toLowerCase()));
  if (matchingDepts.length > 0) {
    reasons.push(`Matches your interest in ${matchingDepts.join(', ')}`);
  }
  if (event.is_free) reasons.push('Free');
  if (event.discovery_slot) reasons.push('Has discovery slot');
  return reasons.length > 0 ? reasons.join(' • ') : 'Could be your next meaningful collision';
}

export default function KarmBot() {
  const [open, setOpen] = useState(false);
  const { student } = useDriftStore();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hey${student?.name ? ' ' + student.name.split(' ')[0] : ''}! 🌀 I'm KarmBot — your campus discovery assistant. Ask me about events, tell me your budget or time constraints, or just say "I'm bored." I'll find something that breaks your bubble.`
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text) => {
    const query = text || input.trim();
    if (!query) return;
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);

    // Process with constraint-aware engine
    setTimeout(() => {
      const { results, explanation } = matchEvents(query, student);

      if (results.length === 0) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `Hmm, nothing matches "${query}" right now. Try relaxing your constraints, or say "What's happening tonight?" to see everything available.`
        }]);
        return;
      }

      const resultCards = results.map(evt => ({
        title: evt.title,
        meta: `${evt.department} • ${evt.duration_minutes}min${evt.is_free ? ' • Free' : ''}`,
        why: generateWhyThis(evt, student)
      }));

      setMessages(prev => [...prev, {
        role: 'result',
        text: `${explanation}. Found ${results.length} option${results.length > 1 ? 's' : ''}:`,
        cards: resultCards
      }]);

      // Follow-up
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: 'Want me to narrow it down more? Tell me your time limit, budget, or what kind of experience you want. 🎯'
        }]);
      }, 600);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!open) {
    return (
      <motion.button
        className="karmbot-fab"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        title="KarmBot — Campus Assistant"
      >
        🤖
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="karmbot-panel"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 24 }}
      >
        <div className="karmbot-header">
          <div className="karmbot-header__title">
            <span>🤖</span> KarmBot
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)' }}>
              Budget & constraint-aware
            </span>
          </div>
          <button className="karmbot-header__close" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="karmbot-messages" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`karmbot-msg karmbot-msg--${msg.role}`}>
              {msg.text}
              {msg.cards && msg.cards.map((card, j) => (
                <div key={j} className="karmbot-result-card">
                  <div className="karmbot-result-card__title">{card.title}</div>
                  <div className="karmbot-result-card__meta">{card.meta}</div>
                  <div className="karmbot-result-card__why">💡 {card.why}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quick prompt chips */}
        {messages.length <= 2 && (
          <div className="karmbot-chips">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} className="karmbot-chip" onClick={() => handleSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="karmbot-input-row">
          <input
            className="karmbot-input"
            placeholder="Ask about events, budget, time..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="karmbot-send" onClick={() => handleSend()} disabled={!input.trim()}>
            →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
