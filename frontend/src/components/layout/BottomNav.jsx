import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { path: '/', icon: '🌀', label: 'Drift' },
  { path: '/bubble', icon: '📡', label: 'Bubble' },
  { path: '/explore', icon: '🔍', label: 'Explore' },
  { path: '/create', icon: '🎨', label: 'Create' },
  { path: '/history', icon: '↩', label: 'History' },
  { path: '/profile', icon: '👤', label: 'Profile' }
];

export default function BottomNav() {
  const location = useLocation();

  // Hide nav on onboarding
  if (location.pathname === '/onboarding') return null;

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`}
          >
            <span className="bottom-nav__icon">{tab.icon}</span>
            <span className="bottom-nav__label">{tab.label}</span>
            {isActive && <span className="bottom-nav__indicator" />}
          </NavLink>
        );
      })}
    </nav>
  );
}
