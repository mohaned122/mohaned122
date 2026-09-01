import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme = signal<Theme>('dark');

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        this.theme.set(saved);
      }
      document.documentElement.classList.add(this.theme());
    }
  }

  toggle() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(next);
      localStorage.setItem('theme', next);
    }
  }
}
