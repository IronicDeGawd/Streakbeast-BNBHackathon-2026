import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * Props for the Layout component
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * Main application layout component
 * 
 * Provides the app shell with sidebar navigation, top bar, and main content area.
 * Uses Tailwind CSS for dark theme styling.
 */
function Layout({ children }: LayoutProps): React.ReactElement {
  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white font-body overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-white/10">
        <Sidebar />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex-shrink-0">
          <TopBar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;