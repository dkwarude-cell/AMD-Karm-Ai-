import './Tag.css';

export default function Tag({ children, className = '' }) {
  return (
    <span className={`drift-tag ${className}`}>
      {children}
    </span>
  );
}
