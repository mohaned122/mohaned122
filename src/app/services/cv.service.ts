import { Injectable } from '@angular/core';
import { Education } from '../models/education.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { Certificate } from '../models/certificate.model';

export interface CvInput {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  profile?: string;
  summary?: string;
  internships?: Internship[];
  education?: Education[];
  projects?: Project[];
  techs?: { category: string; items: string[] }[];
  certificates?: Certificate[];
  languages?: { name: string; level: string }[];
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

  private getLabels(lang: string) {
    const labels: Record<string, Record<string, string>> = {
      en: {
        profile: 'PROFILE',
        experience: 'PROFESSIONAL EXPERIENCE',
        education: 'ACADEMIC EDUCATION',
        projects: 'PROJECTS',
        skills: 'SKILLS',
        certifications: 'CERTIFICATIONS',
        languages: 'LANGUAGES',
      },
      fr: {
        profile: 'PROFIL',
        experience: 'EXPÉRIENCE PROFESSIONNELLE',
        education: 'FORMATION ACADÉMIQUE',
        projects: 'PROJETS',
        skills: 'COMPÉTENCES',
        certifications: 'CERTIFICATIONS',
        languages: 'LANGUES',
      },
      ar: {
        profile: 'الملف الشخصي',
        experience: 'الخبرة المهنية',
        education: 'التعليم',
        projects: 'المشاريع',
        skills: 'المهارات',
        certifications: 'الشهادات',
        languages: 'اللغات',
      },
    };
    return labels[lang] || labels['en'];
  }

  async downloadPdf(data?: CvInput, lang = 'en') {
    if (this.downloading) return;
    this.downloading = true;

    try {
      const pm = await this.getPdfMake();
      const labels = this.getLabels(lang);
      const isRtl = lang === 'ar';
      const content: any[] = [];

      // Provide defaults if data is not provided
      const cvData: CvInput = data || {};
      
      // Handle both summary and profile properties
      const profileText = cvData.profile || cvData.summary || 'Your professional profile summary';
      const name = cvData.name || 'Your Name';
      const title = cvData.title || 'Your Title';
      const email = cvData.email || 'your.email@example.com';
      const phone = cvData.phone || '+216 XX XXX XXX';
      const location = cvData.location || 'Your Location';
      const internships = cvData.internships || [];
      const education = cvData.education || [];
      const projects = cvData.projects || [];
      const techs = cvData.techs || [];
      const certificates = cvData.certificates || [];
      const languages = cvData.languages || [];

      // HEADER WITH NAME AND TITLE
      content.push({
        text: name,
        fontSize: 20,
        bold: true,
        color: '#1a1a1a',
        margin: [0, 0, 0, 2],
        alignment: isRtl ? 'right' : 'left',
      });

      content.push({
        text: title,
        fontSize: 10,
        color: '#555555',
        margin: [0, 0, 0, 8],
        alignment: isRtl ? 'right' : 'left',
      });

      // CONTACT INFO LINE
      const contactItems = [
        cvData.email,
        cvData.phone,
        cvData.location,
      ];
      if (cvData.linkedin) contactItems.push(`Linkedin: ${cvData.linkedin.split('/').pop()}`);
      if (cvData.github) contactItems.push(`Github: ${cvData.github.split('/').pop()}`);
      if (cvData.website) contactItems.push(`Portfolio: ${cvData.website.split('//')[1]?.split('/')[0]}`);

      content.push({
        text: contactItems.join('   '),
        fontSize: 8,
        color: '#666666',
        margin: [0, 0, 0, 10],
        alignment: 'center',
      });

      // PROFILE SECTION
      if (cvData.profile) {
        content.push(this.getSectionTitle(labels['profile'], isRtl));
        content.push({
          text: cvData.profile,
          fontSize: 9,
          color: '#333333',
          alignment: 'justify',
          margin: [0, 0, 0, 10],
          lineHeight: 1.4,
        });
      }

      // PROFESSIONAL EXPERIENCE
      if (cvData.internships && cvData.internships.length > 0) {
        content.push(this.getSectionTitle(labels['experience'], isRtl));
        for (const exp of cvData.internships) {
          // Position & Company with dates
          content.push({
            columns: [
              {
                width: '*',
                text: [
                  { text: `${exp.position} — `, bold: true, fontSize: 9 },
                  { text: exp.company, fontSize: 9, color: '#0066cc' },
                ] as any,
              },
              {
                width: 'auto',
                text: exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate,
                fontSize: 8,
                color: '#666666',
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 2],
          });

          // Location - use company or description if available
          const locationText = (exp as any).location || '';
          if (locationText) {
            content.push({
              text: locationText,
              fontSize: 8,
              color: '#666666',
              margin: [0, 0, 0, 4],
              italics: true,
            });
          }

          // Description
          if (exp.description) {
            content.push({
              text: exp.description,
              fontSize: 8.5,
              color: '#333333',
              margin: [0, 2, 0, 2],
              lineHeight: 1.3,
            });
          }

          // Technologies/Stack
          if (exp.technologies && exp.technologies.length > 0) {
            content.push({
              text: `Technologies: ${exp.technologies.join(', ')}`,
              fontSize: 8,
              color: '#555555',
              margin: [0, 3, 0, 8],
            });
          }
        }
      }

      // EDUCATION
      if (cvData.education && cvData.education.length > 0) {
        content.push(this.getSectionTitle(labels['education'], isRtl));
        for (const edu of cvData.education) {
          content.push({
            columns: [
              {
                width: '*',
                stack: [
                  {
                    text: [
                      { text: `${edu.title} `, bold: true, fontSize: 9 },
                      { text: `— ${edu.institution}`, fontSize: 9, color: '#0066cc' },
                    ] as any,
                  },
                  edu.field ? { text: edu.field, fontSize: 8, color: '#666666', margin: [0, 2, 0, 0] } : null,
                ].filter(Boolean),
              },
              {
                width: 'auto',
                text: edu.endDate ? `${edu.startDate} – ${edu.endDate}` : edu.startDate,
                fontSize: 8,
                color: '#666666',
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 6],
          });
        }
      }

      // PROJECTS
      if (cvData.projects && cvData.projects.length > 0) {
        content.push(this.getSectionTitle(labels['projects'], isRtl));
        for (const project of cvData.projects) {
          content.push({
            columns: [
              {
                width: '*',
                text: project.title,
                bold: true,
                fontSize: 9,
              },
              project.technologies?.[0] ? {
                width: 'auto',
                text: project.technologies?.length > 0 ? `${project.technologies[project.technologies.length - 1]}` : '',
                fontSize: 8,
                color: '#666666',
                alignment: 'right',
              } : null,
            ].filter(Boolean),
            margin: [0, 0, 0, 2],
          });

          const projectDesc = (project as any).description || project.title;
          if (projectDesc) {
            content.push({
              text: projectDesc,
              fontSize: 8.5,
              color: '#333333',
              margin: [0, 2, 0, 2],
              lineHeight: 1.3,
            });
          }

          if (project.technologies && project.technologies.length > 0) {
            content.push({
              text: `Stack: ${project.technologies.join(', ')}`,
              fontSize: 8,
              color: '#555555',
              margin: [0, 2, 0, 8],
            });
          }
        }
      }

      // SKILLS
      if (cvData.techs && cvData.techs.length > 0) {
        content.push(this.getSectionTitle(labels['skills'], isRtl));
        for (const skillGroup of cvData.techs) {
          content.push({
            text: [
              { text: `${skillGroup.category}: `, bold: true, fontSize: 8.5 },
              { text: skillGroup.items.join(', '), fontSize: 8.5 },
            ] as any,
            margin: [0, 0, 0, 3],
          });
        }
        content.push({ text: '', margin: [0, 0, 0, 4] });
      }

      // CERTIFICATIONS
      if (cvData.certificates && cvData.certificates.length > 0) {
        content.push(this.getSectionTitle(labels['certifications'], isRtl));
        const certBullets = cvData.certificates.map((cert: any) => {
          return cert.issuer ? `${cert.title} — ${cert.issuer}` : cert.title;
        });
        content.push({
          ul: certBullets,
          fontSize: 8.5,
          color: '#333333',
          margin: [0, 0, 0, 8],
        });
      }

      // LANGUAGES
      if (cvData.languages && cvData.languages.length > 0) {
        content.push(this.getSectionTitle(labels['languages'], isRtl));
        const langStack = [];
        for (const language of cvData.languages) {
          langStack.push({
            columns: [
              { text: language.name, width: 80, fontSize: 8.5, bold: true },
              { text: language.level, width: '*', fontSize: 8.5, color: '#555555' },
            ],
            margin: [0, 0, 0, 2],
          });
        }
        content.push({ stack: langStack });
      }

      const docDef: any = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content,
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            color: '#1a1a1a',
            margin: [0, 0, 0, 10],
          },
        },
      };

      pm.createPdf(docDef).open();
    } finally {
      this.downloading = false;
    }
  }

  async downloadMotivationLetter(lang = 'en') {
    if (this.downloading) return;
    this.downloading = true;
    try {
      const pm = await this.getPdfMake();
      const content: any[] = [];
      const dateStr = new Date().toLocaleDateString(
        lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      );

      // HEADER
      content.push({
        text: 'MOTIVATION LETTER',
        fontSize: 16,
        bold: true,
        color: '#1a1a1a',
        margin: [0, 0, 0, 20],
        alignment: 'center',
      });

      // DATE
      content.push({
        text: dateStr,
        fontSize: 9,
        color: '#666666',
        margin: [0, 0, 0, 16],
      });

      // GREETING
      const greetingText =
        lang === 'fr' ? 'Madame, Monsieur,' : lang === 'ar' ? 'السادة الكرام،' : 'Dear Hiring Manager,';
      content.push({
        text: greetingText,
        fontSize: 10,
        color: '#333333',
        margin: [0, 0, 0, 12],
      });

      // BODY PARAGRAPHS
      const paragraphs: Record<string, string[]> = {
        en: [
          'I am writing to express my strong interest in this opportunity. With my background in software engineering and hands-on experience in full-stack development, I am confident that my technical expertise and passion for problem-solving make me a valuable addition to your team.',
          'Throughout my academic and professional journey, I have developed strong technical skills and the ability to work effectively in collaborative environments. I am committed to continuous learning and staying updated with the latest technologies and industry best practices.',
          'I am enthusiastic about the possibility of contributing to your organization and would welcome the opportunity to discuss how my skills and experience align with your needs.',
          'Thank you for considering my application. I look forward to hearing from you.',
        ],
        fr: [
          'Je me permets de vous adresser ma candidature pour cette opportunité. Forte de mes expériences en développement logiciel et de ma passion pour résoudre des problèmes complexes, je suis convaincue que mes compétences techniques et mon engagement font de moi une candidate idéale pour votre équipe.',
          'Au cours de mon parcours académique et professionnel, j\'ai développé une expertise technique solide et la capacité de travailler efficacement dans des environnements collaboratifs. Je suis engagée dans l\'apprentissage continu et la maîtrise des dernières technologies.',
          'Je suis enthousiaste à l\'idée de contribuer à votre organisation et j\'accueillerais favorablement l\'opportunité de discuter de la manière dont mes compétences pourraient répondre à vos besoins.',
          'Je vous remercie de l\'attention portée à ma candidature et reste à votre disposition pour une discussion approfondie.',
        ],
        ar: [
          'أود التقدم بطلب للحصول على هذه الفرصة. بفضل خبرتي في تطوير البرمجيات وشغفي بحل المشاكل المعقدة، أنا واثقة من أن مهاراتي التقنية والتزامي يجعلان مرشحة مثالية لفريقكم.',
          'خلال مسيرتي الأكاديمية والمهنية، طورت خبرة تقنية قوية والقدرة على العمل بفعالية في بيئات تعاونية. أنا ملتزمة بالتعلم المستمر وإتقان أحدث التقنيات.',
          'أنا متحمسة لفكرة المساهمة في مؤسستكم وأرحب بفرصة مناقشة كيفية مواءمة مهاراتي مع احتياجاتكم.',
          'أشكركم على اهتمامكم بطلبي وأتطلع إلى سماع ردكم.',
        ],
      };

      const p = paragraphs[lang] || paragraphs['en'];
      for (const para of p) {
        content.push({
          text: para,
          fontSize: 9,
          color: '#333333',
          lineHeight: 1.5,
          margin: [0, 0, 0, 12],
          alignment: 'justify',
        });
      }

      // CLOSING
      const closingText =
        lang === 'fr' ? 'Cordialement,' : lang === 'ar' ? 'مع فائق الاحترام،' : 'Sincerely,';
      content.push({
        text: closingText,
        fontSize: 10,
        color: '#333333',
        margin: [0, 20, 0, 60],
      });

      const docDef: any = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content,
      };

      pm.createPdf(docDef).download('Motivation_Letter.pdf');
    } finally {
      this.downloading = false;
    }
  }

  private getSectionTitle(title: string, rtl: boolean) {
    return {
      text: title,
      fontSize: 10,
      bold: true,
      color: '#1a1a1a',
      margin: [0, 10, 0, 4],
      border: [0, 0, 0, 1],
      borderColor: '#cccccc',
      alignment: rtl ? 'right' : 'left',
    };
  }
}