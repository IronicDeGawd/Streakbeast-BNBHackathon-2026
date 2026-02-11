import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

/**
 * Props for the Modal component
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal component with glassmorphism styling and smooth animations
 * 
 * A reusable modal dialog component that fits the StreakBeast dark theme.
 * Features animated entrance with opacity and scale transitions using anime.js.
 * Includes backdrop click-to-close and a styled close button.
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback function when modal is closed
 * @param title - Modal title text
 * @param children - Modal body content
 * @param className - Additional CSS classes for the modal container
 */
function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps): React.ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      anime({
        targets: modalRef.current,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 200,
        easing: 'easeOutCubic'
      });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white">{title}</h2>
          <button
            className="text-white/40 hover:text-white transition-colors duration-200"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;