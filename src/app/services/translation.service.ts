import { Injectable, signal, inject, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import enData from '../../assets/i18n/en.json';

type Lang = 'en' | 'ar' | 'fr';

const en = (enData as any).default ?? enData;

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  lang = signal<Lang>('en');
  dir = signal<'ltr' | 'rtl'>('ltr');
  private translations: Record<string, string> = en;
  private ngZone = inject(NgZone);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'ar' || saved === 'fr') {
        this.lang.set(saved);
        this.dir.set(saved === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = saved;
        document.documentElement.dir = this.dir();
        this.loadTranslations(saved);
      }
    }
  }

  private async loadTranslations(lang: Lang) {
    try {
      const data: any = await import(`../../assets/i18n/${lang}.json`);
      const translations = data.default ?? data;
      if (isPlatformBrowser(this.platformId)) {
        this.ngZone.run(() => { this.translations = translations; });
      } else {
        this.translations = translations;
      }
    } catch {
      if (isPlatformBrowser(this.platformId)) {
        this.ngZone.run(() => { this.translations = {}; });
      } else {
        this.translations = {};
      }
    }
  }

  t(key: string): string {
    return this.translations[key] ?? key;
  }

  async setLang(lang: Lang) {
    this.lang.set(lang);
    this.dir.set(lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'en') {
      this.translations = en;
    } else {
      await this.loadTranslations(lang);
    }
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.lang = lang;
      document.documentElement.dir = this.dir();
      localStorage.setItem('lang', lang);
    }
  }
}
