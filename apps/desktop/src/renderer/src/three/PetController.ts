import * as THREE from 'three';
import { createPet } from './PetGeometry';
import { PetState, PET_STATE_CONFIGS, applyState, getStateFromStreak } from './PetStates';
import { idleBounce, celebrationAnimation, interactionWave } from './PetAnimations';
import { createParticleSystem, ParticleSystem } from './ParticleEffects';
import { createPetScene, PetSceneSetup } from './PetScene';

/**
 * PetController - Main orchestrator for the 3D pet display
 * 
 * Manages the complete lifecycle of the pet visualization:
 * - Creates and manages the Three.js scene
 * - Handles pet state transitions based on user activity
 * - Coordinates animations (idle, celebration, interaction)
 * - Manages particle effects for different states
 * - Runs the render loop
 * 
 * @example
 * const container = document.getElementById('pet-container');
 * const controller = new PetController(container);
 * controller.updateState(7, true); // Set to Happy state with 7-day streak
 * controller.triggerCelebration(); // Play celebration animation
 */
export class PetController {
  private sceneSetup: PetSceneSetup;
  private pet: THREE.Group;
  private currentState: PetState;
  private idle: ReturnType<typeof idleBounce>;
  private particles: ParticleSystem | null = null;
  private animationFrameId: number = 0;
  private clock: THREE.Clock;

  /**
   * Creates a new PetController instance
   * Initializes the scene, pet, and starts the render loop
   * 
   * @param container - The DOM element to render the pet into
   */
  constructor(container: HTMLElement) {
    this.sceneSetup = createPetScene(container);
    this.pet = createPet();
    this.sceneSetup.scene.add(this.pet);
    this.currentState = PetState.Neutral;
    const config = PET_STATE_CONFIGS[this.currentState];
    this.idle = idleBounce(this.pet, config.bounceAmplitude, config.animationSpeed);
    applyState(this.pet, this.currentState);
    this.clock = new THREE.Clock();
    this.startRenderLoop();
  }

  /**
   * Starts the main animation render loop
   * Updates idle animation, particles, and renders the scene each frame
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const elapsed = this.clock.getElapsedTime();
      this.idle.update(elapsed);
      if (this.particles) {
        this.particles.update(elapsed);
      }
      // Gentle Y-axis oscillation to show 3D depth
      this.pet.rotation.y = Math.sin(elapsed * 0.8) * 0.25; // ~±15° sway
      this.sceneSetup.renderer.render(this.sceneSetup.scene, this.sceneSetup.camera);
    };
    animate();
  }

  /**
   * Updates the pet's state based on user activity
   * Transitions visual appearance, animations, and particles to match the new state
   * 
   * @param streakDays - Number of consecutive active days
   * @param isActive - Whether the user is currently active
   */
  updateState(streakDays: number, isActive: boolean): void {
    const newState = getStateFromStreak(streakDays, isActive);
    if (newState !== this.currentState) {
      this.currentState = newState;
      applyState(this.pet, this.currentState);
      const config = PET_STATE_CONFIGS[this.currentState];
      this.idle.stop();
      this.idle = idleBounce(this.pet, config.bounceAmplitude, config.animationSpeed);
      // Update particles
      if (this.particles) {
        this.sceneSetup.scene.remove(this.particles.points);
        this.particles.dispose();
        this.particles = null;
      }
      const newParticles = createParticleSystem(config.particleType);
      if (newParticles) {
        this.particles = newParticles;
        this.sceneSetup.scene.add(this.particles.points);
      }
    }
  }

  /**
   * Triggers a celebration animation (jump and spin)
   * Used when the user achieves a milestone or completes a task
   */
  triggerCelebration(): void {
    const anim = celebrationAnimation(this.pet);
    anim.start();
  }

  /**
   * Triggers an interaction animation (wave)
   * Used when the user interacts with the pet
   */
  triggerInteraction(): void {
    const anim = interactionWave(this.pet);
    anim.start();
  }

  /**
   * Handles window/container resize events
   * Updates camera aspect ratio and renderer size
   * 
   * @param width - New container width in pixels
   * @param height - New container height in pixels
   */
  resize(width: number, height: number): void {
    this.sceneSetup.camera.aspect = width / height;
    this.sceneSetup.camera.updateProjectionMatrix();
    this.sceneSetup.renderer.setSize(width, height);
  }

  /**
   * Cleans up all resources and stops the render loop
   * Must be called when removing the pet from the DOM
   */
  dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    if (this.particles) {
      this.particles.dispose();
    }
    this.sceneSetup.dispose();
  }

  /**
   * Gets the current state of the pet
   * 
   * @returns The current PetState
   */
  getState(): PetState {
    return this.currentState;
  }
}