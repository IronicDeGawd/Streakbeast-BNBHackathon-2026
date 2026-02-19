/**
 * Animation hooks using anime.js for SVG cards.
 * - useBlobBreathing: subtle SVG path morph on idle
 * - useParallaxHover: layered depth shift on mouse move
 */
import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

/**
 * Perturb an SVG path's numeric values by a small random amount,
 * creating a second "breathing" target for morphing.
 * Only shifts positional values (not flags), keeping paths compatible.
 */
function perturbPath(d: string, intensity: number = 3): string {
  let i = 0;
  return d.replace(/-?\d+\.?\d*/g, (match) => {
    i++;
    // Skip every 1st value after a command letter to keep structure stable,
    // and only shift ~60% of values for organic irregularity
    if (i % 3 === 0 || Math.random() > 0.6) return match;
    const val = parseFloat(match);
    const shift = (Math.random() - 0.5) * 2 * intensity;
    return (val + shift).toFixed(2);
  });
}

/**
 * Attach a breathing morph animation to an SVG <path> element.
 * The path gently oscillates between its original shape and a perturbed variant.
 *
 * @param pathRef - ref to the SVG path element
 * @param originalD - the original `d` attribute
 * @param options - intensity (px shift), duration (ms)
 */
export function useBlobBreathing(
  pathRef: React.RefObject<SVGPathElement | null>,
  originalD: string,
  options?: { intensity?: number; duration?: number }
) {
  const { intensity = 3, duration = 5000 } = options ?? {};
  const animRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    // Pre-compute a morphed target path
    const targetD = perturbPath(originalD, intensity);

    animRef.current = anime({
      targets: el,
      d: [
        { value: targetD },
        { value: originalD },
      ],
      easing: 'easeInOutSine',
      duration,
      loop: true,
      direction: 'alternate',
    });

    return () => {
      animRef.current?.pause();
    };
  }, [originalD, intensity, duration]);
}

/**
 * Track mouse position within a container and return offset values
 * for shifting child layers in opposite directions (parallax depth).
 *
 * Returns a ref to attach to the container, and applies transforms
 * to children marked with data-depth="blob" and data-depth="body".
 */
export function useParallaxHover(maxShift: number = 3) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // Normalize to -1..1 from center
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const blobLayers = el.querySelectorAll<SVGGElement | SVGPathElement>('[data-depth="blob"]');
    const bodyLayers = el.querySelectorAll<SVGGElement | SVGPathElement>('[data-depth="body"]');

    // Blob shifts away from cursor, body shifts toward — creates separation
    blobLayers.forEach((layer) => {
      layer.style.transform = `translate(${-nx * maxShift}px, ${-ny * maxShift}px)`;
      layer.style.transition = 'transform 0.15s ease-out';
    });
    bodyLayers.forEach((layer) => {
      layer.style.transform = `translate(${nx * maxShift * 0.8}px, ${ny * maxShift * 0.8}px)`;
      layer.style.transition = 'transform 0.15s ease-out';
    });
  }, [maxShift]);

  const handleMouseLeave = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const allLayers = el.querySelectorAll<SVGGElement | SVGPathElement>('[data-depth]');
    allLayers.forEach((layer) => {
      layer.style.transform = 'translate(0, 0)';
      layer.style.transition = 'transform 0.5s ease-out';
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return containerRef;
}
