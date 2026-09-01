import { Injectable } from '@angular/core';
import { Education } from '../models/education.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { Certificate } from '../models/certificate.model';

export interface CvInput {
  education: Education[];
  internships: Internship[];
  projects: Project[];
  certificates: Certificate[];
  summary: string;
  techs: { category: string; items: string[] }[];
  languages: { name: string; level: string }[];
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

@Injectable({ providedIn: 'root' })
export class CvService {
  downloading = false;

  private async getPdfMake() {
    const [pdfMakeModule, pdfFontsModule] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts'),
    ]);
    const pm = pdfMakeModule.default || pdfMakeModule;
    const fontData = pdfFontsModule.default || pdfFontsModule;
    pm.addVirtualFileSystem(fontData);
    pm.addFonts({
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf',
      },
    });
    return pm;
  }

  private labels(lang: string) {
    const t: Record<string, Record<string, string>> = {
      en: {
        summary: 'PROFESSIONAL SUMMARY',
        education: 'EDUCATION',
        internships: 'INTERNSHIPS & EXPERIENCE',
        skills: 'TECHNICAL SKILLS',
        languages: 'LANGUAGES',
        certs: 'CERTIFICATIONS',
        footer: 'Built with Angular, Firebase & GSAP',
        native: 'Native',
        prof: 'Professional Working',
        inter: 'Intermediate',
        related: 'Related project',
        current: 'Current',
        recent: 'Recent',
      },
      fr: {
        summary: 'RÉSUMÉ PROFESSIONNEL',
        education: 'FORMATION',
        internships: 'STAGES & EXPÉRIENCE',
        skills: 'COMPÉTENCES TECHNIQUES',
        languages: 'LANGUES',
        certs: 'CERTIFICATIONS',
        footer: 'Construit avec Angular, Firebase & GSAP',
        native: 'Langue maternelle',
        prof: 'Niveau professionnel',
        inter: 'Intermédiaire',
        related: 'Projet lié',
        current: 'Actuel',
        recent: 'Récent',
      },
      ar: {
        summary: 'الملخص المهني',
        education: 'التعليم',
        internships: 'التدريب والخبرة',
        skills: 'المهارات التقنية',
        languages: 'اللغات',
        certs: 'الشهادات',
        footer: 'بُني باستخدام Angular وFirebase وGSAP',
        native: 'اللغة الأم',
        prof: 'مستوى مهني',
        inter: 'مستوى متوسط',
        related: 'المشروع المرتبط',
        current: 'حالي',
        recent: 'أخير',
      },
    };
    return t[lang] ?? t['en'];
  }

  async downloadPdf(data?: CvInput, lang = 'en') {
    if (this.downloading) return;
    this.downloading = true;
    try {
      const pm = await this.getPdfMake();
      const L: Record<string, string> = this.labels(lang);
      const accent = '#2563eb';
      const dark = '#0f172a';
      const headerBg = '#1e293b';
      const isRtl = lang === 'ar';

      const content: any[] = [];

      // HEADER BANNER
      content.push({
        canvas: [
          { type: 'rect', x: -40, y: 0, w: 636, h: 72, color: headerBg },
          { type: 'rect', x: -40, y: 72, w: 636, h: 4, color: accent },
        ],
        margin: [0, 0, 0, 0],
      });
      content.push({
        columns: [
          {
            width: '*',
            stack: [
              { text: 'MOHANNED ZAYOUD', color: '#ffffff', fontSize: 20, bold: true, letterSpacing: 2 },
              { text: 'Software Engineering Student', color: '#94a3b8', fontSize: 10, italics: true, margin: [0, 2, 0, 0] },
              { text: 'Full-Stack Developer', color: '#60a5fa', fontSize: 10, margin: [0, 1, 0, 0] },
            ],
            alignment: isRtl ? 'right' : 'left',
          },
        ],
        margin: [0, -78, 0, 0],
        alignment: isRtl ? 'right' : 'left',
      });

      // CONTACT ROW
      content.push({
        columns: [
          { text: `📍 ${data?.location ?? 'Tunisia'}`, width: '*', fontSize: 7.5, color: '#475569', alignment: isRtl ? 'right' : 'left' },
          { text: `✉  ${data?.email ?? 'mohanned.zayoud@esen.tn'}`, width: '*', fontSize: 7.5, color: '#475569', alignment: 'center' },
          { text: `🔗  ${data?.linkedin ?? 'linkedin.com/in/mohanned-zayoud-ab9464258/'}`, width: '*', fontSize: 7.5, color: '#475569', alignment: 'center' },
          { text: `📞  ${data?.phone ?? '+216 51 916 715'}`, width: '*', fontSize: 7.5, color: '#475569', alignment: isRtl ? 'left' : 'right' },
        ],
        columnGap: 4,
        margin: [0, 2, 0, 12],
      });

      // SEPARATOR
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }],
        margin: [0, 0, 0, 8],
      });

      // PROFESSIONAL SUMMARY
      content.push(sectionHeader(L['summary'], isRtl));
      content.push({
        text: data?.summary ?? 'Motivated Software Engineering student with hands-on experience in full-stack development, mobile applications, networking, Linux, and enterprise software systems.',
        style: 'body',
        margin: [0, 2, 0, 10],
      });

      // EDUCATION
      if (data?.education.length) {
        content.push(sectionHeader(L['education'], isRtl));
        for (const ed of data.education) {
          content.push({
            columns: [
              {
                width: '*',
                stack: [
                  { text: ed.title, bold: true, fontSize: 9.5 },
                  { text: `${ed.institution}`, fontSize: 8.5, color: accent, margin: [0, 1, 0, 0] },
                  ed.degree ? { text: `${ed.degree} in ${ed.field}`, fontSize: 8, color: '#64748b', margin: [0, 1, 0, 0] } : null,
                  ed.grade ? { text: `Grade: ${ed.grade}`, fontSize: 8, color: '#64748b', margin: [0, 1, 0, 0] } : null,
                  ed.description ? { text: ed.description, fontSize: 8, color: '#475569', margin: [0, 2, 0, 0] } : null,
                ].filter(Boolean),
              },
              ed.startDate ? { text: `${ed.startDate}${ed.endDate ? ` — ${ed.endDate}` : ''}`, fontSize: 8, color: '#64748b', alignment: isRtl ? 'left' : 'right', width: 80 } : null,
            ].filter(Boolean),
            margin: [0, 3, 0, 6],
          });
        }
      }

      // INTERNSHIPS
      if (data?.internships.length) {
        content.push(sectionHeader(L['internships'], isRtl));
        for (const item of data.internships) {
          content.push({
            columns: [
              {
                width: '*',
                stack: [
                  { text: item.position, bold: true, fontSize: 9.5 },
                  { text: item.company, fontSize: 8.5, color: accent, margin: [0, 1, 0, 0] },
                  item.description ? { text: item.description, fontSize: 8, color: '#475569', margin: [0, 2, 0, 0] } : null,
                  item.technologies.length ? { text: item.technologies.join('  •  '), fontSize: 7.5, color: '#94a3b8', margin: [0, 2, 0, 0] } : null,
                ].filter(Boolean),
              },
              { text: `${item.startDate}${item.endDate ? ` — ${item.endDate}` : L['current']}`, fontSize: 8, color: '#64748b', alignment: isRtl ? 'left' : 'right', width: 80 },
            ],
            margin: [0, 3, 0, 6],
          });
        }
      }

      // TECHNICAL SKILLS
      if (data?.techs.length) {
        content.push(sectionHeader(L['skills'], isRtl));
        const skillStack: any[] = [];
        for (const group of data.techs) {
          skillStack.push({
            text: [
              { text: `${group.category}: `, bold: true, fontSize: 8.5 },
              { text: group.items.join(', '), fontSize: 8.5, color: '#334155' },
            ],
            margin: [0, 0, 0, 2],
          });
        }
        content.push({ columns: [{ width: '*', stack: skillStack }], margin: [0, 2, 0, 8] });
      }

      // LANGUAGES
      if (data?.languages.length) {
        content.push(sectionHeader(L['languages'], isRtl));
        const langCols: any[] = [];
        for (const l of data.languages) {
          langCols.push(
            { text: l.name, width: 70, bold: true, fontSize: 8.5, color: '#334155', alignment: isRtl ? 'right' : 'left' },
            { text: l.level, width: '*', fontSize: 8.5, color: '#64748b', alignment: isRtl ? 'right' : 'left' },
          );
        }
        content.push({ columns: langCols, columnGap: 2, margin: [0, 2, 0, 8] });
      }

      // CERTIFICATIONS
      if (data?.certificates.length) {
        content.push(sectionHeader(L['certs'], isRtl));
        content.push({
          ul: data.certificates.map((c) => {
            const name = c['title'] || '';
            const issuer = c['issuer'] ? ` — ${c['issuer']}` : '';
            return `${name}${issuer}`;
          }),
          fontSize: 8.5,
          color: '#334155',
          margin: [0, 2, 0, 10],
        });
      }

      // FOOTER
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }],
        margin: [0, 0, 0, 6],
      });
      content.push({
        text: `${L['footer']} — ${data?.website ?? 'https://mohannedzayoud.web.app'}`,
        style: 'footer',
      });

      const docDef: any = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content,
        styles: {
          body: { fontSize: 9, color: '#334155', lineHeight: 1.35 },
          footer: { fontSize: 7, color: '#94a3b8', italics: true, margin: [0, 4, 0, 0] },
        },
      };

      pm.createPdf(docDef).download('Mohanned_Zayoud_CV.pdf');
    } finally {
      this.downloading = false;
    }
  }

  async downloadMotivationLetter(lang = 'en') {
    if (this.downloading) return;
    this.downloading = true;
    try {
      const pm = await this.getPdfMake();
      const dark = '#0f172a';
      const accent = '#2563eb';
      const slate = '#1e293b';

      const content: any[] = [];
      const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      // HEADER BANNER
      content.push({
        canvas: [
          { type: 'rect', x: -60, y: 0, w: 716, h: 85, color: slate },
          { type: 'rect', x: -60, y: 85, w: 716, h: 4, color: accent },
        ],
        margin: [0, 0, 0, 0],
      });
      content.push({
        columns: [
          {
            width: '*',
            stack: [
              { text: 'MOHANNED ZAYOUD', color: '#ffffff', fontSize: 20, bold: true, letterSpacing: 2.5 },
              { text: 'Software Engineering Student  |  Full-Stack Developer', color: '#94a3b8', fontSize: 9, italics: true, margin: [0, 2, 0, 0] },
            ],
          },
        ],
        margin: [0, -92, 0, 0],
        alignment: lang === 'ar' ? 'right' : 'left',
      });

      // SEPARATOR SPACE
      content.push({ text: '', margin: [0, 0, 0, 6] });

      // RECIPIENT + DATE BLOCK
      content.push({
        columns: [
          {
            width: '*',
            stack: [
              { text: dateStr, style: 'date' },
            ],
          },
        ],
        margin: [0, 0, 0, 18],
      });

      // SUBJECT WITH ACCENT BAR
      content.push({
        columns: [
          { canvas: [{ type: 'rect', x: 0, y: 0, w: 3, h: 14, color: accent }], width: 3 },
          { text: '', width: 6 },
          { text: lang === 'fr' ? 'Objet : Lettre de motivation' : lang === 'ar' ? 'الموضوع: رسالة تحفيز' : 'Subject: Letter of Motivation', style: 'subject', width: '*' },
        ],
        columnGap: 2,
        margin: [0, 0, 0, 14],
      });

      // GREETING
      const greetingText = lang === 'fr' ? 'Madame, Monsieur,' : lang === 'ar' ? 'السادة الكرام،' : 'Dear Hiring Manager,';
      content.push({ text: greetingText, style: 'greeting', margin: [0, 0, 0, 10] });

      // BODY PARAGRAPHS
      const paragraphs: Record<string, string[]> = {
        en: [
          'I am writing to express my strong interest in joining your organisation. As a dedicated Software Engineering student with hands-on experience in full-stack development, mobile applications, and cloud technologies, I am confident that my technical skills, entrepreneurial mindset, and passion for building impactful products make me an excellent candidate.',
          'Throughout my academic and professional journey, I have developed a diverse skill set spanning Angular, Flutter, Spring Boot, Firebase, and Symfony. I have built and deployed production-grade applications — from real-time project management tools with data export features to interactive portfolio platforms with custom chatbots and 20,000+ lines of curated code. Each project has strengthened my ability to deliver clean, scalable, and maintainable code while collaborating effectively across teams.',
          'Beyond technical skills, I bring a strong sense of ownership and a builder\'s mentality. I am actively involved in open-source, continuously exploring new technologies, and working on startup ideas that solve real-world problems. I would be thrilled to contribute to your team\'s success.',
          'I look forward to the opportunity to discuss how my experience and enthusiasm align with the needs of your organisation. Thank you for considering my application.',
        ],
        fr: [
          'Je me permets de vous adresser ma candidature pour un poste au sein de votre entreprise. Étudiant en génie logiciel avec une expérience pratique en développement full-stack, applications mobiles et technologies cloud, je suis convaincu que mes compétences techniques, mon esprit entrepreneurial et ma passion pour la création de produits à fort impact font de moi un candidat idéal.',
          'Au cours de mon parcours académique et professionnel, j\'ai développé un ensemble de compétences variées couvrant Angular, Flutter, Spring Boot, Firebase et Symfony. J\'ai construit et déployé des applications de production — des outils de gestion de projet temps réel aux plateformes portfolio interactives avec chatbot personnalisé et plus de 20 000 lignes de code. Chaque projet a renforcé ma capacité à livrer un code propre, scalable et maintenable tout en collaborant efficacement au sein d\'équipes pluridisciplinaires.',
          'Au-delà des compétences techniques, je fais preuve d\'un fort sens des responsabilités et d\'un état d\'esprit de bâtisseur. Je suis activement impliqué dans l\'open-source, j\'explore en continu les nouvelles technologies et je travaille sur des projets start-up qui résolvent des problèmes concrets. Je serais ravi de contribuer au succès de votre équipe.',
          'Je me tiens à votre disposition pour discuter de ma candidature et de la manière dont mon expérience pourrait répondre aux besoins de votre entreprise. Je vous remercie de l\'attention portée à ma demande.',
        ],
        ar: [
          'أود التقدم بطلب للحصول على فرصة في شركتكم المحترمة. أنا طالب هندسة برمجيات مع خبرة عملية في تطوير التطبيقات الكاملة وتطبيقات الهاتف والتقنيات السحابية، وأنا واثق من أن مهاراتي التقنية وعقليتي الريادية وشغفي ببناء منتجات مؤثرة تجعلني مرشحاً مثالياً لهذه الفرصة.',
          'خلال مسيرتي الأكاديمية والمهنية، طورت مجموعة متنوعة من المهارات تشمل Angular وFlutter وSpring Boot وFirebase وSymfony. قمت ببناء ونشر تطبيقات إنتاجية — من أدوات إدارة المشاريع في الوقت الفعلي إلى منصات تفاعلية مع روبوت محادثة مخصص وأكثر من 20,000 سطر من التعليمات البرمجية. كل مشروع عزز قدرتي على تقديم كود نظيف وقابل للتوسع مع التعاون الفعال ضمن فرق متعددة التخصصات.',
          'إلى جانب المهارات التقنية، أمتلك حساً عالياً بالمسؤولية وعقلية البناء. أنا مشارك بنشاط في المصادر المفتوحة، وأستكشف التقنيات الجديدة باستمرار، وأعمل على أفكار شركات ناشئة تحل مشاكل حقيقية. سأكون سعيداً بالمساهمة في نجاح فريقكم.',
          'أتطلع إلى فرصة مناقشة كيف يمكن لخبرتي وحماسي أن يتوافقا مع احتياجات شركتكم. شكراً لاهتمامكم بطلبي.',
        ],
      };

      const p = paragraphs[lang] ?? paragraphs['en'];
      for (const para of p.slice(0, -1)) {
        content.push({ text: para, style: 'body', margin: [0, 0, 0, 10] });
      }
      const last = p[p.length - 1];
      content.push({ text: last, style: 'body', margin: [0, 0, 0, 18] });

      // CLOSING
      const closingPrefix = lang === 'fr' ? 'Dans l\'attente de votre retour,' : lang === 'ar' ? 'مع فائق الاحترام،' : 'Sincerely,';
      const closingName = lang === 'ar' ? 'مهند زيود' : 'Mohanned Zayoud';

      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 2, lineColor: accent }],
        margin: [0, 0, 0, 8],
      });
      content.push({ text: closingPrefix, style: 'closing' });
      content.push({ text: closingName, style: 'signature' });

      const docDef: any = {
        pageSize: 'A4',
        pageMargins: [60, 60, 60, 60],
        content,
        styles: {
          date: { fontSize: 10, color: '#64748b' },
          subject: { fontSize: 12, bold: true, color: '#0f172a' },
          greeting: { fontSize: 10.5, color: '#1e293b' },
          body: { fontSize: 10, color: '#334155', lineHeight: 1.55 },
          closing: { fontSize: 10.5, color: '#1e293b', margin: [0, 0, 0, 4] },
          signature: { fontSize: 12, bold: true, color: '#2563eb' },
        },
      };

      pm.createPdf(docDef).download('Mohanned_Zayoud_Motivation_Letter.pdf');
    } finally {
      this.downloading = false;
    }
  }
}

function sectionHeader(text: string, rtl: boolean) {
  return {
    columns: [
      {
        width: '*',
        stack: [
          { text: rtl ? `▎${text}` : `${text} ▎`, fontSize: 10, bold: true, color: '#0f172a', alignment: rtl ? 'right' : 'left' },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#2563eb' }], margin: [0, 1, 0, 0] },
        ],
      },
    ],
    margin: [0, 6, 0, 2],
  };
}
