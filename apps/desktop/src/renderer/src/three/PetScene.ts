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
 * Creates and configures the complete Three.js scene for the pet display
 * Sets up scene, camera, renderer, lights, and gradient background
 * 
 * @param container - The DOM element to render into
 * @returns PetSceneSetup object with scene, camera, renderer, and dispose function
 */
export function createPetScene(container: HTMLElement): PetSceneSetup {
  // 1. Create scene
  const scene = new THREE.Scene();
  
  // 2. Transparent background — the card behind provides the gradient
  scene.background = null;
  
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
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  
  // 5. Append renderer to container
  container.appendChild(renderer.domElement);
  
  // 6. Add DirectionalLight - main light source
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 2.0);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 6b. Add a fill light from the opposite side
  const fillLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
  fillLight.position.set(-3, 3, -2);
  scene.add(fillLight);
  
  // 7. Add HemisphereLight - ambient lighting for PBR materials
  const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 1.0);
  scene.add(hemisphereLight);
  
  // 8. Add PointLight - rim/accent light
  const pointLight = new THREE.PointLight(0x8B5CF6, 1.0);
  pointLight.position.set(-3, 2, 4);
  scene.add(pointLight);

  // 9. Add ambient light to ensure PBR materials are visible
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
  scene.add(ambientLight);
  
  /**
   * Cleanup function to dispose all resources and remove renderer from DOM
   */
  function dispose(): void {
    renderer.dispose();
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