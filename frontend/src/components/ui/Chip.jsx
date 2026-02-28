import './Chip.css';

export default function Chip({ label, selected, onClick, removable, onRemove, icon }) {
  return (
    <button
      className={`drift-chip ${selected ? 'drift-chip--selected' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="drift-chip__icon">{icon}</span>}
      <span>{label}</span>
      {removable && (
        <span
          className="drift-chip__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          ×
        </span>
      )}
    </button>
  );
}
