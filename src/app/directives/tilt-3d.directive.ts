import {
  Directive,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Directive({
  selector: '[tilt3d]',
  standalone: true,
})
export class Tilt3dDirective implements AfterViewInit, OnDestroy {
  private el: HTMLElement;
  private onMove?: (e: MouseEvent) => void;
  private onLeave?: () => void;
  private mm?: ReturnType<typeof gsap.matchMedia>;

  constructor(
    ref: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.el = ref.nativeElement;
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.mm = gsap.matchMedia();
    this.mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      this.init();
      return () => this.cleanup();
    });
  }

  private init() {
    this.renderer.addClass(this.el, 'tilt3d');
    this.renderer.setStyle(this.el, 'will-change', 'transform');

    // Fixed 3D tilt: perspective 900, max tilt 8deg, scale 1.02 on hover
    this.el.style.setProperty('--tilt-max', '8');
    this.el.style.setProperty('--tilt-scale', '1.02');

    this.onMove = (e: MouseEvent) => this.move(e);
    this.onLeave = () => this.leave();
    this.el.addEventListener('mousemove', this.onMove);
    this.el.addEventListener('mouseleave', this.onLeave);
  }

  private move(e: MouseEvent) {
    const r = this.el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = parseFloat(this.el.style.getPropertyValue('--tilt-max') || '8');
    this.el.style.transform = `
      perspective(900px)
      rotateX(${-(py - 0.5) * 2 * max}deg)
      rotateY((px - 0.5) * 2 * max deg)
      scale(${1 + (1 - Math.abs((py - 0.5) * 2 * max) / 8) * 0.02})
    `;
    // Glare via CSS var
    if (this.el.dataset['glare'] === 'true') {
      const pxVar = (px * 100).toFixed(1);
      const pyVar = (py * 100).toFixed(1);
      this.el.style.setProperty('--gx', `${pxVar}%`);
      this.el.style.setProperty('--gy', `${pyVar}%`);
    }
  }

  private leave() {
    this.el.style.transform = '';
    this.el.style.removeProperty('will-change');
  }

  private cleanup() {
    if (this.onMove) this.el.removeEventListener('mousemove', this.onMove);
    if (this.onLeave) this.el.removeEventListener('mouseleave', this.onLeave);
    this.renderer.removeClass(this.el, 'tilt3d');
    this.renderer.removeStyle(this.el, 'will-change');
    this.onMove = undefined;
    this.onLeave = undefined;
  }

  ngOnDestroy() {
    this.mm?.revert();
  }
}