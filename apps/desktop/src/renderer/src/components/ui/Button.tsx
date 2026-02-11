import React, { ReactNode } from 'react';

/**
 * Props for the Button component
 */
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

/**
 * Button component with multiple variants and sizes
 * 
 * Supports primary, secondary, and ghost variants with responsive sizing.
 * Includes loading state with spinner and disabled state handling.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick
}: ButtonProps): React.ReactElement {
  // Base styles applied to all buttons
  const baseStyles = 'rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  // Variant styles
  const variantStyles = {
    primary: 'bg-accent hover:bg-accent-light text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white/60 hover:text-white'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Combine all styles
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;