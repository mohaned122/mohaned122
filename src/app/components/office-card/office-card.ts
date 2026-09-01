import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-office-card',
  imports: [],
  templateUrl: './office-card.html',
})
export class OfficeCard implements AfterViewInit, OnDestroy {
  @ViewChild('card') card!: ElementRef<HTMLElement>;

  private idle: gsap.core.Tween | null = null;
  private swing: gsap.core.Timeline | null = null;
  private reducedMotion = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.reducedMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (this.reducedMotion) return;
    gsap.set(this.card.nativeElement, { rotation: 0, transformOrigin: 'top center', willChange: 'transform' });
    this.idle = gsap.to(this.card.nativeElement, {
      rotation: 3,
      duration: 2.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  startSwing() {
    if (!this.card || this.reducedMotion) return;
    this.idle?.pause();
    this.swing?.kill();
    this.swing = gsap.timeline();
    this.swing
      .to(this.card.nativeElement, { rotation: -11, duration: 0.16, ease: 'power2.out' })
      .to(this.card.nativeElement, { rotation: 8, duration: 0.3, ease: 'sine.out' })
      .to(this.card.nativeElement, { rotation: -5, duration: 0.22, ease: 'sine.inOut' })
      .to(this.card.nativeElement, {
        rotation: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => this.idle?.play(),
      });
  }

  stopSwing() {
    this.swing?.kill();
    this.swing = null;
    if (this.idle && this.card) {
      this.idle.pause();
      gsap.to(this.card.nativeElement, {
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => this.idle?.play(),
      });
    }
  }

  ngOnDestroy() {
    this.idle?.kill();
    this.swing?.kill();
  }
}
