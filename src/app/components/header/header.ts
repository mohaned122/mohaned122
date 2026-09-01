import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, HostListener, inject, signal, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { ThemeService } from '../../services/theme.service';
import { CvService } from '../../services/cv.service';
import { AdminNavService } from '../../services/admin-nav.service';

type Lang = 'en' | 'ar' | 'fr';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements AfterViewInit, OnDestroy {
  @ViewChild('nav') nav!: ElementRef;
  mobileOpen = false;
  langOpen = false;
  scrolled = false;
  router = inject(Router);
  ts = inject(TranslationService);
  themeService = inject(ThemeService);
  cvService = inject(CvService);
  adminNav = inject(AdminNavService);

  isAdmin = signal(false);
  private routerSub: Subscription;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.routerSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isAdmin.set(e.url.includes('/admin'));
      }
    });
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrolled = window.scrollY > 60;
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.set('.nav-link', { y: -16, opacity: 0 })
      .set('.nav-cta', { scale: 0.8, opacity: 0 })
      .to('.nav-link', { y: 0, opacity: 1, stagger: 0.06, duration: 0.5 })
      .to('.nav-cta', { scale: 1, opacity: 1, duration: 0.4 }, '-=0.2');
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  toggleLang() {
    this.langOpen = !this.langOpen;
  }

  setLang(lang: string) {
    this.ts.setLang(lang as Lang);
    this.langOpen = false;
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  scrollToInternships() {
    this.mobileOpen = false;
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById('internships');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempt < 20) {
        setTimeout(() => tryScroll(attempt + 1), 200);
      }
    };
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => setTimeout(() => tryScroll(), 300));
    } else {
      tryScroll();
    }
  }

  downloadCv() {
    this.cvService.downloadPdf(undefined, this.ts.lang());
  }
}
