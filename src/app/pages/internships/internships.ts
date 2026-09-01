import { Component, AfterViewInit, ElementRef, ViewChild, signal, inject, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { InternshipService } from '../../services/internship.service';
import { Internship } from '../../models/internship.model';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';
import { Skeleton } from '../../components/skeleton/skeleton';

@Component({
  selector: 'app-internships',
  imports: [RouterLink, TranslatePipe, Tilt3dDirective, Skeleton],
  templateUrl: './internships.html',
})
export class Internships implements AfterViewInit, OnDestroy {
  private internshipService = inject(InternshipService);
  private projectService = inject(ProjectService);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);
  ts = inject(TranslationService);
  internships = signal<Internship[]>([]);
  allProjects: Project[] = [];
  loading = signal(true);
  error = signal(false);

  previewUrl = signal<string | null>(null);
  safePreviewUrl = signal<SafeResourceUrl | null>(null);

  @ViewChild('grid') grid!: ElementRef;

  private sub?: { unsubscribe: () => void };

  openPreview(url: string) {
    this.previewUrl.set(url);
    this.safePreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  closePreview() {
    this.previewUrl.set(null);
    this.safePreviewUrl.set(null);
  }

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.seo.setMeta({
      title: 'Internships — Mohanned Zayoud',
      description: 'Internships and professional experience of Mohanned Zayoud — full-stack development, mobile apps, and more.',
      url: '/internships',
    });
    this.projectService.getProjects().subscribe((projects) => {
      this.allProjects = projects;
    });
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.error.set(false);
    this.sub?.unsubscribe();
    this.sub = this.internshipService.getAll().subscribe({
      next: (data) => {
        this.internships.set(data);
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

  projectTitle(id: string | undefined): string {
    if (!id) return '';
    const p = this.allProjects.find((p_) => p_.id === id);
    return p ? p['title'] : '';
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    gsap.set('.page-header', { opacity: 0, y: 20 });
    gsap.to('.page-header', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });

    this.animateCards();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private animateCards() {
    const cards = this.grid?.nativeElement?.querySelectorAll('.internship-card');
    if (!cards?.length) return;
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
    gsap.to(cards, {
      opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: this.grid.nativeElement, start: 'top 80%', toggleActions: 'play none none none' },
    });
    ScrollTrigger.refresh();
  }
}
