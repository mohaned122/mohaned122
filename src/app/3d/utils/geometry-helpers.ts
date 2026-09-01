import * as THREE from 'three';

/**
 * Lighting presets for 3D scenes
 */
export const LIGHTING_PRESETS = {
  professional: {
    ambient: { color: 0xffffff, intensity: 0.5 },
    directional: { color: 0xffffff, intensity: 0.8, position: [5, 10, 7] },
    accent1: { color: 0x7c3aed, intensity: 0.6, position: [-5, 3, 3] }, // Purple
    accent2: { color: 0x06b6d4, intensity: 0.4, position: [5, 2, -5] }, // Cyan
  },
  dark: {
    ambient: { color: 0xffffff, intensity: 0.3 },
    directional: { color: 0xffffff, intensity: 0.6, position: [5, 10, 7] },
    accent1: { color: 0x7c3aed, intensity: 0.8, position: [-5, 3, 3] },
    accent2: { color: 0x06b6d4, intensity: 0.6, position: [5, 2, -5] },
  },
  cinematic: {
    ambient: { color: 0xffffff, intensity: 0.4 },
    directional: { color: 0xffffff, intensity: 1, position: [5, 15, 8] },
    accent1: { color: 0x7c3aed, intensity: 1, position: [-8, 5, 3] },
    accent2: { color: 0x06b6d4, intensity: 0.7, position: [8, 3, -5] },
    rim: { color: 0x22c55e, intensity: 0.5, position: [0, -5, 10] },
  },
};

/**
 * Setup lighting in a scene
 */
export function setupLighting(
  scene: THREE.Scene,
  preset: keyof typeof LIGHTING_PRESETS = 'professional'
): void {
  const config = LIGHTING_PRESETS[preset];

  // Ambient light
  const ambient = new THREE.AmbientLight(config.ambient.color, config.ambient.intensity);
  scene.add(ambient);

  // Directional light
  const directional = new THREE.DirectionalLight(config.directional.color, config.directional.intensity);
  directional.position.set(...(config.directional.position as [number, number, number]));
  scene.add(directional);

  // Accent lights
  const accent1 = new THREE.PointLight(config.accent1.color, config.accent1.intensity);
  accent1.position.set(...(config.accent1.position as [number, number, number]));
  scene.add(accent1);

  const accent2 = new THREE.PointLight(config.accent2.color, config.accent2.intensity);
  accent2.position.set(...(config.accent2.position as [number, number, number]));
  scene.add(accent2);

  // Rim light (cinematic preset)
  if ('rim' in config && config.rim) {
    const rim = new THREE.PointLight((config.rim as any).color, (config.rim as any).intensity);
    rim.position.set(...((config.rim as any).position as [number, number, number]));
    scene.add(rim);
  }
}

/**
 * Create a glowing material
 */
export function createGlowingMaterial(
  color: number,
  emissiveIntensity: number = 0.3
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    metalness: 0.3,
    roughness: 0.4,
  });
}

/**
 * Create a glass material
 */
export function createGlassMaterial(color: number = 0xffffff): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.3,
    metalness: 0.1,
    roughness: 0.2,
  });
}

/**
 * Animate value with easing
 */
export function animateValue(
  startValue: number,
  endValue: number,
  duration: number,
  callback: (value: number) => void,
  easing: (t: number) => number = (t) => t
): number {
  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / (duration * 1000), 1);
    const easedProgress = easing(progress);
    const value = startValue + (endValue - startValue) * easedProgress;

    callback(value);

    if (progress < 1) {
      return requestAnimationFrame(animate);
    }
    return 0;
  };

  return requestAnimationFrame(animate);
}

/**
 * Easing functions
 */
export const EASING = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * (t - 2)) * (2 * (t - 2)) + 1,
};

/**
 * Create a simple geometric shape
 */
export function createBox(
  width: number,
  height: number,
  depth: number,
  color: number
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.4,
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Create a simple sphere
 */
export function createSphere(radius: number, color: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.2,
    roughness: 0.5,
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Create particle system
 */
export function createParticleSystem(count: number = 100): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x7c3aed,
    size: 0.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
  });

  return new THREE.Points(geometry, material);
}
