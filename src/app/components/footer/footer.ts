import { Component, AfterViewInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class Footer implements AfterViewInit {
  ts = inject(TranslationService);
  private router = inject(Router);

  private routeOrder = ['/', '/about', '/projects', '/gallery', '/certificates', '/articles', '/contact'];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  goPrev() {
    const idx = this.routeOrder.indexOf(this.router.url);
    if (idx > 0) this.router.navigateByUrl(this.routeOrder[idx - 1]);
  }

  goNext() {
    const idx = this.routeOrder.indexOf(this.router.url);
    if (idx < this.routeOrder.length - 1) this.router.navigateByUrl(this.routeOrder[idx + 1]);
  }

  get isFirst() {
    return this.routeOrder.indexOf(this.router.url) <= 0;
  }

  get isLast() {
    return this.routeOrder.indexOf(this.router.url) >= this.routeOrder.length - 1;
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.footer-inner', { opacity: 0, y: 30, duration: 0.6, scrollTrigger: { trigger: '.footer-inner', start: 'top 90%' } });
  }
}
