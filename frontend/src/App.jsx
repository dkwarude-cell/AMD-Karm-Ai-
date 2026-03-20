import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import React, { Suspense, lazy } from 'react';
import BottomNav from './components/layout/BottomNav';
import KarmBot from './components/chat/KarmBot';
import useOnboardingStore from './store/useOnboardingStore';
import './styles/global.css';

const Home = lazy(() => import('./pages/Home'));
const BubbleDashboard = lazy(() => import('./pages/BubbleDashboard'));
const DriftHistory = lazy(() => import('./pages/DriftHistory'));
const Explore = lazy(() => import('./pages/Explore'));
const Profile = lazy(() => import('./pages/Profile'));
const CreatorStudio = lazy(() => import('./pages/CreatorStudio'));
const Planner = lazy(() => import('./pages/Planner'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Karm AI Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: '#1c2430', background: '#f6f8fc', minHeight: '100vh' }}>
          <h2 style={{ color: '#FF6B6B' }}>Something went wrong</h2>
          <pre style={{ marginTop: 16, fontSize: 13, color: '#6b748a', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px', background: '#7B61FF', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2 }
};

function PageWrap({ children }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

function RouteFallback() {
  return (
    <div className="page-shell" aria-live="polite" aria-busy="true">
      <div className="skeleton" style={{ height: 44, width: '64%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 16, width: '42%', marginBottom: 28 }} />
      <div className="skeleton" style={{ height: 260, width: '100%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 160, width: '100%', marginBottom: 16 }} />
    </div>
  );
}

function RequireOnboarding({ children }) {
  const completed = useOnboardingStore((s) => s.completed);
  const location = useLocation();
  if (!completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<PageWrap><Onboarding /></PageWrap>} />
          <Route path="/" element={<RequireOnboarding><PageWrap><Home /></PageWrap></RequireOnboarding>} />
          <Route path="/bubble" element={<RequireOnboarding><PageWrap><BubbleDashboard /></PageWrap></RequireOnboarding>} />
          <Route path="/history" element={<RequireOnboarding><PageWrap><DriftHistory /></PageWrap></RequireOnboarding>} />
          <Route path="/explore" element={<RequireOnboarding><PageWrap><Explore /></PageWrap></RequireOnboarding>} />
          <Route path="/create" element={<RequireOnboarding><PageWrap><CreatorStudio /></PageWrap></RequireOnboarding>} />
          <Route path="/planner" element={<RequireOnboarding><PageWrap><Planner /></PageWrap></RequireOnboarding>} />
          <Route path="/profile" element={<RequireOnboarding><PageWrap><Profile /></PageWrap></RequireOnboarding>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-shell">
          <AnimatedRoutes />
          <KarmBot />
          <BottomNav />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
