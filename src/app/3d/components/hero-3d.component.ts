import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ThreeSceneService } from '../services/three-scene.service';
import { CameraControllerService } from '../services/camera-controller.service';
import { Scene3dCanvasComponent } from './scene-3d-canvas.component';
import { createBox, createSphere, setupLighting, EASING } from '../utils/geometry-helpers';

/**
 * Hero 3D Component
 * Displays a developer workstation environment as the hero section.
 * Includes desk, monitor, keyboard, and floating code elements.
 */
@Component({
  selector: 'app-hero-3d',
  standalone: true,
  imports: [Scene3dCanvasComponent],
  template: `
    <app-3d-scene-canvas (sceneReady)="onSceneReady($event)"></app-3d-scene-canvas>
  `,
})
export class Hero3dComponent implements OnInit, AfterViewInit, OnDestroy {
  private sceneService: ThreeSceneService | null = null;
  private cameraController: CameraControllerService | null = null;
  private unsubscribeUpdate: (() => void) | null = null;
  private workstationGroup: THREE.Group | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  /**
   * Called when 3D scene is ready
   */
  onSceneReady(canvas: Scene3dCanvasComponent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.sceneService = canvas.getSceneService();
    this.cameraController = canvas.getCameraController();

    // Build the 3D scene
    this.buildHeroScene();

    // Start animation loop
    this.startAnimations();
  }

  /**
   * Build the hero 3D environment
   */
  private buildHeroScene(): void {
    const scene = this.getScene();
    const camera = this.getCamera();
    if (!scene || !camera) return;

    // Clear default lighting and add custom
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    setupLighting(scene, 'cinematic');

    // Create workstation group
    this.workstationGroup = new THREE.Group();
    scene.add(this.workstationGroup);

    // Create desk (simple box)
    const deskGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1f,
      metalness: 0.2,
      roughness: 0.8,
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.y = 0;
    this.workstationGroup.add(desk);

    // Create monitor base
    const monitorBaseGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.3);
    const monitorBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1f,
      metalness: 0.3,
      roughness: 0.7,
    });
    const monitorBase = new THREE.Mesh(monitorBaseGeometry, monitorBaseMaterial);
    monitorBase.position.set(0, 0.15, 0);
    this.workstationGroup.add(monitorBase);

    // Create monitor screen
    const screenGeometry = new THREE.PlaneGeometry(1.5, 0.9);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.2,
      metalness: 0.8,
      roughness: 0.1,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0.7, 0.05);
    this.workstationGroup.add(screen);

    // Add glow to monitor
    const glowGeometry = new THREE.PlaneGeometry(1.55, 0.95);
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 0.7, 0.04);
    this.workstationGroup.add(glow);

    // Create keyboard
    const keyboardGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.3);
    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2f,
      metalness: 0.1,
      roughness: 0.6,
    });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.position.set(0, 0.1, 0.4);
    this.workstationGroup.add(keyboard);

    // Create floating code objects (simple cubes with glow)
    this.createFloatingCodeObjects();

    // Position camera to look at workstation
    const camera3d = this.getCamera() as THREE.PerspectiveCamera;
    if (camera3d) {
      camera3d.position.set(0, 0.5, 2);
      camera3d.lookAt(0, 0.5, 0);
    }
  }

  /**
   * Create floating code cubes
   */
  private createFloatingCodeObjects(): void {
    const scene = this.getScene();
    if (!scene || !this.workstationGroup) return;

    const codeStrings = ['<>', '{}',' []', '()'];
    const positions = [
      { x: -1.5, y: 1.2, z: 0 },
      { x: 1.2, y: 1.5, z: -0.5 },
      { x: -0.8, y: 0.8, z: 1 },
      { x: 1.5, y: 0.6, z: 0.8 },
    ];

    codeStrings.forEach((str, i) => {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.5,
        metalness: 0.2,
        roughness: 0.3,
      });
      const cube = new THREE.Mesh(geometry, material);
      const pos = positions[i];
      cube.position.set(pos.x, pos.y, pos.z);
      cube.userData['originalPosition'] = pos;
      cube.userData['floatSpeed'] = 0.5 + Math.random() * 0.3;
      cube.userData['floatHeight'] = 0.5;
      this.workstationGroup?.add(cube);
    });
  }

  /**
   * Start animations
   */
  private startAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.unsubscribeUpdate = this.getSceneService()?.onUpdate((deltaTime) => {
      if (!this.workstationGroup) return;

      // Animate floating cubes
      this.workstationGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData['originalPosition']) {
          const time = performance.now() * 0.001;
          const pos = child.userData['originalPosition'] as { x: number; y: number; z: number };
          const floatHeight = child.userData['floatHeight'] as number;
          const floatSpeed = child.userData['floatSpeed'] as number;

          child.position.y = pos.y + Math.sin(time * floatSpeed) * floatHeight;
          child.rotation.x += 0.01;
          child.rotation.y += 0.01;
        }
      });

      // Gentle workstation rotation
      if (this.workstationGroup) {
        this.workstationGroup.rotation.y = Math.sin(performance.now() * 0.0003) * 0.1;
      }
    }) || null;
  }

  /**
   * Get scene service
   */
  private getSceneService(): ThreeSceneService | null {
    return this.sceneService;
  }

  /**
   * Get scene
   */
  private getScene(): THREE.Scene | null {
    return this.sceneService?.getScene() ?? null;
  }

  /**
   * Get camera
   */
  private getCamera(): THREE.PerspectiveCamera | null {
    return this.sceneService?.getCamera() ?? null;
  }

  ngOnDestroy(): void {
    if (this.unsubscribeUpdate) {
      this.unsubscribeUpdate();
    }
  }
}
