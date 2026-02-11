import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Stake from './pages/Stake';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import Coach from './pages/Coach';
import Settings from './pages/Settings';

/**
 * Main application component for StreakBeast
 * 
 * Sets up routing with HashRouter (required for Electron) and wraps the app
 * with WalletProvider for blockchain functionality. The Layout component
 * provides the app shell with navigation.
 */
function App(): React.ReactElement {
  return (
    <WalletProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </WalletProvider>
  );
}

export default App;