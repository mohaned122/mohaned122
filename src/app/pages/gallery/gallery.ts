import { Component, inject, signal, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { GalleryItem } from '../../models/gallery.model';
import { GalleryService } from '../../services/gallery.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';
import { Skeleton } from '../../components/skeleton/skeleton';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, TranslatePipe, Tilt3dDirective, Skeleton],
  templateUrl: './gallery.html',
})
export default class GalleryComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private galleryService = inject(GalleryService);
  gallery = signal<GalleryItem[]>([]);
  selected = signal<GalleryItem | null>(null);
  categories = signal<string[]>([]);
  activeCategory = signal<string>('all');
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
    this.sub = this.galleryService.getAll().subscribe({
      next: (items) => {
        this.gallery.set(items);
        const cats = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[];
        this.categories.set(cats);
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

  get filtered() {
    const cat = this.activeCategory();
    return cat === 'all' ? this.gallery() : this.gallery().filter((i) => i.category === cat);
  }

  filter(cat: string) {
    this.activeCategory.set(cat);
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.animateCards());
    }
  }

  openLightbox(item: GalleryItem) {
    this.selected.set(item);
  }
  closeLightbox() {
    this.selected.set(null);
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    this.animateCards();
  }

  private animateCards() {
    const cards = this.section()?.nativeElement?.querySelectorAll('.gallery-card');
    if (!cards?.length) return;
    gsap.fromTo(
      cards,
      { scale: 0.8, opacity: 0, y: 30 },
      {
        scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: this.section()?.nativeElement, start: 'top 88%', toggleActions: 'play none none reverse' },
      }
    );
    ScrollTrigger.refresh();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
