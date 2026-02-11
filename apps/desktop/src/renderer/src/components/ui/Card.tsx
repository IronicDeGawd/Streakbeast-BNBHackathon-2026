import React, { ReactNode } from 'react';

/**
 * Props for the Card component
 */
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

/**
 * Glassmorphism card container component
 * 
 * A reusable card component with glassmorphism styling that fits the StreakBeast dark theme.
 * Supports optional hover effects and custom className merging.
 * 
 * @param children - Content to be rendered inside the card
 * @param className - Additional CSS classes to merge with base styles
 * @param onClick - Optional click handler
 * @param hover - Enable hover effect with accent border and shadow
 */
function Card({ children, className = '', onClick, hover = false }: CardProps): React.ReactElement {
  const baseStyles = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6';
  const hoverStyles = hover 
    ? 'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 cursor-pointer' 
    : '';
  const clickableStyles = onClick && !hover ? 'cursor-pointer' : '';
  
  const combinedClassName = `${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`.trim();

  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
}

export default Card;