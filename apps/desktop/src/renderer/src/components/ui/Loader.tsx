import React from 'react';

/**
 * Props for the Loader component
 */
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * Loader component with spinning animation
 * 
 * A reusable loading spinner component that fits the StreakBeast dark theme.
 * Supports multiple sizes and optional loading text display.
 * 
 * @param size - Size variant: 'sm' (16px), 'md' (32px), 'lg' (48px)
 * @param className - Additional CSS classes to merge with base styles
 * @param text - Optional loading text to display below spinner
 */
function Loader({ size = 'md', className = '', text }: LoaderProps): React.ReactElement {
  // Size mappings for the spinner container
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  // SVG dimensions based on size
  const svgDimensions = {
    sm: { viewBox: 16, cx: 8, cy: 8, r: 6 },
    md: { viewBox: 32, cx: 16, cy: 16, r: 12 },
    lg: { viewBox: 48, cx: 24, cy: 24, r: 20 }
  };

  const dimensions = svgDimensions[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`.trim()}>
      <div className={`${sizeStyles[size]} animate-spin`}>
        <svg
          viewBox={`0 0 ${dimensions.viewBox} ${dimensions.viewBox}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <circle
            cx={dimensions.cx}
            cy={dimensions.cy}
            r={dimensions.r}
            stroke="#6C3CE1"
            strokeWidth="2"
            strokeDasharray="60 40"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {text && <p className="text-sm text-white/60">{text}</p>}
    </div>
  );
}

export default Loader;