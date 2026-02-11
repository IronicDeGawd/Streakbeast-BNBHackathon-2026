import * as THREE from 'three';

/**
 * Interface for the complete Pet scene setup
 * Contains all core Three.js objects needed to render the pet
 */
export interface PetSceneSetup {
  /** The Three.js scene containing all 3D objects */
  scene: THREE.Scene;
  /** The camera used to view the scene */
  camera: THREE.PerspectiveCamera;
  /** The WebGL renderer that draws the scene */
  renderer: THREE.WebGLRenderer;
  /** Cleanup function to dispose all resources */
  dispose: () => void;
}

/**
 * Creates a gradient background texture for the scene
 * Generates a dark purple gradient from top to bottom
 * 
 * @returns THREE.CanvasTexture with gradient background
 */
function createGradientBackground(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for gradient background');
  }
  
  // Create vertical linear gradient from top to bottom
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#0F0F1A'); // Top - darker purple
  gradient.addColorStop(1, '#1A1A2E'); // Bottom - lighter purple
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Creates and configures the complete Three.js scene for the pet display
 * Sets up scene, camera, renderer, lights, and gradient background
 * 
 * @param container - The DOM element to render into
 * @returns PetSceneSetup object with scene, camera, renderer, and dispose function
 */
export function createPetScene(container: HTMLElement): PetSceneSetup {
  // 1. Create scene
  const scene = new THREE.Scene();
  
  // 2. Set scene background to dark gradient
  const backgroundTexture = createGradientBackground();
  scene.background = backgroundTexture;
  
  // 3. Create camera
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1, 5);
  camera.lookAt(0, 0.5, 0);
  
  // 4. Create renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  
  // 5. Append renderer to container
  container.appendChild(renderer.domElement);
  
  // 6. Add DirectionalLight - main light source
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // 7. Add HemisphereLight - ambient purple tint from above and dark from below
  const hemisphereLight = new THREE.HemisphereLight(0x8B5CF6, 0x0F0F1A, 0.5);
  scene.add(hemisphereLight);
  
  // 8. Add PointLight - rim/accent light
  const pointLight = new THREE.PointLight(0x8B5CF6, 0.8);
  pointLight.position.set(-3, 2, 4);
  scene.add(pointLight);
  
  /**
   * Cleanup function to dispose all resources and remove renderer from DOM
   */
  function dispose(): void {
    renderer.dispose();
    backgroundTexture.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  }
  
  return {
    scene,
    camera,
    renderer,
    dispose
  };
}