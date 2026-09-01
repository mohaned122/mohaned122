import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

const BASE_URL = 'https://mohannedzayoud.web.app';
const SITE_NAME = 'Mohanned Zayoud — Portfolio';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private langLinksSet = false;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  setMeta(config: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    const fullTitle = `${config.title} | ${SITE_NAME}`;
    const pageUrl = config.url ? `${BASE_URL}${config.url}` : BASE_URL;
    const imageUrl = config.image?.startsWith('http') ? config.image : `${BASE_URL}/${config.image || 'logos/logo_site.png'}`;
    const type = config.type || 'website';

    this.title.setTitle(fullTitle);
    this.setStandardTags(fullTitle, config.description, pageUrl, imageUrl, type);
    this.setOpenGraph(fullTitle, config.description, pageUrl, imageUrl, type);
    this.setTwitterCard(fullTitle, config.description, imageUrl);
    if (!this.langLinksSet) this.setHreflang();
    this.setCanonical(pageUrl);
    this.setWebSiteSchema();
    this.setBreadcrumbSchema(config.title, pageUrl);
  }

  private setStandardTags(title: string, description: string, url: string, image: string, type: string) {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: 'Mohanned Zayoud, portfolio, full-stack developer, Angular, Firebase, Flutter, Spring Boot, Tunisia, software engineer' });
    this.meta.updateTag({ name: 'author', content: 'Mohanned Zayoud' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }

  private setOpenGraph(title: string, description: string, url: string, image: string, type: string) {
    const tags: { name: string; content: string }[] = [
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: url },
      { name: 'og:image', content: image },
      { name: 'og:image:width', content: '1200' },
      { name: 'og:image:height', content: '630' },
      { name: 'og:type', content: type },
      { name: 'og:site_name', content: SITE_NAME },
      { name: 'og:locale', content: 'en_US' },
    ];
    tags.forEach((t) => this.meta.updateTag(t));
  }

  private setTwitterCard(title: string, description: string, image: string) {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private setHreflang() {
    if (!isPlatformBrowser(this.platformId)) return;
    const langs = ['en', 'ar', 'fr'];
    langs.forEach((lang) => {
      const existing = document.querySelector(`link[hreflang="${lang}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        link.setAttribute('href', BASE_URL);
        document.head.appendChild(link);
      }
    });
    this.langLinksSet = true;
  }

  private setCanonical(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setPersonSchema() {
    if (!isPlatformBrowser(this.platformId)) return;
    const existing = document.getElementById('person-schema');
    if (existing) return;
    const json = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Mohanned Zayoud',
      givenName: 'Mohanned',
      familyName: 'Zayoud',
      alternateName: 'Mohanned Zayoud',
      jobTitle: 'Software Engineering Student',
      description: 'Full-stack developer and software engineering student from Tunisia, specializing in Angular, Firebase, Flutter, and Spring Boot.',
      url: BASE_URL,
      email: 'mohanned.zayoud@esen.tn',
      telephone: '+216 51 916 715',
      image: `${BASE_URL}/logos/logo_site.png`,
      address: { '@type': 'PostalAddress', addressCountry: 'TN' },
      sameAs: [
        'https://github.com/mohaned122',
        'https://www.linkedin.com/in/mohanned-zayoud-ab9464258/',
      ],
      knowsAbout: ['Angular', 'Firebase', 'Flutter', 'Spring Boot', 'TypeScript', 'Java', 'Symfony'],
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'person-schema';
    script.textContent = JSON.stringify(json);
    document.head.appendChild(script);
  }

  private setWebSiteSchema() {
    if (!isPlatformBrowser(this.platformId)) return;
    const existing = document.getElementById('website-schema');
    if (existing) return;
    const json = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: BASE_URL,
      description: 'Personal portfolio of Mohanned Zayoud — full-stack developer and software engineering student.',
      author: { '@type': 'Person', name: 'Mohanned Zayoud' },
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'website-schema';
    script.textContent = JSON.stringify(json);
    document.head.appendChild(script);
  }

  private setBreadcrumbSchema(title: string, url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const existing = document.getElementById('breadcrumb-schema');
    if (existing) existing.remove();
    const json = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: title, item: url },
      ],
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-schema';
    script.textContent = JSON.stringify(json);
    document.head.appendChild(script);
  }
}
