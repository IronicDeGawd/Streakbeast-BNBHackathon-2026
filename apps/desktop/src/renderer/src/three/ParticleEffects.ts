import * as THREE from 'three';

/**
 * Types of particle effects available for the pet
 */
export type ParticleType = 'fire' | 'sparkle' | 'rain' | 'none';

/**
 * Interface for a particle system instance
 */
export interface ParticleSystem {
  /** The THREE.Points object containing all particles */
  points: THREE.Points;
  /** Update function called each frame with current time */
  update: (time: number) => void;
  /** Cleanup function to dispose resources */
  dispose: () => void;
}

/**
 * Creates a particle system based on the specified type
 * 
 * @param type - The type of particle effect to create
 * @param count - Optional override for particle count (defaults vary by type)
 * @returns A ParticleSystem object or null if type is 'none'
 */
export function createParticleSystem(type: ParticleType, count?: number): ParticleSystem | null {
  if (type === 'none') {
    return null;
  }

  switch (type) {
    case 'fire':
      return createFireParticles(count ?? 30);
    case 'sparkle':
      return createSparkleParticles(count ?? 40);
    case 'rain':
      return createRainParticles(count ?? 60);
    default:
      return null;
  }
}

/**
 * Creates a fire particle effect that rises upward with oscillation
 * 
 * @param count - Number of fire particles to create
 * @returns ParticleSystem with fire effect
 */
function createFireParticles(count: number): ParticleSystem {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  // Initialize particle positions and velocities
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random positions in small area around origin
    positions[i3] = (Math.random() - 0.5) * 1.0; // x in [-0.5, 0.5]
    positions[i3 + 1] = Math.random() * 2; // y in [0, 2]
    positions[i3 + 2] = (Math.random() - 0.5) * 1.0; // z in [-0.5, 0.5]
    
    // Velocities not used for fire, but initialize anyway
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xFF6B35,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);

  /**
   * Updates fire particles - move up with x oscillation, reset when too high
   */
  function update(time: number): void {
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Move y up
      positions[i3 + 1] += 0.02;
      
      // Add slight x oscillation
      positions[i3] += Math.sin(time + i) * 0.002;
      
      // Reset when particle goes too high
      if (positions[i3 + 1] > 2) {
        positions[i3 + 1] = 0;
        // Randomize x and z
        positions[i3] = (Math.random() - 0.5) * 1.0;
        positions[i3 + 2] = (Math.random() - 0.5) * 1.0;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Disposes geometry and material resources
   */
  function dispose(): void {
    geometry.dispose();
    material.dispose();
  }

  return { points, update, dispose };
}

/**
 * Creates a sparkle particle effect that twinkles and rotates
 * 
 * @param count - Number of sparkle particles to create
 * @returns ParticleSystem with sparkle effect
 */
function createSparkleParticles(count: number): ParticleSystem {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  // Initialize particles in sphere radius 2 around origin
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random position in sphere using spherical coordinates
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = Math.random() * 2;
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Velocities not used for sparkle
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xFFD700,
    size: 0.06,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);

  /**
   * Updates sparkle particles - modulate opacity and rotate
   */
  function update(time: number): void {
    // Make particles twinkle by modulating material opacity
    material.opacity = 0.3 + Math.sin(time * 3) * 0.3;
    
    // Slowly rotate the entire Points object
    points.rotation.y += 0.005;
  }

  /**
   * Disposes geometry and material resources
   */
  function dispose(): void {
    geometry.dispose();
    material.dispose();
  }

  return { points, update, dispose };
}

/**
 * Creates a rain particle effect that falls downward
 * 
 * @param count - Number of rain particles to create
 * @returns ParticleSystem with rain effect
 */
function createRainParticles(count: number): ParticleSystem {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  // Initialize rain particles
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random positions
    positions[i3] = (Math.random() - 0.5) * 4; // x in [-2, 2]
    positions[i3 + 1] = Math.random() * 4; // y in [0, 4]
    positions[i3 + 2] = (Math.random() - 0.5) * 4; // z in [-2, 2]
    
    // Velocities not used for rain
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x3B82F6,
    size: 0.04,
    transparent: true,
    opacity: 0.5
  });

  const points = new THREE.Points(geometry, material);

  /**
   * Updates rain particles - move down, reset when too low
   */
  function update(time: number): void {
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Move y down
      positions[i3 + 1] -= 0.05;
      
      // Reset when particle goes too low
      if (positions[i3 + 1] < -1) {
        positions[i3 + 1] = 4;
        // Randomize x and z
        positions[i3] = (Math.random() - 0.5) * 4;
        positions[i3 + 2] = (Math.random() - 0.5) * 4;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Disposes geometry and material resources
   */
  function dispose(): void {
    geometry.dispose();
    material.dispose();
  }

  return { points, update, dispose };
}