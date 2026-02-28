import './Button.css';

export default function Button({ children, variant = 'primary', onClick, disabled, fullWidth, className = '', style }) {
  const classNames = [
    'drift-btn',
    `drift-btn--${variant}`,
    fullWidth ? 'drift-btn--full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
