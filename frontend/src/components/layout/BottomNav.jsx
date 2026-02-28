import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import './BottomNav.css';

/* ── SVG icon components ── */
const DriftIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M12 3C7.5 3 4 6.5 4 11c0 3.5 2 6.5 5 8l3 2 3-2c3-1.5 5-4.5 5-8 0-4.5-3.5-8-8-8z"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0}
    />
    <motion.path
      d="M12 8a3 3 0 100 6 3 3 0 000-6z"
      stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.25 : 0}
    />
    <circle cx="12" cy="11" r="1" fill="currentColor" opacity={active ? 1 : 0.5} />
  </svg>
);

const BubbleIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
    <motion.circle cx="17" cy="15" r="4" stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity={active ? 0.8 : 0.3} />
    <circle cx="17" cy="15" r="1" fill="currentColor" opacity={active ? 0.8 : 0.3} />
  </svg>
);

const ExploreIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
    <motion.polygon points="12,6 14.5,10 12,14 9.5,10" stroke="currentColor" strokeWidth="1.4"
      strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.3 : 0} />
    <motion.polygon points="12,18 9.5,14 12,10 14.5,14" stroke="currentColor" strokeWidth="1.4"
      strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
  </svg>
);

const CreateIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const HistoryIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"
      stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0}
    />
    <polyline points="12,7 12,12 15.5,14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 7.5L3 12l4 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.6"
      fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
    <motion.path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
  </svg>
);

/* ── Tab config ── */
const tabs = [
  { path: '/', icon: DriftIcon, label: 'Drift' },
  { path: '/bubble', icon: BubbleIcon, label: 'Bubble' },
  { path: '/explore', icon: ExploreIcon, label: 'Explore' },
  { path: '/create', icon: CreateIcon, label: 'Create' },
  { path: '/history', icon: HistoryIcon, label: 'History' },
  { path: '/profile', icon: ProfileIcon, label: 'Profile' },
];

/* ── Haptic feedback (if device supports) ── */
const haptic = () => {
  if (navigator.vibrate) navigator.vibrate(8);
};

export default function BottomNav() {
  const location = useLocation();
  const navRef = useRef(null);
  const tabRefs = useRef({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  /* ── Sliding pill position ── */
  const updatePill = useCallback(() => {
    const activeTab = tabRefs.current[location.pathname];
    const nav = navRef.current;
    if (activeTab && nav) {
      const navRect = nav.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setPillStyle({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [updatePill]);

  // Hide nav on onboarding
  if (location.pathname === '/onboarding') return null;

  return (
    <nav className="bottom-nav" ref={navRef}>
      {/* Glass background layer */}
      <div className="bottom-nav__glass" />

      {/* Animated sliding pill behind active tab */}
      <motion.div
        className="bottom-nav__pill"
        animate={{
          left: pillStyle.left,
          width: pillStyle.width,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />

      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            ref={(el) => { tabRefs.current[tab.path] = el; }}
            className={`bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`}
            onClick={haptic}
          >
            <motion.div
              className="bottom-nav__icon-wrap"
              animate={{
                scale: isActive ? 1 : 0.85,
                y: isActive ? -2 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Icon active={isActive} />
            </motion.div>

            <AnimatePresence mode="wait">
              {isActive && (
                <motion.span
                  className="bottom-nav__label"
                  initial={{ opacity: 0, y: 4, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  {tab.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Active glow effect */}
            {isActive && (
              <motion.div
                className="bottom-nav__glow"
                layoutId="nav-glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
