import anime from 'animejs';

/**
 * Animates a number counter from 0 to a target value with a scale pulse effect
 * 
 * Creates a smooth counting animation that updates the target element's text content
 * from 0 to the specified end value. After completion, triggers a subtle scale pulse
 * effect to draw attention to the final number.
 * 
 * @param target - The HTML element to display the animated number
 * @param endValue - The final number value to count up to
 * @param duration - Animation duration in milliseconds (default: 1500ms)
 * @returns The anime.js animation instance
 * 
 * @example
 * ```typescript
 * const element = document.querySelector('.counter');
 * numberCount(element, 1000, 2000);
 * ```
 */
export function numberCount(
  target: HTMLElement,
  endValue: number,
  duration: number = 1500
): anime.AnimeInstance {
  const counter = { value: 0 };

  return anime({
    targets: counter,
    value: endValue,
    duration,
    easing: 'easeOutExpo',
    round: 1,
    update: () => {
      target.textContent = Math.round(counter.value).toString();
    },
    complete: () => {
      // Scale pulse effect after counter completes
      anime({
        targets: target,
        scale: [1, 1.15, 1],
        duration: 300,
        easing: 'easeOutCubic'
      });
    }
  });
}