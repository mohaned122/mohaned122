import { Component, inject, signal, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ContactService } from '../../services/contact.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './contact.html',
})
export class Contact implements AfterViewInit {
  private contactService = inject(ContactService);
  private seo = inject(SeoService);
  ts = inject(TranslationService);
  name = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');
  sent = signal(false);
  loading = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.seo.setMeta({
      title: 'Contact — Mohanned Zayoud',
      description: 'Contact Mohanned Zayoud — software engineering student and full-stack developer from Tunisia. Send a message for project collaborations, freelance work, or professional inquiries.',
      url: '/contact',
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.set('.contact-header', { opacity: 0, y: 20 });
    gsap.set('.contact-form', { opacity: 0, y: 30, scale: 0.98 });

    gsap.to('.contact-header', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    gsap.to('.contact-form', { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: 0.2, ease: 'back.out(1.4)' });
  }

  async submit() {
    if (!this.name() || !this.email() || !this.message()) return;
    this.loading.set(true);
    try {
      await this.contactService.sendMessage({
        name: this.name(),
        email: this.email(),
        subject: this.subject() || this.ts.t('contact.subject'),
        message: this.message(),
        read: false,
        createdAt: new Date(),
      });
      this.sent.set(true);
      this.name.set('');
      this.email.set('');
      this.subject.set('');
      this.message.set('');
    } catch (err) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}
