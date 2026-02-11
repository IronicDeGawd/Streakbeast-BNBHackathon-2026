import * as THREE from 'three';
import { getPetPart } from './PetGeometry';

/**
 * Enum representing the different emotional states of the pet
 */
export enum PetState {
  Thriving = 'Thriving',
  Happy = 'Happy',
  Neutral = 'Neutral',
  Worried = 'Worried',
  Sad = 'Sad'
}

/**
 * Configuration interface for pet state visual properties
 */
export interface PetStateConfig {
  /** Hex color for body material */
  color: number;
  /** Pupil scale multiplier (bigger = happier) */
  eyeScale: number;
  /** Speed multiplier for idle animations */
  animationSpeed: number;
  /** Type of particle effect for this state */
  particleType: 'fire' | 'sparkle' | 'none' | 'rain';
  /** How much the pet bounces in idle animation */
  bounceAmplitude: number;
}

/**
 * Configuration map for all pet states
 * Each state has unique visual properties to reflect the pet's emotional state
 */
export const PET_STATE_CONFIGS: Record<PetState, PetStateConfig> = {
  [PetState.Thriving]: {
    color: 0xFF6B35, // orange-fire
    eyeScale: 1.3,
    animationSpeed: 1.5,
    particleType: 'fire',
    bounceAmplitude: 0.15
  },
  [PetState.Happy]: {
    color: 0x8B5CF6, // purple default
    eyeScale: 1.1,
    animationSpeed: 1.2,
    particleType: 'sparkle',
    bounceAmplitude: 0.12
  },
  [PetState.Neutral]: {
    color: 0x6B7280, // gray
    eyeScale: 1.0,
    animationSpeed: 1.0,
    particleType: 'none',
    bounceAmplitude: 0.08
  },
  [PetState.Worried]: {
    color: 0xF59E0B, // amber/yellow
    eyeScale: 0.8,
    animationSpeed: 0.7,
    particleType: 'none',
    bounceAmplitude: 0.05
  },
  [PetState.Sad]: {
    color: 0x3B82F6, // blue
    eyeScale: 0.6,
    animationSpeed: 0.4,
    particleType: 'rain',
    bounceAmplitude: 0.03
  }
};

/**
 * Determines the pet's emotional state based on streak days and activity status
 * 
 * @param streakDays - Number of consecutive days the user has been active
 * @param isActive - Whether the user is currently active
 * @returns The appropriate PetState based on the inputs
 */
export function getStateFromStreak(streakDays: number, isActive: boolean): PetState {
  if (!isActive) {
    return PetState.Sad;
  }
  
  if (streakDays >= 30) {
    return PetState.Thriving;
  }
  
  if (streakDays >= 7) {
    return PetState.Happy;
  }
  
  if (streakDays >= 1) {
    return PetState.Neutral;
  }
  
  if (streakDays === 0) {
    return PetState.Worried;
  }
  
  return PetState.Neutral;
}

/**
 * Applies visual changes to the pet based on the given state
 * Updates body color and pupil scale to reflect the emotional state
 * 
 * @param pet - The pet group to modify
 * @param state - The state to apply to the pet
 */
export function applyState(pet: THREE.Group, state: PetState): void {
  const config = PET_STATE_CONFIGS[state];
  
  // Update body color
  const body = getPetPart(pet, 'body');
  if (body && body.material instanceof THREE.MeshToonMaterial) {
    body.material.color.setHex(config.color);
  }
  
  // Update pupil scales
  const leftPupil = getPetPart(pet, 'leftPupil');
  if (leftPupil) {
    leftPupil.scale.set(config.eyeScale, config.eyeScale, config.eyeScale);
  }
  
  const rightPupil = getPetPart(pet, 'rightPupil');
  if (rightPupil) {
    rightPupil.scale.set(config.eyeScale, config.eyeScale, config.eyeScale);
  }
}