import * as THREE from 'three';
import { getPetPart } from './PetGeometry';

/**
 * Creates an idle bouncing animation for the pet
 * The pet gently bounces up and down while swaying its head, tail, and arms
 * 
 * @param pet - The pet group to animate
 * @param amplitude - How high the pet bounces (vertical oscillation)
 * @param speed - Speed multiplier for the animation
 * @returns Object with update and stop functions
 */
export function idleBounce(
  pet: THREE.Group,
  amplitude: number,
  speed: number
): { update: (time: number) => void; stop: () => void } {
  // Store initial positions for reset
  const initialY = pet.position.y;
  const initialHeadRotZ = 0;
  const initialTailRotZ = 0;
  const initialLeftArmRotZ = 0.5;
  const initialRightArmRotZ = -0.5;

  /**
   * Updates the idle animation based on current time
   * 
   * @param time - Current time in seconds (typically from performance.now() / 1000)
   */
  function update(time: number): void {
    // Oscillate pet vertical position
    pet.position.y = initialY + Math.sin(time * speed) * amplitude;

    // Get pet parts for animation
    const head = getPetPart(pet, 'head');
    const tail = getPetPart(pet, 'tail');
    const leftArm = getPetPart(pet, 'leftArm');
    const rightArm = getPetPart(pet, 'rightArm');

    // Slightly rotate head left/right
    if (head) {
      head.rotation.z = Math.sin(time * speed * 0.5) * 0.05;
    }

    // Gently sway the tail
    if (tail) {
      tail.rotation.z = Math.sin(time * speed * 0.7) * 0.1;
    }

    // Gently move arms
    if (leftArm) {
      leftArm.rotation.z = 0.5 + Math.sin(time * speed * 0.3) * 0.05;
    }

    if (rightArm) {
      rightArm.rotation.z = -0.5 + Math.sin(time * speed * 0.3) * -0.05;
    }
  }

  /**
   * Stops the animation and resets all transforms to initial values
   */
  function stop(): void {
    pet.position.y = initialY;

    const head = getPetPart(pet, 'head');
    const tail = getPetPart(pet, 'tail');
    const leftArm = getPetPart(pet, 'leftArm');
    const rightArm = getPetPart(pet, 'rightArm');

    if (head) {
      head.rotation.z = initialHeadRotZ;
    }

    if (tail) {
      tail.rotation.z = initialTailRotZ;
    }

    if (leftArm) {
      leftArm.rotation.z = initialLeftArmRotZ;
    }

    if (rightArm) {
      rightArm.rotation.z = initialRightArmRotZ;
    }
  }

  return { update, stop };
}

/**
 * Creates a celebration animation with a jump and spin
 * The animation runs for 1200ms total with three phases:
 * - Jump up (0-400ms)
 * - Spin while in air (400-800ms)
 * - Land back down (800-1200ms)
 * 
 * @param pet - The pet group to animate
 * @returns Object with start function to trigger the animation
 */
export function celebrationAnimation(pet: THREE.Group): { start: () => void } {
  const DURATION = 1200; // Total animation duration in ms
  const JUMP_HEIGHT = 1.5;

  /**
   * Starts the celebration animation
   */
  function start(): void {
    const startTime = performance.now();
    const initialY = pet.position.y;
    const initialRotY = pet.rotation.y;

    function animate(): void {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      if (progress < 1) {
        if (elapsed < 400) {
          // Phase 1: Jump up (0-400ms)
          const jumpProgress = elapsed / 400;
          // Ease with sine for smooth jump
          const eased = Math.sin(jumpProgress * Math.PI * 0.5);
          pet.position.y = initialY + eased * JUMP_HEIGHT;
        } else if (elapsed < 800) {
          // Phase 2: Spin while in air (400-800ms)
          const spinProgress = (elapsed - 400) / 400;
          pet.position.y = initialY + JUMP_HEIGHT;
          pet.rotation.y = initialRotY + spinProgress * Math.PI * 2;
        } else {
          // Phase 3: Land back down (800-1200ms)
          const landProgress = (elapsed - 800) / 400;
          // Ease with sine for smooth landing
          const eased = Math.sin((1 - landProgress) * Math.PI * 0.5);
          pet.position.y = initialY + eased * JUMP_HEIGHT;
          pet.rotation.y = initialRotY;
        }

        requestAnimationFrame(animate);
      } else {
        // Ensure final state
        pet.position.y = initialY;
        pet.rotation.y = initialRotY;
      }
    }

    requestAnimationFrame(animate);
  }

  return { start };
}

/**
 * Creates a waving animation for the pet's right arm
 * The arm waves twice over 800ms by oscillating between -0.5 and -1.5 radians
 * 
 * @param pet - The pet group to animate
 * @returns Object with start function to trigger the animation
 */
export function interactionWave(pet: THREE.Group): { start: () => void } {
  const DURATION = 800; // Total animation duration in ms

  /**
   * Starts the waving animation
   */
  function start(): void {
    const rightArm = getPetPart(pet, 'rightArm');
    if (!rightArm) return;

    const startTime = performance.now();
    const initialRotZ = -0.5;

    function animate(): void {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      if (progress < 1) {
        // Oscillate between -0.5 and -1.5 twice using Math.sin
        // Two full cycles over the duration: frequency = 2
        const angle = Math.sin(progress * Math.PI * 4); // 4 = 2 cycles * 2 (for full wave)
        rightArm.rotation.z = -0.5 + angle * -0.5; // -0.5 ± 0.5 = range [-1.5, -0.5]

        requestAnimationFrame(animate);
      } else {
        // Return to initial position
        rightArm.rotation.z = initialRotZ;
      }
    }

    requestAnimationFrame(animate);
  }

  return { start };
}