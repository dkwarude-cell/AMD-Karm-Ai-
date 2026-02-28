import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import BottomNav from './components/layout/BottomNav';
import Home from './pages/Home';
import BubbleDashboard from './pages/BubbleDashboard';
import DriftHistory from './pages/DriftHistory';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import useOnboardingStore from './store/useOnboardingStore';
import './styles/global.css';

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
        <div style={{ padding: 32, color: '#fff', background: '#0a0a0f', minHeight: '100vh' }}>
          <h2 style={{ color: '#FF6B6B' }}>Something went wrong</h2>
          <pre style={{ marginTop: 16, fontSize: 13, color: '#aaa', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px', background: '#7B61FF', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/onboarding" element={<PageWrap><Onboarding /></PageWrap>} />
        <Route path="/" element={<RequireOnboarding><PageWrap><Home /></PageWrap></RequireOnboarding>} />
        <Route path="/bubble" element={<RequireOnboarding><PageWrap><BubbleDashboard /></PageWrap></RequireOnboarding>} />
        <Route path="/history" element={<RequireOnboarding><PageWrap><DriftHistory /></PageWrap></RequireOnboarding>} />
        <Route path="/explore" element={<RequireOnboarding><PageWrap><Explore /></PageWrap></RequireOnboarding>} />
        <Route path="/profile" element={<RequireOnboarding><PageWrap><Profile /></PageWrap></RequireOnboarding>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-shell">
          <AnimatedRoutes />
          <BottomNav />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
