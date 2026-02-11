import anime from 'animejs';

/**
 * Card reveal animation using Anime.js
 * 
 * Animates cards into view with a smooth reveal effect combining
 * opacity fade-in and upward translation. Uses staggered timing for
 * multiple elements to create a cascading reveal effect.
 * 
 * Animation properties:
 * - Opacity: 0 → 1 (fade in)
 * - TranslateY: 40px → 0 (slide up)
 * - Stagger: 80ms delay between elements
 * - Easing: easeOutExpo (smooth deceleration)
 * - Duration: 800ms
 * 
 * @param targets - CSS selector string, single HTMLElement, or array of HTMLElements to animate
 * @returns Anime.js animation instance for control and chaining
 * 
 * @example
 * ```typescript
 * // Animate all cards with class 'card'
 * cardReveal('.card');
 * 
 * // Animate specific elements
 * const cards = document.querySelectorAll('.achievement-card');
 * cardReveal(Array.from(cards));
 * 
 * // Control the animation
 * const animation = cardReveal('.stats-card');
 * animation.pause();
 * animation.restart();
 * ```
 */
export function cardReveal(
  targets: string | HTMLElement | HTMLElement[]
): anime.AnimeInstance {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [40, 0],
    delay: anime.stagger(80),
    easing: 'easeOutExpo',
    duration: 800
  });
}