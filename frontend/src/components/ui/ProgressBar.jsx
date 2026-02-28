import { useRef, useEffect, useState } from 'react';
import './ProgressBar.css';

const COLOR_MAP = {
  primary: 'var(--accent-primary)',
  teal: 'var(--accent-secondary)',
  coral: 'var(--accent-coral)',
  mint: 'var(--accent-mint)',
  gold: 'var(--accent-gold)'
};

export default function ProgressBar({ value = 0, color = 'primary', showLabel = false, animated = true }) {
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) return;
    const timeout = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value, animated]);

  const fill = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(animatedValue, 100)}%`,
            background: fill
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label">{Math.round(value)}%</span>
      )}
    </div>
  );
}
