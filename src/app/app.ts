import { Component, OnInit, Inject, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, query, animate } from '@angular/animations';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Chatbot } from './components/chatbot/chatbot';
import { AnimatedBg } from './components/animated-bg/animated-bg';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Chatbot, AnimatedBg],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('routeFlip', [
      transition('forward => *', [
        query(':enter, :leave', [
          style({ position: 'absolute', width: '100%', top: 0, left: 0 }),
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'rotateY(0deg)', opacity: 1, transformOrigin: '0% 50%' }),
          animate('350ms ease-in', style({ transform: 'rotateY(-90deg)', opacity: 0 })),
        ], { optional: true }),
        query(':enter', [
          style({ transform: 'rotateY(90deg)', opacity: 0, transformOrigin: '0% 50%' }),
          animate('350ms 150ms ease-out', style({ transform: 'rotateY(0deg)', opacity: 1 })),
        ], { optional: true }),
      ]),
      transition('backward => *', [
        query(':enter, :leave', [
          style({ position: 'absolute', width: '100%', top: 0, left: 0 }),
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'rotateY(0deg)', opacity: 1, transformOrigin: '100% 50%' }),
          animate('350ms ease-in', style({ transform: 'rotateY(90deg)', opacity: 0 })),
        ], { optional: true }),
        query(':enter', [
          style({ transform: 'rotateY(-90deg)', opacity: 0, transformOrigin: '100% 50%' }),
          animate('350ms 150ms ease-out', style({ transform: 'rotateY(0deg)', opacity: 1 })),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class App implements OnInit {
  private seo = inject(SeoService);
  routeState = 'forward';
  loading = signal(true);

  private routeOrder: string[] = ['/', '/about', '/projects', '/gallery', '/certificates', '/articles', '/contact'];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.seo.setPersonSchema();

      setTimeout(() => this.loading.set(false), 1500);

      let prev = this.router.url;
      this.routeState = 'forward';
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const curr = event.urlAfterRedirects;
          const prevIdx = this.routeOrder.indexOf(prev);
          const currIdx = this.routeOrder.indexOf(curr);
          this.routeState = currIdx >= prevIdx ? 'forward' : 'backward';
          prev = curr;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      this.loading.set(false);
    }
  }
}
