import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

/** Owns one Three.js scene and releases every WebGL resource when its canvas is removed. */
@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private frameId: number | null = null;
  private lastFrameTime = 0;
  private updateCallbacks = new Set<(deltaTime: number) => void>();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  static isWebGLSupported(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  initialize(canvas: HTMLCanvasElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.dispose();
    this.scene = new THREE.Scene();
    this.canvas = canvas;
    this.scene.background = new THREE.Color(0x050816);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.resize();
    window.addEventListener('resize', this.resize);
    this.lastFrameTime = performance.now();
    this.render();
  }

  getScene(): THREE.Scene { if (!this.scene) throw new Error('Three scene has not been initialized.'); return this.scene; }
  getCamera(): THREE.PerspectiveCamera { if (!this.camera) throw new Error('Three camera has not been initialized.'); return this.camera; }

  addDefaultLighting(): void {
    const scene = this.getScene();
    scene.add(new THREE.HemisphereLight(0xb9c7ff, 0x080b1d, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(4, 7, 5);
    scene.add(key);
  }

  onUpdate(callback: (deltaTime: number) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    window.removeEventListener('resize', this.resize);
    this.updateCallbacks.clear();
    this.scene?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
      materials.forEach((material) => material.dispose());
    });
    this.renderer?.dispose();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
  }

  private resize = (): void => {
    if (!this.camera || !this.renderer) return;
    const width = this.canvas?.clientWidth || window.innerWidth;
    const height = this.canvas?.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private render = (): void => {
    if (!this.renderer || !this.scene || !this.camera) return;
    const now = performance.now();
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;
    this.updateCallbacks.forEach((callback) => callback(delta));
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.render);
  };
}
