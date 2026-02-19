import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { OpenClawProvider } from './contexts/OpenClawContext';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import { WalletStatusCard } from './components/cards';
import OnboardingModal from './components/OnboardingModal';
import Home from './pages/Home';
import Stake from './pages/Stake';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import Coach from './pages/Coach';
import Settings from './pages/Settings';
import { useViewportScale, CANVAS_W, CANVAS_H } from './hooks/useViewportScale';

const ONBOARDING_KEY = 'streakbeast_onboarding_complete';

/**
 * Inner app component — needs to be inside HashRouter for Sidebar's useLocation
 */
function AppContent(): React.ReactElement {
  const scale = useViewportScale();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  return (
    <Layout>
      {/* Scaled canvas container */}
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
        }}
      >
        <Sidebar delay={0.15} />

        {/* Page content area — offset for sidebar */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 0,
            width: CANVAS_W - 140,
            height: CANVAS_H,
            overflow: 'hidden',
          }}
        >
          {/* Global Wallet Status — top right of every page */}
          <div style={{ position: 'absolute', right: 210, top: 15, transform: 'scale(0.9)', transformOrigin: 'top right', zIndex: 5 }}>
            <WalletStatusCard />
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>

      {/* First-launch onboarding guide */}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </Layout>
  );
}

/**
 * Main application component for StreakBeast
 */
function App(): React.ReactElement {
  return (
    <WalletProvider>
      <OpenClawProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </OpenClawProvider>
    </WalletProvider>
  );
}

export default App;