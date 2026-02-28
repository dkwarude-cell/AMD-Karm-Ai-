import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
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
