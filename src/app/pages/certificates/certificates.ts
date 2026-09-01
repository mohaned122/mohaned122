import { Component, inject, signal, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NgFor, NgIf } from '@angular/common';
import { Certificate } from '../../models/certificate.model';
import { CertificateService } from '../../services/certificate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Skeleton } from '../../components/skeleton/skeleton';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [NgFor, NgIf, TranslatePipe, Skeleton],
  templateUrl: './certificates.html',
})
export default class CertificatesComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private certService = inject(CertificateService);
  certs = signal<Certificate[]>([]);
  loading = signal(true);
  error = signal(false);
  section = viewChild<ElementRef<HTMLElement>>('section');

  private sub?: { unsubscribe: () => void };

  constructor() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.error.set(false);
    this.sub?.unsubscribe();
    this.sub = this.certService.getAll().subscribe({
      next: (items) => {
        this.certs.set(items);
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

  isPdf(url: string | undefined): boolean {
    return !!url && (url.startsWith('data:application/pdf') || url.endsWith('.pdf'));
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    this.animateCards();
  }

  private animateCards() {
    const cards = this.section()?.nativeElement?.querySelectorAll('.flip-scene');
    if (!cards?.length) return;
    gsap.set(cards, { opacity: 0, y: 40, rotationX: -12, transformPerspective: 900 });
    gsap.to(cards, {
      opacity: 1, y: 0, rotationX: 0, duration: 0.7, stagger: 0.09, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: this.section()?.nativeElement, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
