import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  Output,
  EventEmitter,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ThreeSceneService } from '../services/three-scene.service';
import { CameraControllerService } from '../services/camera-controller.service';
import { InteractionManagerService } from '../services/interaction-manager.service';
import { setupLighting } from '../utils/geometry-helpers';

/**
 * 3D Scene Canvas Component
 * Wrapper component for Three.js scene initialization and management.
 * This component provides the canvas element and coordinates all 3D services.
 */
@Component({
  selector: 'app-3d-scene-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas
      #canvas
      class="absolute inset-0 w-full h-full"
      style="z-index: 0; display: block;"
    ></canvas>
    <div class="relative z-10 w-full h-full pointer-events-none">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        position: relative;
        display: block;
        width: 100%;
        height: 100vh;
        overflow: hidden;
      }
    `,
  ],
})
export class Scene3dCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() sceneReady = new EventEmitter<Scene3dCanvasComponent>();

  constructor(
    private threeScene: ThreeSceneService,
    private cameraController: CameraControllerService,
    private interactionManager: InteractionManagerService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check WebGL support
    if (!ThreeSceneService.isWebGLSupported()) {
      console.warn('WebGL not supported, falling back to non-3D experience');
      return;
    }

    const canvas = this.canvasRef.nativeElement;

    // Initialize Three.js scene
    this.threeScene.initialize(canvas);

    // Add default lighting
    this.threeScene.addDefaultLighting();

    // Get initialized scene and camera
    const scene = this.threeScene.getScene();
    const camera = this.threeScene.getCamera();

    // Initialize camera controller
    this.cameraController.setCamera(camera);

    // Initialize interaction manager
    this.interactionManager.initialize(scene, camera, canvas);

    // Emit ready event
    this.sceneReady.emit(this);
  }

  /**
   * Get the Three.js scene service
   */
  getSceneService(): ThreeSceneService {
    return this.threeScene;
  }

  /**
   * Get the camera controller service
   */
  getCameraController(): CameraControllerService {
    return this.cameraController;
  }

  /**
   * Get the interaction manager service
   */
  getInteractionManager(): InteractionManagerService {
    return this.interactionManager;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  ngOnDestroy(): void {
    this.interactionManager.dispose();
    this.threeScene.dispose();
  }
}
