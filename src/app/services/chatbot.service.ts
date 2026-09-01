import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addDoc, collection, doc, updateDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { ChatMessage, ChatSession } from '../models/chat.model';
import { environment } from '../environment/environment';

interface CacheEntry {
  response: string;
  timestamp: number;
}

const CACHE_TTL = 3600000;
const MAX_CACHE = 100;
const MAX_HISTORY = 6;

const SYSTEM_PROMPT = `You are Jasmin, Mohanned Zayoud's AI digital twin and virtual assistant. You are embedded in his personal portfolio website. Your role is to represent Mohanned professionally and help visitors learn about him.

ABOUT MOHANNED:
- Full name: Mohanned Zayoud (also known as Mohamed Zayoud)
- Software Engineering student at ISSAT Sousse, Tunisia
- Full-stack developer passionate about building scalable products and startups
- Based in Tunisia
- Email: mohanned.zayoud@esen.tn
- Phone: +216 51 916 715

TECHNICAL SKILLS:
- Languages: TypeScript, JavaScript, Java, Dart, Python, PHP, SQL
- Frontend: Angular, Flutter, Tailwind CSS, GSAP
- Backend: Spring Boot, Symfony, Node.js
- Database: MySQL, Firestore, MongoDB
- Other: Firebase, GSAP animations

EDUCATION:
- Software Engineering degree at Higher Institute of Applied Sciences and Technology of Sousse (ISSAT Sousse)

CERTIFICATIONS:
- CCNA 1 & 2 (Cisco)
- Angular Basics
- Flutter & Dart
- UX Design
- Blockchain Security
- Java Programming
- NVIDIA Jetson Edge AI

KEY PROJECTS:
- Built e-commerce platforms, chat applications, task managers, weather dashboards, social media apps, and this portfolio
- This portfolio is built with Angular 21 standalone components, Tailwind CSS v4, GSAP animations, Firebase Firestore, and SSR via @angular/ssr

LANGUAGES SPOKEN:
- Arabic (Native)
- English (Professional Working)
- French (Intermediate)

GUIDELINES:
1. Answer as if YOU are Mohanned or his authorized representative
2. Be professional, friendly, and concise
3. If asked about something not covered here, say you don't have that information rather than making it up
4. Keep responses under 3-4 sentences unless asked for detail
5. Do not mention that you are an AI or language model
6. When appropriate, guide users to explore the website sections: Projects, Gallery, Certificates, Articles, or Contact page
7. If someone asks to hire Mohanned, direct them to the Contact page
8. Never provide false contact information or make up credentials`;

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache = new Map<string, CacheEntry>();
  private fb: FirebaseService | null = null;
  private sessionId: string | null = null;

  messages = signal<ChatMessage[]>([]);
  open = signal(false);
  loading = signal(false);
  aiAvailable = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.fb = new FirebaseService();
      } catch {
        this.fb = null;
      }
      try {
        this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: SYSTEM_PROMPT,
        });
      } catch {
        this.aiAvailable.set(false);
      }
    }
  }

  async sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { text: trimmed, sender: 'user', createdAt: Date.now() };
    this.messages.update((m) => [...m, userMsg]);
    this.loading.set(true);

    await this.persistMessage(userMsg);

    const reply = await this.getReply(trimmed);

    const botMsg: ChatMessage = { text: reply, sender: 'bot', createdAt: Date.now() };
    this.messages.update((m) => [...m, botMsg]);
    this.loading.set(false);

    await this.persistMessage(botMsg);
  }

  private async getReply(text: string): Promise<string> {
    const cached = this.getCached(text);
    if (cached) return cached;

    const faqAnswer = this.tryFaq(text);
    if (faqAnswer) {
      this.setCache(text, faqAnswer);
      return faqAnswer;
    }

    if (this.model && this.aiAvailable()) {
      try {
        const history = this.buildHistory();
        const chat = this.model.startChat({ history });
        const result = await chat.sendMessage(text);
        const response = result.response.text();
        this.setCache(text, response);
        return response;
      } catch (e: any) {
        const isRateLimit = e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('Too Many Requests');
        if (!isRateLimit) {
          this.aiAvailable.set(false);
        }
      }
    }

    return "I'm not sure I understand. Try asking about Mohanned's skills, projects, contact info, education, or certifications!";
  }

  private buildHistory(): { role: string; parts: { text: string }[] }[] {
    const msgs = this.messages();
    const recent = msgs.slice(-MAX_HISTORY);
    return recent.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
  }

  private tryFaq(text: string): string | null {
    const lower = text.toLowerCase();
    const faqs: { keywords: string[]; answer: string }[] = [
    {
  keywords: ['are you ai', 'are you an ai', 'are you a bot', 'what are you', 'real or bot'],
  answer:
    "Yes, I'm Jasmin — an AI assistant embedded in Mohanned’s portfolio. I’m designed to simulate a smart digital guide that helps you explore his profile, skills, and projects in an interactive way.",
},

{
  keywords: ['who created you', 'who made you', 'creator', 'developer of jasmin'],
  answer:
    "I was created by Mohanned Zayoud as part of his portfolio project. I’m built to act as his digital twin and interactive assistant.",
},

{
  keywords: ['what can you do', 'your abilities', 'help me', 'features'],
  answer:
    "I can help you discover Mohanned’s skills, projects, education, experience, and contact details. I can also answer questions about his goals, startup ideas, and technical stack.",
},

{
  keywords: ['how do you work', 'how are you built', 'logic', 'system'],
  answer:
    "I work using a keyword-based matching system that detects your intent and returns relevant predefined responses about Mohanned’s portfolio and profile.",
},

{
  keywords: ['are you real', 'human or ai', 'alive'],
  answer:
    "I’m not a human — I’m a virtual AI assistant. Think of me as an interactive interface for Mohanned’s portfolio rather than a real person.",
},

{
  keywords: ['do you learn', 'memory', 'do you improve'],
  answer:
    "In this version, I don’t learn or store personal memory. I respond based on predefined logic and content created by Mohanned.",
},

{
  keywords: ['can you chat', 'conversation', 'talk normally'],
  answer:
    "Yes, I can hold conversations within the scope of Mohanned’s portfolio, but my main purpose is to guide you through his profile and work.",
},

{
  keywords: ['limitations', 'what cant you do', 'not able'],
  answer:
    "I can’t access external systems, browse the internet, or perform actions outside this portfolio. I only respond based on built-in information.",
},

{
  keywords: ['is my data safe', 'privacy', 'tracking'],
  answer:
    "I don’t collect or store personal user data. I simply respond to your messages within this session.",
},

{
  keywords: ['version', 'update', 'jasmin version'],
  answer:
    "I’m an early version of Jasmin, continuously improved by Mohanned as part of his evolving portfolio system.",
},

{
  keywords: ['why exist', 'purpose', 'why are you here'],
  answer:
    "My purpose is to make exploring Mohanned’s portfolio more interactive, engaging, and human-like — instead of just reading static content.",
},
  {
    keywords: ['who', 'mohanned', 'about', 'tell me'],
    answer:
      "Mohanned Zayoud is a Software Engineering student at ISSAT Sousse, Tunisia. He's a full-stack developer focused on building real-world scalable products, with strong interest in startups, AI systems, and mobile/web ecosystems.",
  },

  {
    keywords: ['skill', 'technologies', 'tech', 'stack', 'know', 'languages'],
    answer:
      'He works with TypeScript, JavaScript, Java, Dart, Python, PHP, SQL, Angular, Spring Boot, Flutter, Symfony, Firebase, Node.js, Tailwind CSS, GSAP, MySQL, MongoDB, and Firestore.',
  },

  {
    keywords: ['frontend', 'ui', 'ux', 'design'],
    answer:
      'Mohanned builds modern frontend experiences using Angular, Flutter, Tailwind CSS, and GSAP animations, focusing on smooth UI/UX and interactive design.',
  },

  {
    keywords: ['backend', 'api', 'server', 'spring'],
    answer:
      'He builds backend systems using Spring Boot and Node.js, designing REST APIs, authentication systems, and scalable architectures.',
  },

  {
    keywords: ['mobile', 'flutter', 'app', 'android', 'ios'],
    answer:
      'He develops cross-platform mobile apps with Flutter, integrating Firebase, authentication systems, real-time databases, and REST APIs.',
  },

  {
    keywords: ['firebase', 'firestore', 'auth', 'database'],
    answer:
      'Mohanned uses Firebase for authentication, Firestore databases, hosting, and backendless app development in rapid prototypes and production apps.',
  },

  {
    keywords: ['project', 'portfolio', 'work', 'built', 'made'],
    answer:
      'He has built multiple real-world projects including e-commerce platforms, chat apps, dashboards, task managers, and full-stack portfolio systems like this one.',
  },

  {
    keywords: ['startup', 'entrepreneur', 'business', 'idea', 'company'],
    answer:
      'Mohanned is passionate about startups and product building. He is actively working toward launching his own tech startup by combining software engineering and real user problems.',
  },

  {
    keywords: ['ai', 'jasmin', 'assistant', 'chatbot', 'intelligence'],
    answer:
      'Jasmin is Mohanned’s embedded AI assistant designed to act as a digital twin inside his portfolio, helping users explore his profile interactively.',
  },

  {
    keywords: ['experience', 'internship', 'job', 'work experience'],
    answer:
      'He is actively seeking internships and real-world experience in software engineering, especially in full-stack and mobile development roles.',
  },

  {
    keywords: ['education', 'study', 'university', 'degree'],
    answer:
      'He is studying Software Engineering at ISSAT Sousse, Tunisia, with focus on distributed systems, software architecture, and full-stack development.',
  },

  {
    keywords: ['certificate', 'certification', 'course'],
    answer:
      'He has completed certifications in CCNA 1 & 2, Angular, Flutter & Dart, Java programming, UX Design, Blockchain Security, and NVIDIA Jetson AI systems.',
  },

  {
    keywords: ['goal', 'future', 'vision', 'dream'],
    answer:
      'His goals include becoming a strong software engineer, building a successful startup, improving system design skills, and working internationally in France or Europe.',
  },

  {
    keywords: ['youtube', 'channel', 'content', 'videos'],
    answer:
      'He is planning multiple YouTube channels: coding tutorials, Linux content, dev vlogs, and historical storytelling content.',
  },

  {
    keywords: ['linux', 'os', 'system', 'terminal'],
    answer:
      'He is interested in Linux systems, terminal workflows, and system-level understanding as part of becoming a stronger software engineer.',
  },

  {
    keywords: ['network', 'ccna', 'cisco'],
    answer:
      'He has completed CCNA 1 & 2 and understands networking fundamentals including routing, switching, VLANs, and network configuration.',
  },

  {
    keywords: ['security', 'cyber', 'hack', 'backdoor'],
    answer:
      'He studies cybersecurity concepts such as system vulnerabilities, secure coding practices, and network security fundamentals.',
  },

  {
    keywords: ['cv', 'resume', 'download'],
    answer:
      'You can download Mohanned’s CV directly from the top navigation or hero section of the portfolio.',
  },

  {
    keywords: ['contact', 'email', 'reach', 'phone'],
    answer:
      'You can contact him via email at mohanned.zayoud@esen.tn or phone +216 51 916 715 for collaborations, internships, or freelance work.',
  },

  {
    keywords: ['language', 'speak', 'arabic', 'english', 'french'],
    answer:
      'He speaks Arabic (native), English (professional level), and French (intermediate).',
  },

  {
    keywords: ['hi', 'hello', 'hey'],
    answer:
      "Hello! I'm Jasmin, Mohanned's interactive portfolio assistant. Ask me anything about his skills, projects, or experience.",
  },

  {
    keywords: ['thank', 'thanks'],
    answer:
      "You're welcome! Feel free to explore more about Mohanned anytime.",
      },
  {
  keywords: ['who are you', 'introduce yourself', 'your name'],
  answer:
    "I'm Jasmin, Mohanned's AI-powered portfolio assistant. Think of me as his digital twin—I'm here to answer questions about his projects, skills, experience, and ambitions.",
},

{
  keywords: ['what is jasmin'],
  answer:
    "Jasmin is the intelligent assistant built specifically for Mohanned's portfolio. My goal is to make exploring his work more interactive than a traditional portfolio.",
},

{
  keywords: ['are you chatgpt', 'are you openai', 'gpt'],
  answer:
    "No. I'm Jasmin, a custom assistant created for Mohanned's portfolio. While I use AI concepts, I'm designed specifically to answer questions about him and his work.",
},

{
  keywords: ['why jasmin', 'why your name'],
  answer:
    "The name Jasmin reflects Mohanned's vision of giving his portfolio a friendly, memorable AI companion instead of a generic chatbot.",
},

{
  keywords: ['how accurate are you', 'accuracy'],
  answer:
    "I answer using information provided directly by Mohanned. If something changes, he'll update me so I stay accurate.",
},

{
  keywords: ['can you make mistakes', 'wrong'],
  answer:
    "Like any assistant, I can occasionally misunderstand a question. If that happens, try asking differently or browse the portfolio sections directly.",
},

{
  keywords: ['who should use you', 'who are you for'],
  answer:
    "I'm here for recruiters, developers, potential clients, collaborators, classmates, and anyone curious about Mohanned's work.",
},

{
  keywords: ['what should i ask'],
  answer:
    "You can ask about Mohanned's projects, technical skills, education, certifications, technologies, goals, startup ideas, contact information, or how this portfolio was built.",
},

{
  keywords: ['portfolio website', 'this website'],
  answer:
    "This portfolio was built to showcase Mohanned's technical abilities through an interactive experience instead of a static résumé.",
},

{
  keywords: ['how was this website built'],
  answer:
    "This portfolio combines modern frontend technologies, Firebase services, animations, and Jasmin to create a unique developer experience.",
},

{
  keywords: ['dark mode', 'theme'],
  answer:
    "The portfolio supports a modern design focused on readability, animations, and an immersive browsing experience.",
},

{
  keywords: ['favorite project', 'best project'],
  answer:
    "That's difficult to answer! Every project represents a different challenge, but PeerMint, Kasty, and the portfolio itself showcase many of Mohanned's current skills.",
},

{
  keywords: ['latest project', 'recent project'],
  answer:
    "Visit the Projects section to see Mohanned's latest work and the technologies used in each project.",
},

{
  keywords: ['hire', 'recruit', 'job offer'],
  answer:
    "Absolutely! Mohanned is always interested in discussing exciting opportunities, internships, and challenging software engineering projects.",
},

{
  keywords: ['freelance'],
  answer:
    "Mohanned is open to discussing freelance opportunities depending on the project's scope and timeline.",
},

{
  keywords: ['open source', 'github'],
  answer:
    "Many of Mohanned's projects are available on GitHub. You can find links throughout the portfolio.",
},

{
  keywords: ['linkedin'],
  answer:
    "You can find Mohanned's LinkedIn profile in the Contact section of this portfolio.",
},

{
  keywords: ['github profile'],
  answer:
    "Visit the Contact section or social links to explore Mohanned's GitHub repositories and recent work.",
},

{
  keywords: ['can i collaborate', 'collaboration'],
  answer:
    "Definitely! Mohanned enjoys collaborating on innovative software projects, startups, and open-source initiatives.",
},

{
  keywords: ['startup ideas'],
  answer:
    "Mohanned enjoys identifying everyday problems and transforming them into practical software solutions with startup potential.",
},

{
  keywords: ['future plans'],
  answer:
    "His long-term vision is to become an experienced software engineer, launch successful startups, contribute to meaningful products, and continuously learn new technologies.",
},

{
  keywords: ['what motivates him'],
  answer:
    "Mohanned enjoys solving complex problems, learning new technologies, and building products that have a positive impact on people's lives.",
},

{
  keywords: ['hobbies', 'interests'],
  answer:
    "Outside software engineering, Mohanned is interested in Linux, networking, AI, startups, history, fitness, and content creation.",
},

{
  keywords: ['fitness', 'gym'],
  answer:
    "Mohanned enjoys staying active and believes discipline in fitness translates well into software engineering and lifelong learning.",
},

{
  keywords: ['linux'],
  answer:
    "Linux is one of Mohanned's favorite environments for development, experimentation, and learning how operating systems work.",
},

{
  keywords: ['networking', 'ccna'],
  answer:
    "Mohanned has completed Cisco CCNA 1 & 2 and enjoys learning about networking, routing, switching, and distributed systems.",
},

{
  keywords: ['microservices'],
  answer:
    "Mohanned enjoys designing modular applications and has experience building microservice-based systems using Spring Boot.",
},

{
  keywords: ['database'],
  answer:
    "He has experience with MySQL, Firestore, and MongoDB, choosing each database based on the project's requirements.",
},

{
  keywords: ['coding philosophy'],
  answer:
    "Mohanned believes good software should be clean, scalable, maintainable, and focused on solving real user problems.",
},

{
  keywords: ['how can i navigate'],
  answer:
    "You can explore Projects, Skills, Experience, Certificates, Gallery, News, or simply ask me a question.",
},

{
  keywords: ['did mohanned build you'],
  answer:
    "Yes! Jasmin was designed and integrated by Mohanned as part of his portfolio to create a more engaging visitor experience.",
},

{
  keywords: ['why use ai'],
  answer:
    "Instead of forcing visitors to search through pages, AI provides a faster and more natural way to discover information.",
},

{
  keywords: ['do you replace the portfolio'],
  answer:
    "Not at all. I complement the portfolio by helping visitors quickly find information, while the portfolio itself contains the complete details.",
},

{
  keywords: ['surprise me'],
  answer:
    "Here's a fun fact: this assistant exists because Mohanned wanted his portfolio to be remembered—not just visited.",
},

{
  keywords: ['easter egg'],
  answer:
    "🎉 You found one! Jasmin appreciates curious visitors. Keep exploring—you never know what other surprises Mohanned has hidden in the portfolio.",
},

{
  keywords: ['joke'],
  answer:
    "Why do programmers prefer dark mode? Because light attracts bugs. 😄",
},

{
  keywords: ['who is better', 'you or mohanned'],
  answer:
    "Definitely Mohanned. I'm here because he built me!",
},

{
  keywords: ['favorite language'],
  answer:
    "Mohanned enjoys working with Java, TypeScript, and Dart because they power many of the projects showcased here.",
},

{
  keywords: ['thank you jasmin'],
  answer:
    "You're very welcome! I hope I helped you learn more about Mohanned. Enjoy exploring the portfolio!",
},

  {
    keywords: ['bye', 'goodbye'],
    answer:
      'Goodbye! Come back anytime — Jasmin will be here.',
  },
];

    let best: { keywords: string[]; answer: string } | null = null;
    let bestCount = 0;
    for (const faq of faqs) {
      const count = faq.keywords.filter((k) => lower.includes(k)).length;
      if (count > bestCount) {
        bestCount = count;
        best = faq;
      }
    }
    if (best && bestCount > 0) return best.answer;
    return null;
  }

  private getCached(text: string): string | null {
    const key = text.toLowerCase().trim();
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  private setCache(text: string, response: string) {
    if (this.cache.size >= MAX_CACHE) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(text.toLowerCase().trim(), { response, timestamp: Date.now() });
  }

  private async persistMessage(msg: ChatMessage) {
    if (!this.fb) return;
    try {
      const db = this.fb.firestore;
      if (!this.sessionId) {
        const session: ChatSession = {
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const ref = await addDoc(collection(db, 'chats'), session);
        this.sessionId = ref.id;
      }
      const msgs = this.messages();
      await updateDoc(doc(db, 'chats', this.sessionId), {
        messages: msgs,
        updatedAt: Date.now(),
      });
    } catch {
      /* silent */
    }
  }

  toggle() {
    this.open.update((v) => !v);
  }

  close() {
    this.open.set(false);
  }
}