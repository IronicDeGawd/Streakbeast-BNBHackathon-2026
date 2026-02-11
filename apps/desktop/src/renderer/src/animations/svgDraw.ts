import anime from 'animejs';

/**
 * SVG path drawing animation
 * 
 * Animates an SVG path element by revealing it from start to finish using
 * the stroke-dashoffset technique. This creates a "drawing" effect where
 * the path appears to be drawn on screen.
 * 
 * The animation works by:
 * 1. Getting the total length of the SVG path
 * 2. Setting both strokeDasharray and strokeDashoffset to this length (hiding the path)
 * 3. Animating strokeDashoffset from the total length to 0 (revealing the path)
 * 
 * @param target - The SVG path element to animate
 * @param duration - Animation duration in milliseconds (default: 800ms)
 * @returns The anime.js animation instance
 * 
 * @example
 * ```typescript
 * const path = document.querySelector('svg path');
 * svgDraw(path);
 * 
 * // With custom duration
 * svgDraw(path, 1200);
 * ```
 */
export function svgDraw(
  target: SVGPathElement | SVGElement,
  duration: number = 800
): anime.AnimeInstance {
  const pathElement = target as SVGPathElement;
  const totalLength = pathElement.getTotalLength();

  // Set initial stroke properties to hide the path
  pathElement.style.strokeDasharray = totalLength.toString();
  pathElement.style.strokeDashoffset = totalLength.toString();

  return anime({
    targets: target,
    strokeDashoffset: [totalLength, 0],
    easing: 'easeOutExpo',
    duration
  });
}