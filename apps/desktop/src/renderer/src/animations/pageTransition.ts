import anime from 'animejs';

/**
 * Page enter animation
 * 
 * Animates a page element entering the viewport with a smooth fade-in
 * and upward slide motion. Uses easeOutExpo for a natural deceleration.
 * 
 * @param target - The HTML element to animate
 * @returns The anime.js animation instance
 * 
 * @example
 * ```typescript
 * const element = document.querySelector('.page');
 * pageEnter(element);
 * ```
 */
export function pageEnter(target: HTMLElement): anime.AnimeInstance {
  return anime({
    targets: target,
    opacity: [0, 1],
    translateY: ['20px', '0px'],
    easing: 'easeOutExpo',
    duration: 500
  });
}

/**
 * Page exit animation
 * 
 * Animates a page element exiting the viewport with a fade-out
 * and upward slide motion. Uses easeInQuad for a quick exit.
 * 
 * @param target - The HTML element to animate
 * @returns The anime.js animation instance
 * 
 * @example
 * ```typescript
 * const element = document.querySelector('.page');
 * pageExit(element);
 * ```
 */
export function pageExit(target: HTMLElement): anime.AnimeInstance {
  return anime({
    targets: target,
    opacity: [1, 0],
    translateY: ['0px', '-20px'],
    easing: 'easeInQuad',
    duration: 300
  });
}