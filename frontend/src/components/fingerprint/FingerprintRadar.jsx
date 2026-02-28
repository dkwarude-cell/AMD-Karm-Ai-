import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './FingerprintRadar.css';

const AXES_LABELS = [
  { key: 'cross_departmental', label: 'Cross-dept' },
  { key: 'spontaneous', label: 'Spontaneous' },
  { key: 'social', label: 'Social' },
  { key: 'creative', label: 'Creative' },
  { key: 'exploratory', label: 'Exploratory' },
  { key: 'timing_flexibility', label: 'Timing' }
];

export default function FingerprintRadar({ axes }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);

  const size = 280;
  const center = size / 2;
  const maxR = 100;
  const levels = 4;

  // Get points for a shape given values (0-100)
  const getPoints = (values) => {
    return AXES_LABELS.map((axis, i) => {
      const angle = (i / AXES_LABELS.length) * Math.PI * 2 - Math.PI / 2;
      const val = (values[axis.key] || 0) / 100;
      const r = val * maxR;
      return {
        x: center + Math.cos(angle) * r,
        y: center + Math.sin(angle) * r
      };
    });
  };

  const currentValues = axes || {
    cross_departmental: 20,
    spontaneous: 30,
    social: 25,
    creative: 15,
    exploratory: 20,
    timing_flexibility: 40
  };

  const potentialValues = {
    cross_departmental: 85,
    spontaneous: 75,
    social: 80,
    creative: 90,
    exploratory: 85,
    timing_flexibility: 70
  };

  const currentPoints = getPoints(currentValues);
  const potentialPoints = getPoints(potentialValues);

  const toPath = (points) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Grid lines
  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxR;
    return AXES_LABELS.map((_, j) => {
      const angle = (j / AXES_LABELS.length) * Math.PI * 2 - Math.PI / 2;
      return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
    });
  });

  // Axis lines + labels
  const axisEndpoints = AXES_LABELS.map((axis, i) => {
    const angle = (i / AXES_LABELS.length) * Math.PI * 2 - Math.PI / 2;
    const labelR = maxR + 28;
    return {
      x2: center + Math.cos(angle) * maxR,
      y2: center + Math.sin(angle) * maxR,
      labelX: center + Math.cos(angle) * labelR,
      labelY: center + Math.sin(angle) * labelR,
      label: axis.label
    };
  });

  return (
    <div className="fingerprint-radar">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridLevels.map((points, li) => (
          <polygon
            key={li}
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisEndpoints.map((a, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={a.x2}
            y2={a.y2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Full Potential shape (dashed outline) */}
        <polygon
          points={potentialPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* Current shape (animated via CSS transition) */}
        <polygon
          points={
            mounted
              ? currentPoints.map((p) => `${p.x},${p.y}`).join(' ')
              : currentPoints.map(() => `${center},${center}`).join(' ')
          }
          fill="rgba(123, 97, 255, 0.2)"
          stroke="rgba(123, 97, 255, 0.8)"
          strokeWidth={2}
          style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {/* Axis dots */}
        {mounted &&
          currentPoints.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="var(--accent-primary)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
            />
          ))}

        {/* Labels */}
        {axisEndpoints.map((a, i) => (
          <text
            key={i}
            x={a.labelX}
            y={a.labelY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize="11"
            fontFamily="var(--font-display)"
          >
            {a.label}
          </text>
        ))}
      </svg>

      <div className="fingerprint-radar__legend">
        <div className="fingerprint-radar__legend-item">
          <span className="fingerprint-radar__legend-dot fingerprint-radar__legend-dot--current" />
          <span>Current</span>
        </div>
        <div className="fingerprint-radar__legend-item">
          <span className="fingerprint-radar__legend-dot fingerprint-radar__legend-dot--potential" />
          <span>Full Potential</span>
        </div>
      </div>
    </div>
  );
}
