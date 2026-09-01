import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

/* ─── Aurora Mesh (Dark) ─── */
class AuroraMesh {
  private nodes: { x: number; y: number; baseX: number; baseY: number; vx: number; vy: number; size: number; alpha: number; baseAlpha: number }[] = [];
  private orbs: { x: number; y: number; radius: number; vx: number; vy: number; color: string; alpha: number; phase: number }[] = [];
  private w: number;
  private h: number;
  mouseX = -1000;
  mouseY = -1000;

  constructor(private ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.w = w;
    this.h = h;
    this.init();
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  private init() {
    const count = this.w < 768 ? 40 : 90;
    this.nodes = Array.from({ length: count }, () => {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      return { x, y, baseX: x, baseY: y, vx: 0, vy: 0, size: Math.random() * 2.5 + 1, alpha: Math.random() * 0.35 + 0.25, baseAlpha: Math.random() * 0.35 + 0.25 };
    });
    this.orbs = [
      { x: this.w * 0.2, y: this.h * 0.3, radius: 180, vx: 0.2, vy: 0.15, color: '99,102,241', alpha: 0.12, phase: 0 },
      { x: this.w * 0.8, y: this.h * 0.6, radius: 220, vx: -0.15, vy: 0.18, color: '139,92,246', alpha: 0.1, phase: 2 },
      { x: this.w * 0.5, y: this.h * 0.8, radius: 150, vx: 0.12, vy: -0.2, color: '6,182,212', alpha: 0.08, phase: 4 },
      { x: this.w * 0.7, y: this.h * 0.2, radius: 200, vx: -0.18, vy: -0.1, color: '59,130,246', alpha: 0.1, phase: 1 },
    ];
  }

  update() {
    const infl = 100;
    const ret = 0.004;
    for (const n of this.nodes) {
      const dx = this.mouseX - n.x;
      const dy = this.mouseY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < infl && dist > 0) {
        const p = (1 - dist / infl) * 0.05;
        n.vx += (dx / dist) * p;
        n.vy += (dy / dist) * p;
        n.alpha = n.baseAlpha + (1 - dist / infl) * 0.4;
      } else {
        n.alpha += (n.baseAlpha - n.alpha) * 0.03;
      }
      n.vx += (n.baseX - n.x) * ret;
      n.vy += (n.baseY - n.y) * ret;
      n.vx *= 0.95;
      n.vy *= 0.95;
      n.x += n.vx;
      n.y += n.vy;
    }
    for (const o of this.orbs) {
      const dx = this.mouseX - o.x;
      const dy = this.mouseY - o.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        const p = (1 - dist / 250) * 0.4;
        o.vx -= (dx / dist) * p;
        o.vy -= (dy / dist) * p;
      }
      o.x += o.vx;
      o.y += o.vy;
      o.phase += 0.008;
      if (o.x < -o.radius) o.x = this.w + o.radius;
      if (o.x > this.w + o.radius) o.x = -o.radius;
      if (o.y < -o.radius) o.y = this.h + o.radius;
      if (o.y > this.h + o.radius) o.y = -o.radius;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    // Orbs
    for (const o of this.orbs) {
      const pulse = 1 + Math.sin(o.phase) * 0.2;
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius * pulse);
      grad.addColorStop(0, `rgba(${o.color}, ${o.alpha})`);
      grad.addColorStop(0.4, `rgba(${o.color}, ${o.alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${o.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connections
    const cd = this.w < 768 ? 100 : 150;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cd) {
          const mx = (this.nodes[i].x + this.nodes[j].x) / 2;
          const my = (this.nodes[i].y + this.nodes[j].y) / 2;
          const md = Math.sqrt((this.mouseX - mx) ** 2 + (this.mouseY - my) ** 2);
          const boost = Math.max(0, 1 - md / 250) * 0.6;
          const a = (1 - dist / cd) * 0.3 + boost;
          ctx.strokeStyle = `rgba(99, 102, 241, ${a})`;
          ctx.lineWidth = 0.8 + boost * 2;
          ctx.beginPath();
          ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    for (const n of this.nodes) {
      const dx = this.mouseX - n.x;
      const dy = this.mouseY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - dist / 180);
      const s = n.size + glow * 5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${n.alpha + glow * 0.3})`;
      ctx.fill();
      if (glow > 0.1) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, s * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${glow * 0.15})`;
        ctx.fill();
      }
    }
  }

  destroy() {
    this.nodes.length = 0;
    this.orbs.length = 0;
  }
}

/* ─── Light Glass Mesh ─── */
class LightMesh {
  private nodes: { x: number; y: number; baseX: number; baseY: number; vx: number; vy: number; size: number; alpha: number; baseAlpha: number }[] = [];
  private orbs: { x: number; y: number; radius: number; vx: number; vy: number; color: string; alpha: number; phase: number }[] = [];
  private w: number;
  private h: number;
  mouseX = -1000;
  mouseY = -1000;

  constructor(private ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.w = w;
    this.h = h;
    this.init();
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  private init() {
    const count = this.w < 768 ? 35 : 80;
    this.nodes = Array.from({ length: count }, () => {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      return {
        x, y, baseX: x, baseY: y, vx: 0, vy: 0,
        size: Math.random() * 2 + 1.5,
        alpha: Math.random() * 0.3 + 0.2,
        baseAlpha: Math.random() * 0.3 + 0.2,
      };
    });
    this.orbs = [
      { x: this.w * 0.3, y: this.h * 0.4, radius: 200, vx: 0.2, vy: 0.12, color: '99,102,241', alpha: 0.09, phase: 0 },
      { x: this.w * 0.7, y: this.w * 0.6, radius: 240, vx: -0.18, vy: -0.15, color: '139,92,246', alpha: 0.07, phase: 2 },
      { x: this.w * 0.5, y: this.w * 0.8, radius: 180, vx: 0.1, vy: -0.2, color: '59,130,246', alpha: 0.08, phase: 4 },
    ];
  }

  update() {
    const infl = 100;
    const ret = 0.004;
    for (const n of this.nodes) {
      const dx = this.mouseX - n.x;
      const dy = this.mouseY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < infl && dist > 0) {
        const p = (1 - dist / infl) * 0.06;
        n.vx += (dx / dist) * p;
        n.vy += (dy / dist) * p;
        n.alpha = n.baseAlpha + (1 - dist / infl) * 0.5;
      } else {
        n.alpha += (n.baseAlpha - n.alpha) * 0.03;
      }
      n.vx += (n.baseX - n.x) * ret;
      n.vy += (n.baseY - n.y) * ret;
      n.vx *= 0.95;
      n.vy *= 0.95;
      n.x += n.vx;
      n.y += n.vy;
    }
    for (const o of this.orbs) {
      const dx = this.mouseX - o.x;
      const dy = this.mouseY - o.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        const p = (1 - dist / 250) * 0.4;
        o.vx -= (dx / dist) * p;
        o.vy -= (dy / dist) * p;
      }
      o.x += o.vx;
      o.y += o.vy;
      o.phase += 0.008;
      if (o.x < -o.radius) o.x = this.w + o.radius;
      if (o.x > this.w + o.radius) o.x = -o.radius;
      if (o.y < -o.radius) o.y = this.h + o.radius;
      if (o.y > this.h + o.radius) o.y = -o.radius;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    // Orbs
    for (const o of this.orbs) {
      const pulse = 1 + Math.sin(o.phase) * 0.2;
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius * pulse);
      grad.addColorStop(0, `rgba(${o.color}, ${o.alpha})`);
      grad.addColorStop(0.5, `rgba(${o.color}, ${o.alpha * 0.3})`);
      grad.addColorStop(1, `rgba(${o.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connections
    const cd = this.w < 768 ? 100 : 150;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cd) {
          const mx = (this.nodes[i].x + this.nodes[j].x) / 2;
          const my = (this.nodes[i].y + this.nodes[j].y) / 2;
          const md = Math.sqrt((this.mouseX - mx) ** 2 + (this.mouseY - my) ** 2);
          const boost = Math.max(0, 1 - md / 250) * 0.6;
          const a = (1 - dist / cd) * 0.35 + boost;
          ctx.strokeStyle = `rgba(99, 102, 241, ${a})`;
          ctx.lineWidth = 0.8 + boost * 2;
          ctx.beginPath();
          ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    for (const n of this.nodes) {
      const dx = this.mouseX - n.x;
      const dy = this.mouseY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - dist / 180);
      const s = n.size + glow * 5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37, 99, 235, ${n.alpha + glow * 0.3})`;
      ctx.fill();
      if (glow > 0.1) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, s * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${glow * 0.15})`;
        ctx.fill();
      }
    }
  }

  destroy() {
    this.nodes.length = 0;
    this.orbs.length = 0;
  }
}

/* ─── Component ─── */
@Component({
  selector: 'app-animated-bg',
  imports: [],
  templateUrl: './animated-bg.html',
})
export class AnimatedBg implements AfterViewInit, OnDestroy {
  private themeService = inject(ThemeService);
  private ctx: CanvasRenderingContext2D | null = null;
  private renderer: AuroraMesh | LightMesh | null = null;
  private animFrame = 0;
  private w = 0;
  private h = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Delay to ensure DOM is ready
    setTimeout(() => {
      const canvas = document.querySelector('app-animated-bg canvas') as HTMLCanvasElement | null;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      canvas.width = this.w * dpr;
      canvas.height = this.h * dpr;
      canvas.style.width = this.w + 'px';
      canvas.style.height = this.h + 'px';

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx = ctx;

      this.initRenderer();

      window.addEventListener('resize', () => {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        canvas.width = this.w * dpr;
        canvas.height = this.h * dpr;
        canvas.style.width = this.w + 'px';
        canvas.style.height = this.h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.renderer?.resize(this.w, this.h);
      });

      document.addEventListener('mousemove', (e: MouseEvent) => {
        if (this.renderer) {
          this.renderer.mouseX = e.clientX;
          this.renderer.mouseY = e.clientY;
        }
      });

      document.addEventListener('mouseleave', () => {
        if (this.renderer) {
          this.renderer.mouseX = -1000;
          this.renderer.mouseY = -1000;
        }
      });

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      this.animate();
    }, 0);
  }

  private initRenderer() {
    this.renderer?.destroy();
    const theme = this.themeService.theme();
    if (theme === 'dark') {
      this.renderer = new AuroraMesh(this.ctx!, this.w, this.h);
    } else {
      this.renderer = new LightMesh(this.ctx!, this.w, this.h);
    }
  }

  private animate = () => {
    // Check for theme switch each frame
    const theme = this.themeService.theme();
    const currentName = this.renderer instanceof AuroraMesh ? 'dark' : 'light';
    if (theme !== currentName) {
      this.initRenderer();
    }
    this.renderer?.update();
    this.renderer?.draw();
    this.animFrame = requestAnimationFrame(this.animate);
  };

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animFrame);
    }
    this.renderer?.destroy();
  }
}
