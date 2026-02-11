import anime from 'animejs';

/**
 * SVG path morphing animation
 * 
 * Smoothly morphs an SVG path element from one shape to another by animating
 * the 'd' attribute. The animation creates a fluid transformation between two
 * path definitions, perfect for creating dynamic shape transitions.
 * 
 * The function sets the initial path shape before starting the animation to
 * ensure a clean morph effect from the specified starting point.
 * 
 * @param target - The SVG path element to animate
 * @param fromPath - The starting SVG path definition (d attribute value)
 * @param toPath - The ending SVG path definition (d attribute value)
 * @param duration - Animation duration in milliseconds (default: 600ms)
 * @returns The anime.js animation instance for control and chaining
 * 
 * @example
 * ```typescript
 * const pathElement = document.querySelector('path');
 * const startPath = 'M10,10 L50,50 L90,10';
 * const endPath = 'M10,50 L50,10 L90,50';
 * 
 * svgMorph(pathElement, startPath, endPath, 800);
 * 
 * // With default duration
 * svgMorph(pathElement, startPath, endPath);
 * 
 * // Control the animation
 * const animation = svgMorph(pathElement, startPath, endPath);
 * animation.pause();
 * animation.restart();
 * ```
 */
export function svgMorph(
  target: SVGPathElement,
  fromPath: string,
  toPath: string,
  duration: number = 600
): anime.AnimeInstance {
  // Set initial path state
  target.setAttribute('d', fromPath);

  return anime({
    targets: target,
    d: toPath,
    easing: 'easeOutCubic',
    duration
  });
}