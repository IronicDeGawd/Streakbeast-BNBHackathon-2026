import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Stake from './pages/Stake';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import Coach from './pages/Coach';
import Settings from './pages/Settings';
import { useViewportScale, CANVAS_W, CANVAS_H } from './hooks/useViewportScale';

/**
 * Inner app component — needs to be inside HashRouter for Sidebar's useLocation
 */
function AppContent(): React.ReactElement {
  const scale = useViewportScale();

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
    </Layout>
  );
}

/**
 * Main application component for StreakBeast
 */
function App(): React.ReactElement {
  return (
    <WalletProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </WalletProvider>
  );
}

export default App;