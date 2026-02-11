import anime from 'animejs';

/**
 * Animates an SVG circle element to display progress using stroke animation
 * 
 * Creates a smooth circular progress animation by animating the strokeDashoffset
 * property of an SVG circle element. The circle is rotated -90 degrees to start
 * from the top (12 o'clock position) and fills clockwise as progress increases.
 * 
 * The animation works by:
 * 1. Calculating the circle's circumference from its radius
 * 2. Setting strokeDasharray to the circumference (creates dashed stroke pattern)
 * 3. Animating strokeDashoffset from full circumference to the target offset
 *    based on progress percentage
 * 
 * @param target - The SVG circle element to animate
 * @param progress - Progress value from 0 to 100 (percentage)
 * @param duration - Animation duration in milliseconds (default: 1000ms)
 * @returns The anime.js animation instance for control and chaining
 * 
 * @example
 * ```typescript
 * const circle = document.querySelector('circle');
 * progressRing(circle, 75); // Animate to 75% progress
 * 
 * // With custom duration
 * progressRing(circle, 50, 2000); // 2 second animation to 50%
 * 
 * // Control the animation
 * const animation = progressRing(circle, 100);
 * animation.pause();
 * animation.restart();
 * ```
 */
export function progressRing(
  target: SVGCircleElement,
  progress: number,
  duration: number = 1000
): anime.AnimeInstance {
  // Get the radius from the SVG circle element
  const radius = target.r.baseVal.value;
  
  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * radius;
  
  // Set the strokeDasharray to the circumference
  target.style.strokeDasharray = `${circumference}`;
  
  // Calculate the target offset based on progress (0-100)
  const offset = circumference - (progress / 100) * circumference;
  
  // Rotate the circle -90 degrees so it starts from the top
  target.style.transform = 'rotate(-90deg)';
  target.style.transformOrigin = 'center';
  
  // Animate the strokeDashoffset from full circumference to the calculated offset
  return anime({
    targets: target,
    strokeDashoffset: [circumference, offset],
    easing: 'easeOutExpo',
    duration
  });
}