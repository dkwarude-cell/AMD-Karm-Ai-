import ProgressBar from './ProgressBar';
import './StatCard.css';

export default function StatCard({ value, label, status, progress, progressColor, icon }) {
  const statusColors = {
    red: 'var(--accent-coral)',
    yellow: 'var(--accent-gold)',
    green: 'var(--accent-mint)'
  };

  return (
    <div className="stat-card">
      {icon && <span className="stat-card__icon">{icon}</span>}
      <div className="stat-card__value gradient-text">{value}</div>
      <div className="stat-card__label">
        {label}
        {status && (
          <span
            className="stat-card__dot"
            style={{ background: statusColors[status] || statusColors.red }}
          />
        )}
      </div>
      {progress !== undefined && (
        <div className="stat-card__progress">
          <ProgressBar value={progress} color={progressColor || 'primary'} />
        </div>
      )}
    </div>
  );
}
