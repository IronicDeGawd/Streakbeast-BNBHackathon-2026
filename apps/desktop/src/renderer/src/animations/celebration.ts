import anime from 'animejs';

/**
 * Celebration animation with check mark, confetti, and reward text
 * 
 * Creates a multi-stage celebration animation using an Anime.js timeline:
 * 1. SVG check mark draws in with stroke animation
 * 2. Confetti particles scatter in random directions with stagger
 * 3. Reward text flies up with elastic bounce (if present)
 * 
 * The animation is designed to provide positive feedback for achievements,
 * task completions, or other celebratory moments in the UI.
 * 
 * @param container - The HTML element to contain the celebration animation
 * @returns The anime.js timeline instance for control and chaining
 * 
 * @example
 * ```typescript
 * const container = document.querySelector('.celebration-container');
 * const timeline = celebration(container);
 * 
 * // Control the animation
 * timeline.pause();
 * timeline.restart();
 * ```
 */
export function celebration(container: HTMLElement): anime.AnimeTimelineInstance {
  // Ensure container has relative positioning for absolute children
  container.style.position = 'relative';

  // Stage 1: Create SVG check mark
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '60');
  svg.setAttribute('height', '60');
  svg.setAttribute('viewBox', '0 0 60 60');
  svg.style.position = 'absolute';
  svg.style.left = '50%';
  svg.style.top = '50%';
  svg.style.transform = 'translate(-50%, -50%)';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M15 30 L25 40 L45 20');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#6C3CE1');
  path.setAttribute('stroke-width', '4');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(path);
  container.appendChild(svg);

  // Calculate path length for stroke animation
  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength.toString();
  path.style.strokeDashoffset = pathLength.toString();

  // Stage 2: Create confetti particles
  const confettiColors = ['#6C3CE1', '#8B5CF6', '#FFD700', '#FF6B6B', '#4ECDC4'];
  const confettiElements: HTMLElement[] = [];

  for (let i = 0; i < 12; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.borderRadius = '50%';
    confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.left = '50%';
    confetti.style.top = '50%';
    confetti.style.transform = 'translate(-50%, -50%)';
    container.appendChild(confetti);
    confettiElements.push(confetti);
  }

  // Stage 3: Find reward text element (if exists)
  const rewardText = container.querySelector('.reward-text') as HTMLElement | null;

  // Create timeline
  const timeline = anime.timeline({
    easing: 'easeOutExpo'
  });

  // Stage 1: Check mark draw-in animation
  timeline.add({
    targets: path,
    strokeDashoffset: [pathLength, 0],
    duration: 300,
    easing: 'easeOutExpo'
  });

  // Stage 2: Confetti scatter animation
  timeline.add({
    targets: confettiElements,
    translateX: () => anime.random(-100, 100),
    translateY: () => anime.random(-150, -50),
    rotate: () => anime.random(0, 360),
    opacity: [1, 0],
    scale: [1, 0],
    duration: 500,
    delay: anime.stagger(40),
    easing: 'easeOutExpo'
  }, '-=100');

  // Stage 3: Reward text fly-up animation (if element exists)
  if (rewardText) {
    timeline.add({
      targets: rewardText,
      translateY: [20, 0],
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 400,
      easing: 'easeOutElastic(1, .6)'
    }, '-=300');
  }

  return timeline;
}