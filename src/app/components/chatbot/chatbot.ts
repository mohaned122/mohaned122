import { Component, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
})
export class Chatbot implements AfterViewInit {
  @ViewChild('chatWindow') chatWindow!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  bot = inject(ChatbotService);
  inputText = '';
  quickQuestions = [
    'Who is Mohanned?',
    'What projects did he build?',
    'What technologies does he use?',
    'Why should I hire him?',
    'Show GitHub',
    'Download CV',
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.set('.chatbot-btn', { scale: 0, opacity: 0 });
    gsap.to('.chatbot-btn', {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      delay: 2,
      ease: 'back.out(2)',
    });
  }

  send() {
    if (!this.inputText.trim()) return;
    this.bot.sendMessage(this.inputText);
    this.inputText = '';
  }

  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') this.send();
  }

  scrollBottom() {
    requestAnimationFrame(() => {
      if (this.chatWindow?.nativeElement) {
        this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
      }
    });
  }
}
