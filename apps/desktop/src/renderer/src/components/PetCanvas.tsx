import React, { useRef, useEffect, useCallback } from 'react';
import { PetController } from '../three/PetController';

/**
 * Props for the PetCanvas component
 */
interface PetCanvasProps {
  /** Number of consecutive active days (default: 0) */
  streakDays?: number;
  /** Whether the user is currently active (default: true) */
  isActive?: boolean;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Optional click handler for the pet container */
  onClick?: () => void;
}

/**
 * PetCanvas - React component wrapper for the Three.js pet visualization
 * 
 * This component creates a responsive 3D pet that reacts to user activity.
 * It handles:
 * - Mounting the Three.js PetController into a DOM element
 * - Responsive resizing via ResizeObserver
 * - State updates based on streak and activity props
 * - User interactions (clicks trigger wave animation)
 * 
 * @example
 * ```tsx
 * <PetCanvas
 *   streakDays={7}
 *   isActive={true}
 *   className="rounded-lg shadow-xl"
 *   onClick={() => console.log('Pet clicked!')}
 * />
 * ```
 */
function PetCanvas({ 
  streakDays = 0, 
  isActive = true, 
  className = '', 
  onClick 
}: PetCanvasProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PetController | null>(null);

  // Initialize PetController on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    const controller = new PetController(containerRef.current);
    controllerRef.current = controller;

    // Setup ResizeObserver for responsive canvas
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        controller.resize(width, height);
      }
    });
    
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // Update state when streak/active changes
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateState(streakDays, isActive);
    }
  }, [streakDays, isActive]);

  // Handle click - trigger interaction wave
  const handleClick = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.triggerInteraction();
    }
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    />
  );
}

export default PetCanvas;