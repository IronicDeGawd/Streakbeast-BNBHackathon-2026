import React, { useEffect } from 'react';

/**
 * Props for the Toast component
 */
interface ToastProps {
  /** Toast message content */
  message: string;
  /** Toast type affecting color scheme and icon */
  type?: 'success' | 'error' | 'info';
  /** Visibility state */
  isVisible: boolean;
  /** Callback when toast closes */
  onClose: () => void;
  /** Auto-dismiss duration in milliseconds */
  duration?: number;
}

/**
 * Toast notification component
 * 
 * Displays temporary notification messages with auto-dismiss functionality.
 * Supports success, error, and info variants with corresponding icons and colors.
 * Follows glassmorphism design system with backdrop blur and accent colors.
 * 
 * @param message - Notification message text
 * @param type - Toast variant (success, error, info)
 * @param isVisible - Controls toast visibility
 * @param onClose - Handler called when toast closes
 * @param duration - Auto-dismiss delay in milliseconds (default: 3000)
 */
function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000
}: ToastProps): React.ReactElement | null {
  // Return null if not visible
  if (!isVisible) {
    return null;
  }

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  // Base styles applied to all toasts
  const baseStyles = 'fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 border backdrop-blur-xl shadow-lg flex items-center gap-3 min-w-[300px]';

  // Type-specific color styles
  const typeStyles = {
    success: 'border-green-400/30 bg-green-400/10 text-green-400',
    error: 'border-red-400/30 bg-red-400/10 text-red-400',
    info: 'border-accent/30 bg-accent/10 text-accent'
  };

  // Combine styles
  const combinedClassName = `${baseStyles} ${typeStyles[type]}`;

  // Icon components based on type
  const icons = {
    success: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  };

  return (
    <div className={combinedClassName}>
      {/* Icon */}
      {icons[type]}

      {/* Message */}
      <span className="text-sm text-white flex-1">{message}</span>

      {/* Close button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default Toast;