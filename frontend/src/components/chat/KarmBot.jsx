import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useDriftStore from '../../store/useDriftStore';
import { chatAsk } from '../../lib/api';
import './KarmBot.css';

/* ── KarmBot Logo ── Animated SVG brand icon ── */
function KarmLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`karmbot-logo ${className}`}
    >
      <defs>
        <linearGradient id="karm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7B61FF" />
          <stop offset="100%" stopColor="#00E5CC" />
        </linearGradient>
        <linearGradient id="karm-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8A8FF" />
          <stop offset="100%" stopColor="#4FFFB0" />
        </linearGradient>
        <filter id="karm-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Outer ring */}
      <circle cx="20" cy="20" r="18" stroke="url(#karm-grad)" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Core orb */}
      <circle cx="20" cy="20" r="12" fill="url(#karm-grad)" opacity="0.15" />
      <circle cx="20" cy="20" r="12" stroke="url(#karm-grad)" strokeWidth="1.5" fill="none" />
      {/* K shape — stylized */}
      <path
        d="M16 12v16M16 20l8-8M16 20l8 8"
        stroke="url(#karm-inner)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#karm-glow)"
      />
      {/* Orbiting dots — neural sparkle */}
      <circle cx="30" cy="12" r="1.5" fill="#00E5CC" className="karmbot-logo__dot karmbot-logo__dot--1" />
      <circle cx="10" cy="28" r="1.2" fill="#7B61FF" className="karmbot-logo__dot karmbot-logo__dot--2" />
      <circle cx="32" cy="26" r="1" fill="#FFD166" className="karmbot-logo__dot karmbot-logo__dot--3" />
    </svg>
  );
}

/**
 * KarmBot — AI-powered campus discovery assistant.
 * Calls backend /api/chat/ask which uses OpenRouter AI
 * with a constrained system prompt for Karm AI only.
 */

const QUICK_PROMPTS = [
  "What's happening tonight?",
  "Find something free & short",
  "Recommend a workshop",
  "I want to meet new people",
  "Help me break my bubble"
];

export default function KarmBot() {
  const [open, setOpen] = useState(false);
  const { student } = useDriftStore();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hey${student?.name ? ' ' + student.name.split(' ')[0] : ''}! 🌀 I'm KarmBot — your AI campus discovery assistant. Ask me about events, tell me your budget or time constraints, or just say "I'm bored." I'll find something that breaks your bubble.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text) => {
    const query = text || input.trim();
    if (!query || loading) return;
    setInput('');

    // Add user message
    const updatedMessages = [...messages, { role: 'user', text: query }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await chatAsk(query, student?.id, updatedMessages);
      const data = res.data;

      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.message
      }]);

      // Add follow-up if provided
      if (data.follow_up) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'bot',
            text: data.follow_up
          }]);
        }, 600);
      }
    } catch (err) {
      // Offline / backend down fallback
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "I'm having trouble connecting right now. Try asking about tonight's events or workshops! 🔄"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* FAB — visible when panel is closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="karmbot-fab"
            className="karmbot-fab"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            title="KarmBot — AI Campus Assistant"
          >
            <KarmLogo size={30} className="karmbot-fab-logo" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel — visible when open */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="karmbot-panel"
            className="karmbot-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24 }}
          >
            <div className="karmbot-header">
              <div className="karmbot-header__title">
                <KarmLogo size={22} /> KarmBot
                <span className="karmbot-header__badge">AI</span>
              </div>
              <button className="karmbot-header__close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="karmbot-messages" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`karmbot-msg karmbot-msg--${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="karmbot-msg karmbot-msg--bot karmbot-typing">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>

            {/* Quick prompt chips */}
            {messages.length <= 2 && !loading && (
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
                placeholder={loading ? 'KarmBot is thinking...' : 'Ask about events, budget, time...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button className="karmbot-send" onClick={() => handleSend()} disabled={!input.trim() || loading}>
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
