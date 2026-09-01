import { Component, AfterViewInit, ElementRef, ViewChild, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink],
  templateUrl: './project-detail.html',
})
export class ProjectDetail implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private seo = inject(SeoService);

  project = signal<Project | null>(null);
  loading = signal(true);
  relatedProjects = signal<Project[]>([]);
  selectedGalleryImage = signal<string | null>(null);

  @ViewChild('hero') hero!: ElementRef;
  @ViewChild('content') content!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.getProjects().subscribe((projects) => {
        const found = projects.find((p) => p.id === id);
        if (found) {
          this.project.set(found);
          this.seo.setMeta({
            title: `${found.title} — Mohanned Zayoud`,
            description: `${found.title} — ${(found.problem || found.solution || '').slice(0, 160)}. Built with ${found.technologies?.join(', ') || 'modern technologies'}.`,
            image: found.image || undefined,
            url: `/projects/${id}`,
            type: 'article',
          });
          this.relatedProjects.set(
            projects
              .filter((p) => p.id !== id && p.category === found.category)
              .slice(0, 3)
          );
        }
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  openGallery(img: string) {
    this.selectedGalleryImage.set(img);
  }

  closeGallery() {
    this.selectedGalleryImage.set(null);
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    this.animateOnLoad();
  }

  private animateOnLoad() {
    const hero = this.hero?.nativeElement;
    if (!hero) {
      requestAnimationFrame(() => this.animateOnLoad());
      return;
    }
    const content = this.content?.nativeElement;
    const sections = document.querySelectorAll('.detail-section');

    gsap.set(hero, { opacity: 0, y: 40 });
    gsap.to(hero, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

    if (sections.length && content) {
      gsap.set(sections, { opacity: 0, y: 30 });
      gsap.to(sections, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: content,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }
  }
}
