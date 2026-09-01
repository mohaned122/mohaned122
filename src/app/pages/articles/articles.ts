import { Component, AfterViewInit, Inject, PLATFORM_ID, inject, signal, effect, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';
import { Skeleton } from '../../components/skeleton/skeleton';

@Component({
  selector: 'app-articles',
  imports: [RouterLink, TranslatePipe, Tilt3dDirective, Skeleton],
  templateUrl: './articles.html',
})
export class Articles implements AfterViewInit, OnDestroy {
  private articleService = inject(ArticleService);
  private seo = inject(SeoService);
  ts = inject(TranslationService);
  articles = signal<Article[]>([]);
  shakingId = signal<string | null>(null);
  loading = signal(true);
  error = signal(false);

  private sub?: { unsubscribe: () => void };

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.seo.setMeta({
      title: 'News & Articles — Mohanned Zayoud',
      description: 'Latest news and articles by Mohanned Zayoud — insights on software engineering, full-stack development, and tech entrepreneurship.',
      url: '/articles',
    });
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.error.set(false);
    this.sub?.unsubscribe();
    this.sub = this.articleService.getAll().subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          requestAnimationFrame(() => this.animateCards());
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  retry() {
    this.load();
  }

  now = signal(Date.now());

  private timer?: ReturnType<typeof setInterval>;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    this.animateCards();
    this.timer = setInterval(() => this.now.set(Date.now()), 1000);
  }

  private animateCards() {
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('.article-card');
      if (!cards.length) return;
      gsap.set(cards, { opacity: 0, y: 30 });
      gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.articles-grid', start: 'top 82%', toggleActions: 'play none none none' },
      });
      ScrollTrigger.refresh();
    });
  }

  isLocked(article: Article): boolean {
    if (!article.lockedUntil) return false;
    return new Date(article.lockedUntil).getTime() > this.now();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.timer) clearInterval(this.timer);
  }

  remaining(article: Article): string {
    if (!article.lockedUntil) return '';
    const diff = new Date(article.lockedUntil).getTime() - this.now();
    if (diff <= 0) return '';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  }

  handleClick(article: Article) {
    if (!this.isLocked(article)) return;
    this.shakingId.set(article.id!);
    setTimeout(() => this.shakingId.set(null), 600);
  }
}
