import { Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { Scene3dCanvasComponent } from './scene-3d-canvas.component';
import { ThreeSceneService } from '../services/three-scene.service';

@Component({
  selector: 'app-about-environment',
  standalone: true,
  imports: [Scene3dCanvasComponent],
  template: '<app-3d-scene-canvas (sceneReady)="onSceneReady($event)"></app-3d-scene-canvas>',
  styles: [':host { position: fixed; inset: 0; z-index: 0; display: block; pointer-events: none; opacity: .5; } @media (max-width: 767px), (prefers-reduced-motion: reduce) { :host { display: none; } }'],
})
export class AboutEnvironmentComponent implements OnDestroy {
  private sceneService: ThreeSceneService | null = null;
  private room: THREE.Group | null = null;
  private modules: THREE.Group[] = [];
  private unsubscribeUpdate: (() => void) | null = null;
  private scrollProgress = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  onSceneReady(canvas: Scene3dCanvasComponent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.sceneService = canvas.getSceneService();
    this.buildAboutEnvironment();
  }

  setScrollProgress(progress: number): void { this.scrollProgress = THREE.MathUtils.clamp(progress, 0, 1); }

  private buildAboutEnvironment(): void {
    const scene = this.sceneService?.getScene();
    const camera = this.sceneService?.getCamera();
    if (!scene || !camera) return;
    scene.background = null;
    camera.position.set(0, 1, 9);
    camera.lookAt(0, 0, 0);
    this.room = new THREE.Group();
    scene.add(this.room);

    const grid = new THREE.GridHelper(18, 28, 0x4f46e5, 0x172554);
    grid.position.y = -2.3;
    grid.material.transparent = true;
    grid.material.opacity = .22;
    this.room.add(grid);

    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ color: 0x0b1026, transparent: true, opacity: .55 }));
    wall.position.z = -3;
    this.room.add(wall);
    this.createMissionModules();
    this.unsubscribeUpdate = this.sceneService?.onUpdate((delta) => this.animate(delta)) ?? null;
  }

  private createMissionModules(): void {
    const specs = [
      { x: -3.4, y: .8, color: 0x6366f1 }, { x: -1.1, y: -.35, color: 0x06b6d4 },
      { x: 1.2, y: .45, color: 0x8b5cf6 }, { x: 3.5, y: -.55, color: 0x22c55e },
    ];
    specs.forEach((spec, index) => {
      const group = new THREE.Group();
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.05, .11), new THREE.MeshStandardMaterial({ color: 0x10182f, emissive: spec.color, emissiveIntensity: .24, metalness: .4, roughness: .3, transparent: true, opacity: .82 }));
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry), new THREE.LineBasicMaterial({ color: spec.color, transparent: true, opacity: .8 }));
      group.add(panel, frame);
      group.position.set(spec.x, spec.y, -1.4 + index * -.12);
      group.userData = { baseY: spec.y, phase: index * 1.3, reveal: index / 5 };
      this.room?.add(group);
      this.modules.push(group);
    });
  }

  private animate(delta: number): void {
    if (!this.room) return;
    const time = performance.now() * .001;
    this.room.rotation.y = THREE.MathUtils.lerp(this.room.rotation.y, (this.scrollProgress - .5) * .12, delta * 2);
    this.modules.forEach((module) => {
      const revealAt = module.userData['reveal'] as number;
      const baseY = module.userData['baseY'] as number;
      const phase = module.userData['phase'] as number;
      const reveal = THREE.MathUtils.smoothstep(this.scrollProgress, revealAt, revealAt + .32);
      module.visible = reveal > .01;
      module.scale.setScalar(.75 + reveal * .25);
      module.position.y = baseY + Math.sin(time + phase) * .12 + (1 - reveal) * -.5;
      module.rotation.y = Math.sin(time * .55 + phase) * .08;
    });
  }

  ngOnDestroy(): void { this.unsubscribeUpdate?.(); this.modules = []; this.room = null; }
}
