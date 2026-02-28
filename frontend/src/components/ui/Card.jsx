import './Card.css';

export default function Card({ children, glow = false, variant = 'default', className = '', onClick, style }) {
  const classNames = [
    'drift-card',
    `drift-card--${variant}`,
    glow ? 'drift-card--glow' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={onClick} style={style}>
      {variant === 'portal' && <div className="drift-card__portal-bg" />}
      {children}
    </div>
  );
}
