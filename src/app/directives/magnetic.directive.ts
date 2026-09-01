import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Directive({
  selector: '[magnetic]',
  standalone: true,
})
export class MagneticDirective implements AfterViewInit, OnDestroy {
  @Input() magneticStrength = 0.35;

  private el: HTMLElement;
  private xTo?: (v: number) => void;
  private yTo?: (v: number) => void;
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
    this.renderer.setStyle(this.el, 'will-change', 'transform');
    this.xTo = gsap.quickTo(this.el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
    this.yTo = gsap.quickTo(this.el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
    this.onMove = (e: MouseEvent) => {
      const r = this.el.getBoundingClientRect();
      this.xTo?.((e.clientX - r.left - r.width / 2) * this.magneticStrength);
      this.yTo?.((e.clientY - r.top - r.height / 2) * this.magneticStrength);
    };
    this.onLeave = () => {
      this.xTo?.(0);
      this.yTo?.(0);
    };
    this.el.addEventListener('mousemove', this.onMove);
    this.el.addEventListener('mouseleave', this.onLeave);
  }

  private cleanup() {
    if (this.onMove) this.el.removeEventListener('mousemove', this.onMove);
    if (this.onLeave) this.el.removeEventListener('mouseleave', this.onLeave);
    this.renderer.removeStyle(this.el, 'will-change');
    this.xTo = undefined;
    this.yTo = undefined;
    this.onMove = undefined;
    this.onLeave = undefined;
  }

  ngOnDestroy() {
    this.mm?.revert();
  }
}
