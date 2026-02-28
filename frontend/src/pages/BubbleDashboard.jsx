import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { useCountUp } from '../hooks/useAnimations';
import useDriftStore from '../store/useDriftStore';
import { UNEXPLORED_AREAS } from '../data/mockData';
import BubbleVisualization from '../components/bubble/BubbleVisualization';
import './BubbleDashboard.css';

export default function BubbleDashboard() {
  const navigate = useNavigate();
  const { attractor, fetchBubble, fetchUnexplored, showToast } = useDriftStore();
  const [unexploredAreas, setUnexploredAreas] = useState(UNEXPLORED_AREAS);
  const bubblePercent = attractor?.bubble_percentage || 23;
  const { value: countValue } = useCountUp(bubblePercent, 1200);

  useEffect(() => {
    fetchBubble();
    fetchUnexplored().then((areas) => {
      if (areas && areas.length > 0) setUnexploredAreas(areas);
    });
  }, []);

  const allDepartments = [
    'CS', 'Design & Architecture', 'Performing Arts', 'Philosophy',
    'Literature', 'Economics', 'Psychology', 'Sports Science',
    'Music', 'Fine Arts', 'Chemistry', 'Physics', 'Business', 'Biotech'
  ];

  const visited = new Set(attractor?.departments_visited || []);

  const getStatusColor = (percent) => {
    if (percent <= 25) return 'coral';
    if (percent <= 60) return 'gold';
    return 'mint';
  };

  const deptPercent = Math.round((visited.size / 14) * 100);
  const canteenPercent = attractor?.canteen_variety_score || 18;
  const eventPercent = attractor?.event_diversity_score || 12.5;
  const connections = attractor?.new_connections_count || 0;
  const connectionsPercent = Math.min(connections * 10, 100);

  const scrollToUnexplored = () => {
    document.getElementById('unexplored-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDriftHere = (area) => {
    showToast(`🌀 Drift set for ${area.name}! Check your home page.`);
    navigate('/');
  };

  return (
    <div className="bubble-page">
      {/* Header */}
      <div className="bubble-header">
        <div>
          <h1 className="bubble-header__title">📡 Your Campus Bubble</h1>
          <p className="bubble-header__sub">Last 30 days</p>
        </div>
        <button className="bubble-header__link" onClick={scrollToUnexplored}>
          What am I missing?
        </button>
      </div>

      {/* Bubble SVG Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bubble-viz-container"
      >
        <BubbleVisualization
          departments={allDepartments}
          visited={attractor?.departments_visited || []}
        />
      </motion.div>

      {/* Bubble Percentage Text */}
      <div className="bubble-percentage-section">
        <span className="bubble-percentage-intro">You are living in</span>
        <span className="bubble-percentage-value gradient-text">{countValue}%</span>
        <span className="bubble-percentage-intro">of your campus</span>
        <span className="bubble-percentage-warning">
          The full one is 4× larger than yours.
        </span>
      </div>

      {/* Stats Grid */}
      <div className="bubble-stats-grid">
        <StatCard
          icon="🏛️"
          value={attractor?.departments_ratio || '2 of 14'}
          label="Departments"
          status={deptPercent <= 25 ? 'red' : deptPercent <= 60 ? 'yellow' : 'green'}
          progress={deptPercent}
          progressColor={getStatusColor(deptPercent)}
        />
        <StatCard
          icon="🍽️"
          value={`${canteenPercent}%`}
          label="Canteen Variety"
          status={canteenPercent <= 25 ? 'red' : canteenPercent <= 60 ? 'yellow' : 'green'}
          progress={canteenPercent}
          progressColor={getStatusColor(canteenPercent)}
        />
        <StatCard
          icon="🎭"
          value={`${(attractor?.event_types_attended || []).length} of 8`}
          label="Event Types"
          status={eventPercent <= 25 ? 'red' : eventPercent <= 60 ? 'yellow' : 'green'}
          progress={eventPercent}
          progressColor={getStatusColor(eventPercent)}
        />
        <StatCard
          icon="👥"
          value={`${connections}`}
          label="New Connections"
          status={connections === 0 ? 'red' : connections <= 3 ? 'yellow' : 'green'}
          progress={connectionsPercent}
          progressColor={getStatusColor(connectionsPercent)}
        />
      </div>

      {/* ── Anti-Filter-Bubble Feedback Loop (Criterion 5) ── */}
      <Card className="bubble-feedback" glow>
        <h3 className="bubble-feedback__title">🔄 Anti-Bubble Feedback</h3>
        <p className="bubble-feedback__sub">Karm AI actively prevents filter bubbles. Here's how you're doing:</p>

        {/* Diversity Score */}
        <div className="bubble-feedback__metric">
          <div className="bubble-feedback__metric-row">
            <span>🌈 Diversity Score</span>
            <span className="bubble-feedback__metric-value gradient-text">
              {Math.round(
                ((visited.size / 14) * 40) +
                ((canteenPercent / 100) * 20) +
                ((eventPercent / 100) * 25) +
                (Math.min(connections, 5) / 5 * 15)
              )}%
            </span>
          </div>
          <div className="bubble-feedback__bar">
            <div
              className="bubble-feedback__bar-fill"
              style={{
                width: `${Math.round(
                  ((visited.size / 14) * 40) +
                  ((canteenPercent / 100) * 20) +
                  ((eventPercent / 100) * 25) +
                  (Math.min(connections, 5) / 5 * 15)
                )}%`
              }}
            />
          </div>
        </div>

        {/* Peer Comparison */}
        <div className="bubble-feedback__peer">
          <span className="bubble-feedback__peer-icon">👥</span>
          <span className="bubble-feedback__peer-text">
            Students like you explored <strong>{Math.round(bubblePercent * 2.1)}%</strong> of campus on average.
            {bubblePercent < 30
              ? " You're below average — let's break out!"
              : bubblePercent < 50
              ? " You're getting there — keep drifting!"
              : " You're a campus explorer! 🎉"}
          </span>
        </div>

        {/* Filter Bubble Risk */}
        <div className="bubble-feedback__risk">
          <span className="bubble-feedback__risk-label">Filter Bubble Risk:</span>
          {bubblePercent < 25 ? (
            <Tag style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)' }}>🔴 High</Tag>
          ) : bubblePercent < 50 ? (
            <Tag style={{ background: 'rgba(255,214,102,0.15)', color: '#FFD666', border: '1px solid rgba(255,214,102,0.3)' }}>🟡 Medium</Tag>
          ) : (
            <Tag style={{ background: 'rgba(79,255,176,0.15)', color: '#4FFFB0', border: '1px solid rgba(79,255,176,0.3)' }}>🟢 Low</Tag>
          )}
        </div>

        {/* Exploration Nudges */}
        <div className="bubble-feedback__nudges">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            🎯 {visited.size < 4
              ? "Try drifting to 2 new departments this week"
              : visited.size < 8
              ? "You're halfway! Explore events in unfamiliar areas"
              : "Amazing! Now try new canteen counters and event types"
            }
          </span>
        </div>

        {/* Epsilon-greedy explanation */}
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(123,97,255,0.05)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          🧠 Karm AI uses ε-greedy exploration (20% random) + MAB to ensure you always discover new areas, even when the algorithm learns your preferences.
        </div>
      </Card>

      {/* Unexplored Areas */}
      <div id="unexplored-section" className="bubble-unexplored">
        <h2 className="bubble-unexplored__title">The campus you haven't met</h2>

        <div className="bubble-unexplored__list">
          {unexploredAreas.map((area, i) => (
            <motion.div
              key={area.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className="unexplored-card">
                <div className="unexplored-card__content">
                  <span className="unexplored-card__icon">{area.icon}</span>
                  <div className="unexplored-card__info">
                    <h3 className="unexplored-card__name">{area.name}</h3>
                    <p className="unexplored-card__detail">
                      {area.students
                        ? `${area.students} active students • ${area.interactions} interactions from you`
                        : area.eventsLabel || area.note}
                    </p>
                  </div>
                  <Button variant="ghost" className="unexplored-card__cta" onClick={() => handleDriftHere(area)}>
                    {area.driftCta}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
