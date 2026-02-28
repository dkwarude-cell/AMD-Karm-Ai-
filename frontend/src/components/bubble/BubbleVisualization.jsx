import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './BubbleVisualization.css';

export default function BubbleVisualization({ departments = [], visited = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const size = 280;
  const center = size / 2;
  const outerR = 120;
  const innerR = 24;
  const visitedSet = new Set(visited);

  const segments = departments.map((dept, i) => {
    const angle = (i / departments.length) * Math.PI * 2 - Math.PI / 2;
    const nextAngle = ((i + 1) / departments.length) * Math.PI * 2 - Math.PI / 2;
    const isVisited = visitedSet.has(dept) || visitedSet.has(dept.split(' ')[0]);

    const midAngle = (angle + nextAngle) / 2;
    const labelR = outerR + 20;
    const labelX = center + Math.cos(midAngle) * labelR;
    const labelY = center + Math.sin(midAngle) * labelR;

    // Create arc path
    const x1 = center + Math.cos(angle) * innerR;
    const y1 = center + Math.sin(angle) * innerR;
    const x2 = center + Math.cos(angle) * outerR;
    const y2 = center + Math.sin(angle) * outerR;
    const x3 = center + Math.cos(nextAngle) * outerR;
    const y3 = center + Math.sin(nextAngle) * outerR;
    const x4 = center + Math.cos(nextAngle) * innerR;
    const y4 = center + Math.sin(nextAngle) * innerR;

    const largeArc = nextAngle - angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}`,
      'Z'
    ].join(' ');

    return { dept, path, isVisited, labelX, labelY, midAngle, index: i };
  });

  return (
    <div className="bubble-vis">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="segGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#00E5CC" />
          </linearGradient>
        </defs>

        {/* Segments */}
        {segments.map((seg, i) => (
          <motion.path
            key={seg.dept}
            d={seg.path}
            fill={
              seg.isVisited
                ? hoveredIndex === i
                  ? 'rgba(123, 97, 255, 0.7)'
                  : 'rgba(123, 97, 255, 0.4)'
                : hoveredIndex === i
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.03)'
            }
            stroke={
              seg.isVisited
                ? 'rgba(123, 97, 255, 0.6)'
                : 'rgba(255, 255, 255, 0.1)'
            }
            strokeWidth={seg.isVisited ? 1.5 : 1}
            strokeDasharray={seg.isVisited ? 'none' : '4 4'}
            filter={seg.isVisited ? 'url(#glow)' : 'none'}
            initial={{ scale: 0, opacity: 0 }}
            animate={mounted ? { scale: 1, opacity: 1 } : {}}
            transition={{
              delay: seg.isVisited ? i * 0.1 : 0.5 + i * 0.05,
              duration: 0.5,
              type: 'spring'
            }}
            style={{ transformOrigin: `${center}px ${center}px`, cursor: 'pointer' }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r={innerR - 4}
          fill="rgba(123, 97, 255, 0.8)"
          filter="url(#glow)"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="10"
          fontWeight="700"
        >
          You
        </text>
      </svg>

      {/* Tooltip on hover */}
      {hoveredIndex !== null && (
        <div className="bubble-vis__tooltip">
          <span className={segments[hoveredIndex].isVisited ? 'visited' : 'unvisited'}>
            {segments[hoveredIndex].isVisited ? '✓' : '○'}
          </span>
          {segments[hoveredIndex].dept}
        </div>
      )}
    </div>
  );
}
