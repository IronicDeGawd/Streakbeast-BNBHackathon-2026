import * as THREE from 'three';

/**
 * Creates a toon-shaded gradient map for cel-shading effect
 * 
 * @returns DataTexture with 4-step gradient for cartoon appearance
 */
function createGradientMap(): THREE.DataTexture {
  const colors = new Uint8Array([26, 77, 179, 255]);
  const gradientMap = new THREE.DataTexture(
    colors,
    colors.length,
    1,
    THREE.RedFormat,
    THREE.UnsignedByteType
  );
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return gradientMap;
}

/**
 * Creates a procedural 3D cartoon pet from Three.js primitives
 * 
 * The pet is built from spheres, capsules, and a tube for the tail,
 * all using MeshToonMaterial with a custom gradient map for cel-shading.
 * 
 * @returns THREE.Group containing all pet meshes, centered at origin
 */
export function createPet(): THREE.Group {
  const pet = new THREE.Group();
  const gradientMap = createGradientMap();
  
  // Main material for body parts (purple)
  const purpleMaterial = new THREE.MeshToonMaterial({
    color: 0x8B5CF6,
    gradientMap: gradientMap
  });
  
  // Body - squashed blob shape
  const bodyGeometry = new THREE.SphereGeometry(1.2, 32, 32);
  const body = new THREE.Mesh(bodyGeometry, purpleMaterial);
  body.scale.set(1, 0.9, 0.8);
  body.name = 'body';
  pet.add(body);
  
  // Head - sits on top of body
  const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  const head = new THREE.Mesh(headGeometry, purpleMaterial);
  head.position.y = 1.4;
  head.name = 'head';
  pet.add(head);
  
  // Eyes - white material
  const eyeMaterial = new THREE.MeshToonMaterial({
    color: 0xFFFFFF,
    gradientMap: gradientMap
  });
  
  // Left Eye
  const leftEyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
  leftEye.position.set(-0.25, 1.6, 0.65);
  leftEye.name = 'leftEye';
  pet.add(leftEye);
  
  // Right Eye
  const rightEyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const rightEye = new THREE.Mesh(rightEyeGeometry, eyeMaterial);
  rightEye.position.set(0.25, 1.6, 0.65);
  rightEye.name = 'rightEye';
  pet.add(rightEye);
  
  // Pupils - black material
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  
  // Left Pupil
  const leftPupilGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const leftPupil = new THREE.Mesh(leftPupilGeometry, pupilMaterial);
  leftPupil.position.set(-0.25, 1.6, 0.75);
  leftPupil.name = 'leftPupil';
  pet.add(leftPupil);
  
  // Right Pupil
  const rightPupilGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const rightPupil = new THREE.Mesh(rightPupilGeometry, pupilMaterial);
  rightPupil.position.set(0.25, 1.6, 0.75);
  rightPupil.name = 'rightPupil';
  pet.add(rightPupil);
  
  // Left Arm
  const leftArmGeometry = new THREE.CapsuleGeometry(0.15, 0.6, 8, 16);
  const leftArm = new THREE.Mesh(leftArmGeometry, purpleMaterial);
  leftArm.position.set(-1.0, 0.3, 0);
  leftArm.rotation.z = 0.5;
  leftArm.name = 'leftArm';
  pet.add(leftArm);
  
  // Right Arm
  const rightArmGeometry = new THREE.CapsuleGeometry(0.15, 0.6, 8, 16);
  const rightArm = new THREE.Mesh(rightArmGeometry, purpleMaterial);
  rightArm.position.set(1.0, 0.3, 0);
  rightArm.rotation.z = -0.5;
  rightArm.name = 'rightArm';
  pet.add(rightArm);
  
  // Left Leg
  const leftLegGeometry = new THREE.CapsuleGeometry(0.18, 0.5, 8, 16);
  const leftLeg = new THREE.Mesh(leftLegGeometry, purpleMaterial);
  leftLeg.position.set(-0.4, -1.2, 0);
  leftLeg.name = 'leftLeg';
  pet.add(leftLeg);
  
  // Right Leg
  const rightLegGeometry = new THREE.CapsuleGeometry(0.18, 0.5, 8, 16);
  const rightLeg = new THREE.Mesh(rightLegGeometry, purpleMaterial);
  rightLeg.position.set(0.4, -1.2, 0);
  rightLeg.name = 'rightLeg';
  pet.add(rightLeg);
  
  // Tail - curved tube
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.3, -0.5),
    new THREE.Vector3(0, 0.8, -0.7),
    new THREE.Vector3(0.2, 1.0, -0.6)
  ]);
  const tailGeometry = new THREE.TubeGeometry(tailCurve, 20, 0.08, 8, false);
  const tail = new THREE.Mesh(tailGeometry, purpleMaterial);
  tail.position.set(0, -0.3, -1.0);
  tail.name = 'tail';
  pet.add(tail);
  
  return pet;
}

/**
 * Retrieves a specific pet part mesh by name
 * 
 * @param pet - The pet group to search
 * @param name - Name of the mesh to find
 * @returns The mesh with the given name, or null if not found
 */
export function getPetPart(pet: THREE.Group, name: string): THREE.Mesh | null {
  const child = pet.getObjectByName(name);
  return child instanceof THREE.Mesh ? child : null;
}