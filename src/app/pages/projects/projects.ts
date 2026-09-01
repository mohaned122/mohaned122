import { Component, AfterViewInit, ElementRef, ViewChild, signal, inject, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Tilt3dDirective } from '../../directives/tilt-3d.directive';
import { Skeleton } from '../../components/skeleton/skeleton';
import { ProjectVisualizerComponent } from '../../3d/components/project-visualizer.component';

@Component({
  selector: 'app-projects',
  imports: [FormsModule, RouterLink, TranslatePipe, Tilt3dDirective, Skeleton, ProjectVisualizerComponent],
  templateUrl: './projects.html',
})
export class Projects implements AfterViewInit, OnDestroy {
  private projectService = inject(ProjectService);
  private seo = inject(SeoService);
  ts = inject(TranslationService);
  projects = signal<Project[]>([]);
  filteredProjects = signal<Project[]>([]);
  searchTerm = signal('');
  selectedCategory = signal('All');
  selectedTech = signal('All');
  loading = signal(true);
  error = signal(false);
  selectedProject = signal<Project | null>(null);

  categories = signal<string[]>(['All']);
  technologies = signal<string[]>(['All']);

  @ViewChild('grid') grid!: ElementRef;
  @ViewChild('filters') filters!: ElementRef;

  private sub?: { unsubscribe: () => void };

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.seo.setMeta({
      title: 'Projects — Mohanned Zayoud',
      description: 'Portfolio projects by Mohanned Zayoud — full-stack applications built with Angular, Flutter, Spring Boot, Firebase, Symfony, and more. Browse by category or technology.',
      url: '/projects',
    });
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.error.set(false);
    this.sub?.unsubscribe();
    this.sub = this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.filteredProjects.set(data);
        this.selectedProject.set(data[0] ?? null);
        this.extractFilters(data);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          requestAnimationFrame(() => this.animateProjectCards());
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

  private extractFilters(projects: Project[]) {
    const cats = new Set<string>();
    const techs = new Set<string>();
    cats.add('All');
    techs.add('All');
    for (const p of projects) {
      if (p.category) cats.add(p.category);
      if (p.technologies) p.technologies.forEach((t) => techs.add(t));
    }
    this.categories.set(Array.from(cats));
    this.technologies.set(Array.from(techs));
  }

  applyFilters() {
    let result = this.projects();
    const term = this.searchTerm().toLowerCase();

    if (term) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.problem.toLowerCase().includes(term) ||
          p.technologies?.some((t) => t.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory() !== 'All') {
      result = result.filter((p) => p.category === this.selectedCategory());
    }

    if (this.selectedTech() !== 'All') {
      result = result.filter((p) => p.technologies?.includes(this.selectedTech()));
    }

    this.filteredProjects.set(result);
    if (!result.includes(this.selectedProject() as Project)) this.selectedProject.set(result[0] ?? null);
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
  }

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
  }

  onTechChange(tech: string) {
    this.selectedTech.set(tech);
  }

  selectProject(project: Project) {
    this.selectedProject.set(project);
  }

  private animateProjectCards() {
    const cards = this.grid?.nativeElement?.querySelectorAll('.project-card');
    if (!cards?.length) return;
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
    gsap.to(cards, {
      opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: this.grid.nativeElement, start: 'top 80%', toggleActions: 'play none none none' },
    });
    ScrollTrigger.refresh();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    gsap.set('.projects-header', { opacity: 0, y: 20 });
    gsap.set('.filter-bar', { opacity: 0, y: 16 });

    gsap.to('.projects-header', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });
    gsap.to('.filter-bar', { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 });

    this.animateProjectCards();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
