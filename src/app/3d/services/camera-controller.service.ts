import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

/**
 * CameraControllerService
 * Manages camera animations, positioning, and smooth transitions between scenes.
 */
@Injectable({
  providedIn: 'root',
})
export class CameraControllerService {
  private camera: THREE.PerspectiveCamera | null = null;
  private targetPosition = new THREE.Vector3(0, 0, 5);
  private targetLookAt = new THREE.Vector3(0, 0, 0);
  private isAnimating = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  /**
   * Set the camera reference
   */
  setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
  }

  /**
   * Smoothly animate camera to a target position and look-at point
   * @param position Target position
   * @param lookAt Target look-at point
   * @param duration Duration in seconds
   * @param onComplete Callback when animation completes
   */
  animateTo(
    position: THREE.Vector3,
    lookAt: THREE.Vector3,
    duration: number = 2,
    onComplete?: () => void
  ): void {
    if (!this.camera || !isPlatformBrowser(this.platformId)) return;

    this.isAnimating = true;
    const startPos = this.camera.position.clone();
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      if (this.camera) {
        this.camera.position.lerpVectors(startPos, position, easeProgress);
        this.camera.lookAt(lookAt);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Set camera position (immediate)
   */
  setPosition(position: THREE.Vector3): void {
    if (this.camera) {
      this.camera.position.copy(position);
    }
  }

  /**
   * Set camera look-at point (immediate)
   */
  lookAt(target: THREE.Vector3): void {
    if (this.camera) {
      this.camera.lookAt(target);
    }
  }

  /**
   * Get current camera position
   */
  getPosition(): THREE.Vector3 | null {
    return this.camera?.position.clone() ?? null;
  }

  /**
   * Check if camera is currently animating
   */
  isAnimatingCamera(): boolean {
    return this.isAnimating;
  }

  /**
   * Reset camera to default position
   */
  reset(): void {
    if (this.camera) {
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);
    }
  }
}
