import anime from 'animejs';

/**
 * Creates a looping pulse animation on a button element using box shadow
 * 
 * The animation creates a glowing effect by cycling the box shadow from
 * transparent to a visible purple glow and back. This creates an attention-
 * grabbing pulse effect suitable for primary action buttons.
 * 
 * @param target - The HTMLElement to animate (typically a button)
 * @returns The anime.js animation instance that can be controlled (play/pause/restart)
 * 
 * @example
 * ```typescript
 * const button = document.querySelector('.primary-button');
 * const animation = buttonPulse(button);
 * 
 * // Later, to stop the animation:
 * animation.pause();
 * 
 * // To resume:
 * animation.play();
 * ```
 */
export function buttonPulse(target: HTMLElement): anime.AnimeInstance {
  return anime({
    targets: target,
    boxShadow: [
      { value: '0 0 0px rgba(108,60,225,0)' },
      { value: '0 0 20px rgba(108,60,225,0.4)' },
      { value: '0 0 0px rgba(108,60,225,0)' }
    ],
    duration: 1500,
    easing: 'easeOutCubic',
    loop: true,
    direction: 'alternate'
  });
}