import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

export interface RaycastResult {
  object: THREE.Object3D;
  point: THREE.Vector3;
  distance: number;
}

/**
 * InteractionManagerService
 * Handles mouse/pointer events and raycasting for 3D interactions.
 */
@Injectable({
  providedIn: 'root',
})
export class InteractionManagerService {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private hoverCallbacks: Map<THREE.Object3D, () => void> = new Map();
  private clickCallbacks: Map<THREE.Object3D, () => void> = new Map();
  private previousHoveredObjects: THREE.Object3D[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  /**
   * Initialize the interaction manager
   */
  initialize(scene: THREE.Scene, camera: THREE.PerspectiveCamera, canvas?: HTMLCanvasElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas ?? null;

    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.handleClick(e));
    window.addEventListener('touchmove', (e) => this.onTouchMove(e));
    window.addEventListener('touchstart', (e) => this.onTouchStart(e));
  }

  /**
   * Register hover callback for an object
   */
  onHover(object: THREE.Object3D, callback: () => void): void {
    this.hoverCallbacks.set(object, callback);
  }

  /**
   * Register click callback for an object
   */
  onClick(object: THREE.Object3D, callback: () => void): void {
    this.clickCallbacks.set(object, callback);
  }

  /**
   * Handle mouse move
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.scene || !this.camera) return;

    this.setPointer(event.clientX, event.clientY);

    this.checkIntersections();
  }

  /**
   * Handle touch move
   */
  private onTouchMove(event: TouchEvent): void {
    if (!this.scene || !this.camera || event.touches.length === 0) return;

    const touch = event.touches[0];
    this.setPointer(touch.clientX, touch.clientY);

    this.checkIntersections();
  }

  /**
   * Handle touch start
   */
  private onTouchStart(event: TouchEvent): void {
    if (!this.scene || !this.camera || event.touches.length === 0) return;

    const touch = event.touches[0];
    this.setPointer(touch.clientX, touch.clientY);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const callback = this.clickCallbacks.get(clickedObject);
      if (callback) callback();
    }
  }

  /**
   * Handle click
   */
  private handleClick(event: MouseEvent): void {
    if (!this.scene || !this.camera) return;

    this.setPointer(event.clientX, event.clientY);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const callback = this.clickCallbacks.get(clickedObject);
      if (callback) callback();
    }
  }

  /**
   * Check intersections with raycaster
   */
  private checkIntersections(): void {
    if (!this.scene || !this.camera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    // Get hovered objects
    const currentHovered: THREE.Object3D[] = [];
    for (const intersection of intersects) {
      if (this.hoverCallbacks.has(intersection.object)) {
        currentHovered.push(intersection.object);
      }
    }

    // Call callbacks for newly hovered objects
    for (const obj of currentHovered) {
      if (!this.previousHoveredObjects.includes(obj)) {
        const callback = this.hoverCallbacks.get(obj);
        if (callback) callback();
      }
    }

    this.previousHoveredObjects = currentHovered;
  }

  /**
   * Get intersected objects
   */
  getIntersections(): RaycastResult[] {
    if (!this.scene || !this.camera) return [];

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    return intersects.map((i) => ({
      object: i.object,
      point: i.point,
      distance: i.distance,
    }));
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.hoverCallbacks.clear();
    this.clickCallbacks.clear();
    this.previousHoveredObjects = [];
    this.canvas = null;
  }

  private setPointer(clientX: number, clientY: number): void {
    const rect = this.canvas?.getBoundingClientRect();
    const width = rect?.width || window.innerWidth;
    const height = rect?.height || window.innerHeight;
    const left = rect?.left || 0;
    const top = rect?.top || 0;
    this.mouse.x = ((clientX - left) / width) * 2 - 1;
    this.mouse.y = -((clientY - top) / height) * 2 + 1;
  }
}
