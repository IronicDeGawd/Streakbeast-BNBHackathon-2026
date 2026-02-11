import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import anime from 'animejs';

/**
 * Navigation item interface
 */
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Navigation items configuration with inline SVG icons
 */
const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    path: '/stake',
    label: 'Stake',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    )
  },
  {
    path: '/leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    )
  },
  {
    path: '/achievements',
    label: 'Achievements',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  },
  {
    path: '/coach',
    label: 'Coach',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <path d="M9 14s1 1 3 1 3-1 3-1" />
      </svg>
    )
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
      </svg>
    )
  }
];

/**
 * Sidebar navigation component
 * 
 * Provides primary navigation with animated active state indicators
 * and visual feedback for user location within the app.
 */
function Sidebar(): React.ReactElement {
  const location = useLocation();
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  /**
   * Animate active indicator when location changes
   */
  useEffect(() => {
    if (activeItemRef.current) {
      anime({
        targets: activeItemRef.current,
        translateX: ['-10px', '0px'],
        opacity: [0, 1],
        easing: 'spring(1, 80, 10, 0)',
        duration: 800
      });
    }
  }, [location.pathname]);

  return (
    <div className="h-full flex flex-col bg-[#0F0F1A] py-6">
      {/* Logo Area */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-accent">
            StreakBeast
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-accent"
          >
            <path
              d="M12 2c-1.5 4-4 6-7 6 4 2 6 4.5 6 8 0-3.5 2-6 6-8-3 0-5.5-2-5-6Z"
              fill="currentColor"
            />
            <path
              d="M17 8c-1 2-2 3-4 3 2 1 3 2 3 4 0-2 1-3 3-4-2 0-3-1-2-3Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-accent/10 text-accent border-r-2 border-accent'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
              ref={isActive ? activeItemRef : null}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;