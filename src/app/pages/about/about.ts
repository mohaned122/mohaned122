import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, inject, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { ProjectService } from '../../services/project.service';
import { CertificateService } from '../../services/certificate.service';
import { EducationService } from '../../services/education.service';
import { InternshipService } from '../../services/internship.service';
import { OfficeCard } from '../../components/office-card/office-card';
import { Project } from '../../models/project.model';
import { Certificate } from '../../models/certificate.model';
import { Education } from '../../models/education.model';
import { Internship } from '../../models/internship.model';
import { CvService, CvInput } from '../../services/cv.service';
import { AboutEnvironmentComponent } from '../../3d/components/about-environment.component';

interface TimelineItem {
  id: string;
  type: 'education' | 'internship';
  title: string;
  org: string;
  orgUrl?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies: string[];
  grade?: string;
  projectId?: string;
  current: boolean;
}

@Component({
  selector: 'app-about',
  imports: [TranslatePipe, RouterLink, OfficeCard, AboutEnvironmentComponent],
  templateUrl: './about.html',
})
export class About implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('hero') hero!: ElementRef;
  @ViewChild('skills') skills!: ElementRef;
  @ViewChild('projects') projects!: ElementRef;
  @ViewChild('cert') cert!: ElementRef;
  @ViewChild('journey') journey!: ElementRef;
  @ViewChild('summaryPanel') summaryPanel!: ElementRef;
  @ViewChild('summaryBackdrop') summaryBackdrop!: ElementRef;
  @ViewChild(AboutEnvironmentComponent) about3dEnvironment?: AboutEnvironmentComponent;
  ts = inject(TranslationService);

  private seo = inject(SeoService);
  private projectService = inject(ProjectService);
  private certService = inject(CertificateService);
  private educationService = inject(EducationService);
  private internshipService = inject(InternshipService);
  router = inject(Router);
  cvService = inject(CvService);
  private cdr = inject(ChangeDetectorRef);

  randomProjects = signal<Project[]>([]);
  randomCerts = signal<Certificate[]>([]);

  projectsCount = signal(0);
  certsCount = signal(0);
  techsCount = signal(0);
  internshipsCount = signal(0);
  yearsCoding = signal(new Date().getFullYear() - 2022);

  /* ─── Typing animation ─── */
  technologyStack = [
    { name: 'Java', mark: 'J', kind: 'java', icon: 'java' },
    { name: 'TypeScript', mark: 'TS', kind: 'typescript', icon: 'typescript' },
    { name: 'Angular', mark: 'A', kind: 'angular', icon: 'angular' },
    { name: 'Flutter', mark: 'F', kind: 'flutter', icon: 'flutter' },
    { name: 'Spring Boot', mark: 'SB', kind: 'spring', icon: 'springboot' },
    { name: 'Python', mark: 'PY', kind: 'python', icon: 'python' },
    { name: 'Firebase', mark: 'FB', kind: 'firebase', icon: 'firebase' },
    { name: 'Docker', mark: 'DK', kind: 'docker', icon: 'docker' },
    { name: 'MySQL', mark: 'SQL', kind: 'mysql', icon: 'mysql' },
    { name: 'Linux', mark: 'LI', kind: 'linux', icon: 'linux' },
    { name: 'Git', mark: 'G', kind: 'git', icon: 'git' },
    { name: 'Symfony', mark: 'SF', kind: 'symfony', icon: 'symfony' },
    { name: 'JavaScript', mark: 'JS', kind: 'javascript', icon: 'javascript' },
    { name: 'Dart', mark: 'D', kind: 'dart', icon: 'dart' },
    { name: 'REST APIs', mark: 'API', kind: 'rest', icon: 'openapi' },
  ];

  techOffset = 0;
  techDirection = 'normal';

  clientComments = [
    {
      name: 'Amina Haddad',
      role: 'Product Lead',
      company: 'Northstar Studio',
      comment:
        'Mohanned translated rough ideas into a cleaner product flow and a more confident customer experience. The process felt structured, fast, and genuinely collaborative.',
      projectId: '',
    },
    {
      name: 'Youssef Ben Ali',
      role: 'Founder',
      company: 'PulseOps',
      comment:
        'He helped us move from scattered requirements to a working MVP with strong UX decisions and reliable implementation. It felt like having a senior builder on the team.',
      projectId: '',
    },
    {
      name: 'Sarra Khelifi',
      role: 'Operations Manager',
      company: 'Bloom & Co.',
      comment:
        'The communication was clear, the execution was thoughtful, and the final result feels polished enough for real customers. We saw progress quickly and confidently.',
      projectId: '',
    },
    {
      name: 'Karim Tounsi',
      role: 'Startup Mentor',
      company: 'Launchlane',
      comment:
        'He combines practical engineering thinking with a product mindset. The outcome was not only functional, but it actually helped us communicate our value better.',
      projectId: '',
    },
  ];

  getTechLogoUrl(tech: { name: string; icon?: string }): string {
    const key = tech.icon ?? tech.name.toLowerCase().replace(/\s+/g, '').replace(/\+/g, 'plus').replace(/\//g, '');
    return `https://cdn.simpleicons.org/${key}`;
  }

  getTechFallbackDataUri(name: string): string {
    const initials = name
      .split(/\s+/)
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="18" fill="#0d1220"/>
        <text x="50%" y="55%" text-anchor="middle" font-size="22" font-family="Arial, sans-serif" font-weight="700" fill="#f8fafc">${initials || '?'}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  onTechImageError(event: Event, tech: { name: string }): void {
    const target = event.target as HTMLImageElement | null;
    if (!target) return;
    target.src = this.getTechFallbackDataUri(tech.name);
    target.onerror = null;
  }

  onTechPointerMove(event: PointerEvent): void {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    this.techDirection = relativeX > rect.width / 2 ? 'reverse' : 'normal';
    const delta = ((relativeX / rect.width) - 0.5) * 120;
    this.techOffset = Math.max(-60, Math.min(60, delta));
  }

  onTechPointerLeave(): void {
    this.techDirection = 'normal';
    this.techOffset = 0;
  }

  getTimelineMedia(item: TimelineItem): string {
    const project = item.projectId ? this.allProjects.find((p) => p.id === item.projectId) : undefined;
    if (project?.image) return project.image;
    if (item.type === 'education') return 'photos/workspace.jpg';
    return 'photos/portrait.jpg';
  }

  getCommentProject(comment: { projectId?: string }) {
    return comment.projectId ? this.allProjects.find((project) => project.id === comment.projectId) : undefined;
  }

  roles = [
    'Full Stack Developer',
    'Flutter Developer',
    'Startup Builder',
    'Linux Enthusiast',
    'AI Explorer',
  ];
  displayedText = signal('');
  private roleIndex = 0;
  private charIndex = 0;
  private typingTimer?: ReturnType<typeof setInterval>;

  allProjects: Project[] = [];
  allCerts: Certificate[] = [];
  educationData = signal<Education[]>([]);
  internshipData = signal<Internship[]>([]);
  timeline = signal<TimelineItem[]>([]);
  private timelineAnimated = false;
  private rotationTimer?: ReturnType<typeof setInterval>;
  private summaryOpen = false;
  private touchDevice = false;
  private reducedMotion = false;
  private aboutScrollTrigger?: ScrollTrigger;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.seo.setMeta({
      title: 'About — Mohanned Zayoud',
      description: 'Mohanned Zayoud — Software engineering student and full-stack developer from Tunisia. Specializing in Angular, Firebase, Flutter, Spring Boot, and building scalable full-stack applications. Explore skills, projects, and certifications.',
      url: '/',
    });
  }

  ngOnInit() {
    this.projectService.getProjects().subscribe((projects) => {
      this.allProjects = projects;
      this.projectsCount.set(projects.length);
      const allTechs = new Set(projects.flatMap((p) => p.technologies));
      this.techsCount.set(allTechs.size);
      this.pickProjects();
      this.cdr.detectChanges();
      if (isPlatformBrowser(this.platformId)) ScrollTrigger.refresh();
    });

    this.certService.getAll().subscribe((certs) => {
      this.allCerts = certs;
      this.certsCount.set(certs.length);
      this.pickCerts();
      this.cdr.detectChanges();
      if (isPlatformBrowser(this.platformId)) {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => this.animateStatValue('#stat-certs', certs.length));
      }
    });

    this.educationService.getAll().subscribe((data) => {
      this.educationData.set(data);
      this.buildTimeline();
      this.cdr.detectChanges();
      if (isPlatformBrowser(this.platformId)) {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => this.animateTimeline());
      }
    });

    this.internshipService.getAll().subscribe((data) => {
      this.internshipData.set(data);
      this.internshipsCount.set(data.length);
      this.buildTimeline();
      this.cdr.detectChanges();
      if (isPlatformBrowser(this.platformId)) {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => this.animateStatValue('#stat-internships', data.length));
        requestAnimationFrame(() => this.animateTimeline());
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.rotationTimer = setInterval(() => {
        this.pickProjects();
        this.pickCerts();
      }, 10000);

      this.startTyping();
    }
  }

  private startTyping() {
    this.typingTimer = setInterval(() => {
      const current = this.roles[this.roleIndex];
      if (this.charIndex < current.length) {
        this.charIndex++;
        this.displayedText.set(current.slice(0, this.charIndex));
      } else {
        setTimeout(() => {
          this.roleIndex = (this.roleIndex + 1) % this.roles.length;
          this.charIndex = 0;
        }, 2000);
      }
    }, 60);
  }

  ngOnDestroy() {
    if (this.rotationTimer) clearInterval(this.rotationTimer);
    if (this.typingTimer) clearInterval(this.typingTimer);
    this.aboutScrollTrigger?.kill();
  }

  downloadCv() {
    const allTechs = this.allProjects.flatMap((p) => p.technologies);
    const uniqueTechs = [...new Set(allTechs)];
    const mid = Math.ceil(uniqueTechs.length / 2);
    const techs: { category: string; items: string[] }[] = [];
    if (uniqueTechs.length) {
      techs.push({ category: 'Languages & Frameworks', items: uniqueTechs.slice(0, mid) });
      techs.push({ category: 'Tools & Platforms', items: uniqueTechs.slice(mid) });
    }
    const input: CvInput = {
      name: 'Mohanned Zayoud',
      title: this.ts.t('hero.subtitle'),
      education: this.educationData(),
      internships: this.internshipData(),
      projects: this.allProjects,
      certificates: this.allCerts,
      profile: this.ts.t('about.summary.text'),
      techs,
      languages: [
        { name: 'Arabic', level: 'Native' },
        { name: 'English', level: 'Professional Working' },
        { name: 'French', level: 'Intermediate' },
      ],
      email: this.ts.t('hero.email'),
      phone: this.ts.t('hero.phone'),
      location: this.ts.t('hero.location'),
      linkedin: 'linkedin.com/in/mohanned-zayoud-ab9464258/',
      website: 'https://mohannedzayoud.web.app',
    };
    this.cvService.downloadPdf(input, this.ts.lang());
  }

  downloadMotivationLetter() {
    this.cvService.downloadMotivationLetter(this.ts.lang());
  }

  private pickProjects() {
    const shuffled = [...this.allProjects].sort(() => Math.random() - 0.5);
    this.randomProjects.set(shuffled.slice(0, 4));
    this.clientComments = this.clientComments.map((comment, index) => ({
      ...comment,
      projectId: this.allProjects[index % Math.max(this.allProjects.length, 1)]?.id ?? '',
    }));
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.animateProjectItems());
    }
  }

  private pickCerts() {
    const shuffled = [...this.allCerts].sort(() => Math.random() - 0.5);
    this.randomCerts.set(shuffled.slice(0, 3));
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.animateCertBlocks());
    }
  }

  private buildTimeline() {
    const items: TimelineItem[] = [
      ...this.educationData().map((ed) => ({
        id: `edu-${ed.id ?? ed.title}`,
        type: 'education' as const,
        title: ed.title,
        org: ed.institution,
        orgUrl: undefined,
        startDate: ed.startDate,
        endDate: ed.endDate,
        description: ed.description,
        technologies: [] as string[],
        grade: ed.grade,
        projectId: undefined,
        current: !ed.endDate,
      })),
      ...this.internshipData().map((i) => ({
        id: `int-${i.id ?? i.company}`,
        type: 'internship' as const,
        title: i.position,
        org: i.company,
        orgUrl: i.companyUrl,
        startDate: i.startDate,
        endDate: i.endDate,
        description: i.description,
        technologies: i.technologies,
        grade: undefined,
        projectId: i.projectId,
        current: !i.endDate,
      })),
    ];
    items.sort((a, b) => this.dateVal(b.startDate) - this.dateVal(a.startDate));
    this.timeline.set(items);
  }

  private dateVal(s?: string): number {
    if (!s) return 0;
    const m = s.match(/(\d{4})(?:\D+(\d{1,2}))?/);
    if (!m) return 0;
    return +m[1] * 100 + (m[2] ? +m[2] : 7);
  }

  private animateTimeline() {
    if (!isPlatformBrowser(this.platformId) || this.timelineAnimated) return;
    const el = this.journey?.nativeElement;
    const items = el?.querySelectorAll('.journey-item');
    if (!items?.length) return;
    this.timelineAnimated = true;
    gsap.set(items, { opacity: 0, x: (i) => (i % 2 === 0 ? -60 : 60), y: 24 });
    gsap.to(items, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' },
    });
    const glow = el?.querySelector('.journey-line-glow');
    if (glow) {
      gsap.set(glow, { scaleY: 0, transformOrigin: 'top center' });
      gsap.to(glow, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 65%', scrub: 0.5 },
      });
    }
    ScrollTrigger.refresh();
  }

  private animateProjectItems() {
    if (!isPlatformBrowser(this.platformId)) return;
    const items = this.projects?.nativeElement?.querySelectorAll('.project-item');
    if (!items?.length) return;
    gsap.set(items, { opacity: 0, y: 40 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: this.projects.nativeElement, start: 'top 80%', toggleActions: 'play none none none' },
    });
    ScrollTrigger.refresh();
  }

  private animateStatValue(selector: string, target: number) {
    if (!isPlatformBrowser(this.platformId) || !target) return;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    const current = parseInt(el.innerText, 10) || 0;
    if (current >= target) return;
    gsap.to(el, {
      innerText: target,
      duration: 1.5,
      ease: 'power3.out',
      snap: { innerText: 1 },
      onUpdate: () => {
        const val = Math.round(parseInt(el.innerText, 10));
        el.innerText = val + (target >= 10 ? '+' : '');
      },
      onComplete: () => {
        el.innerText = target + (target >= 10 ? '+' : '');
      },
    });
  }

  private animateCertBlocks() {
    if (!isPlatformBrowser(this.platformId)) return;
    const blocks = this.cert?.nativeElement?.querySelectorAll('.cert-block');
    if (!blocks?.length) return;
    gsap.set(blocks, { opacity: 0, y: 20 });
    gsap.to(blocks, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
      scrollTrigger: { trigger: this.cert.nativeElement, start: 'top 85%', toggleActions: 'play none none none' },
    });
    ScrollTrigger.refresh();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    this.touchDevice = window.matchMedia('(hover: none)').matches;
    this.reducedMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (!this.reducedMotion && this.about3dEnvironment) {
      this.aboutScrollTrigger = ScrollTrigger.create({
        trigger: this.hero.nativeElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => this.about3dEnvironment?.setScrollProgress(self.progress),
      });
    }

    gsap.set('.stat-number', { opacity: 0, y: 20 });
    if (this.summaryPanel) {
      gsap.set(this.summaryPanel.nativeElement, { autoAlpha: 0, y: 16, scale: 0.96 });
    }
    if (this.summaryBackdrop) {
      gsap.set(this.summaryBackdrop.nativeElement, { autoAlpha: 0 });
    }

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl.to('.hero-left', { opacity: 1, x: 0, duration: 0.8 })
      .to('.hero-right', { opacity: 1, x: 0, duration: 0.6 }, '-=0.4');

    gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
      ScrollTrigger.create({
        trigger: el.closest('.stat-item'),
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const target = parseInt(el.dataset['target'] || '0', 10);
          if (target === 0) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 });
            return;
          }
          gsap.fromTo(el, { opacity: 0, y: 20 }, {
            opacity: 1, y: 0, duration: 0.3, delay: 0.1,
            onComplete: () => {
              gsap.to(el, {
                innerText: target,
                duration: 1.5,
                ease: 'power3.out',
                snap: { innerText: 1 },
                onUpdate: () => {
                  const val = Math.round(parseInt(el.innerText, 10));
                  el.innerText = val + (target >= 10 ? '+' : '');
                },
                onComplete: () => {
                  el.innerText = target + (target >= 10 ? '+' : '');
                },
              });
            },
          });
        },
      });
    });

    const skillItems = this.skills?.nativeElement?.querySelectorAll('.skill-item');
    if (skillItems?.length) {
      gsap.to(skillItems, {
        opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: this.skills.nativeElement, start: 'top 80%', toggleActions: 'play none none none' },
      });
    }

    this.animateProjectItems();
    this.animateCertBlocks();

    /* ─── Mission Cards ─── */
    gsap.set('.mission-card', { opacity: 0, y: 30, scale: 0.95 });
    gsap.to('.mission-card', {
      opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.mission-section', start: 'top 80%', toggleActions: 'play none none none' },
    });
  }

  revealSummary() {
    if (!isPlatformBrowser(this.platformId) || this.summaryOpen) return;
    this.summaryOpen = true;
    if (this.reducedMotion) {
      gsap.set(this.summaryPanel?.nativeElement, { autoAlpha: 1 });
      gsap.set(this.summaryBackdrop?.nativeElement, { autoAlpha: 1 });
      return;
    }
    const card = this.hero?.nativeElement?.querySelector('.office-card');
    if (card) {
      gsap.to(card, { y: -24, scale: 0.92, opacity: 0.15, duration: 0.5, ease: 'power3.out' });
    }
    if (this.summaryBackdrop) {
      gsap.to(this.summaryBackdrop.nativeElement, { autoAlpha: 1, duration: 0.4 });
    }
    if (this.summaryPanel) {
      gsap.to(this.summaryPanel.nativeElement, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, delay: 0.08, ease: 'power3.out' });
    }
  }

  hideSummary() {
    if (!isPlatformBrowser(this.platformId) || !this.summaryOpen) return;
    this.summaryOpen = false;
    if (this.reducedMotion) {
      gsap.set(this.summaryPanel?.nativeElement, { autoAlpha: 0 });
      gsap.set(this.summaryBackdrop?.nativeElement, { autoAlpha: 0 });
      return;
    }
    const card = this.hero?.nativeElement?.querySelector('.office-card');
    if (card) {
      gsap.to(card, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' });
    }
    if (this.summaryBackdrop) {
      gsap.to(this.summaryBackdrop.nativeElement, { autoAlpha: 0, duration: 0.35 });
    }
    if (this.summaryPanel) {
      gsap.to(this.summaryPanel.nativeElement, { autoAlpha: 0, y: 16, scale: 0.96, duration: 0.4, ease: 'power3.out' });
    }
  }

  toggleSummary() {
    if (this.touchDevice) {
      this.summaryOpen ? this.hideSummary() : this.revealSummary();
    }
  }
}
