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

    return pm;
  }

  private getLabels(lang: string) {
    const labels: Record<string, Record<string, string>> = {
      en: {
        profile: 'Profile',
        experience: 'Professional Experience',
        education: 'Education',
        projects: 'Projects',
        skills: 'Skills',
        certifications: 'Certifications',
        languages: 'Languages',
      },

      fr: {
        profile: 'Profil',
        experience: 'Expérience Professionnelle',
        education: 'Formation',
        projects: 'Projets',
        skills: 'Compétences',
        certifications: 'Certifications',
        languages: 'Langues',
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

  private getContactLines(cvData: CvInput, isRtl: boolean): string[] {
    const lines: string[] = [];

    if (cvData.email) {
      lines.push(cvData.email);
    }

    if (cvData.phone) {
      lines.push(cvData.phone);
    }

    if (cvData.location) {
      lines.push(cvData.location);
    }

    if (cvData.linkedin) {
      lines.push(`LinkedIn: ${cvData.linkedin.split('/').pop()}`);
    }

    if (cvData.github) {
      lines.push(`GitHub: ${cvData.github.split('/').pop()}`);
    }

    if (cvData.website) {
      lines.push(cvData.website);
    }

    return lines;
  }

  private buildHeader(cvData: CvInput, isRtl: boolean) {
    const name = cvData.name || 'Your Name';
    const title = cvData.title || 'Your Title';

    const contacts = this.getContactLines(cvData, isRtl);

    const content: any[] = [];

    content.push({
      text: name,
      font: 'Roboto',
      bold: true,
      fontSize: 22,
      color: '#1a1a1a',
      margin: [0, 0, 0, 2],
      alignment: isRtl ? 'right' : 'left',
    });

    content.push({
      text: title,
      font: 'Roboto',
      fontSize: 11,
      color: '#555555',
      margin: [0, 0, 0, 6],
      alignment: isRtl ? 'right' : 'left',
    });

    if (contacts.length > 0) {
      content.push({
        text: contacts.join('   '),
        font: 'Roboto',
        fontSize: 8,
        color: '#666666',
        margin: [0, 0, 0, 12],
        alignment: 'center',
      });
    }

    return content;
  }

  private buildProfile(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const text = cvData.profile || cvData.summary;

    if (!text) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['profile'], isRtl)
    );

    content.push({
      text: text,
      font: 'Roboto',
      fontSize: 9.5,
      color: '#333333',
      alignment: 'justify',
      lineHeight: 1.4,
      margin: [0, 0, 0, 10],
    });

    return content;
  }

  private buildExperience(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const internships = cvData.internships || [];

    if (internships.length === 0) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['experience'], isRtl)
    );

    for (const exp of internships) {
      const dateText = exp.endDate
        ? `${exp.startDate} – ${exp.endDate}`
        : exp.startDate;

      const mainText = {
        columns: [
          {
            width: '*',

            text: [
              {
                text: `${exp.position} — `,
                font: 'Roboto',
                bold: true,
                fontSize: 9.5,
              },
              {
                text: exp.company,
                font: 'Roboto',
                fontSize: 9.5,
                color: '#0066cc',
              },
            ] as any,
          },

          {
            width: 'auto',
            text: dateText,
            font: 'Roboto',
            fontSize: 8,
            color: '#666666',
            alignment: 'right',
          },
        ],

        margin: [0, 0, 0, 1],
      };

      content.push(mainText);

      if (exp.description) {
        content.push({
          text: exp.description,
          font: 'Roboto',
          fontSize: 8.5,
          color: '#333333',
          margin: [0, 1, 0, 4],
          lineHeight: 1.35,
          alignment: 'justify',
        });
      }

      if (
        exp.technologies &&
        exp.technologies.length > 0
      ) {
        content.push({
          text: exp.technologies.join(' · '),
          font: 'Roboto',
          fontSize: 7.5,
          color: '#777777',
          margin: [0, 2, 0, 6],
        });
      }
    }

    return content;
  }

  private buildEducation(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const education = cvData.education || [];

    if (education.length === 0) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['education'], isRtl)
    );

    for (const edu of education) {
      const dateText = edu.endDate
        ? `${edu.startDate} – ${edu.endDate}`
        : edu.startDate;

      content.push({
        columns: [
          {
            width: '*',

            text: [
              {
                text: `${edu.title} — `,
                font: 'Roboto',
                bold: true,
                fontSize: 9.5,
              },
              {
                text: edu.institution,
                font: 'Roboto',
                fontSize: 9.5,
                color: '#0066cc',
              },
            ] as any,
          },

          {
            width: 'auto',
            text: dateText,
            font: 'Roboto',
            fontSize: 8,
            color: '#666666',
            alignment: 'right',
          },
        ],

        margin: [0, 0, 0, 5],
      });
    }

    return content;
  }

  private buildProjects(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const projects = cvData.projects || [];

    if (projects.length === 0) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['projects'], isRtl)
    );

    for (const proj of projects) {
      const techText =
        proj.technologies &&
        proj.technologies.length > 0
          ? proj.technologies.join(' · ')
          : '';

      content.push({
        text: [
          {
            text: proj.title,
            font: 'Roboto',
            bold: true,
            fontSize: 9.5,
          },
        ] as any,

        margin: [0, 0, 0, 1],
      });

      if (proj.problem) {
        content.push({
          text: proj.problem,
          font: 'Roboto',
          fontSize: 8.5,
          color: '#333333',
          margin: [0, 1, 0, 3],
          lineHeight: 1.35,
          alignment: 'justify',
        });
      }

      if (techText) {
        content.push({
          text: techText,
          font: 'Roboto',
          fontSize: 7.5,
          color: '#777777',
          margin: [0, 2, 0, 6],
        });
      }
    }

    return content;
  }

  private buildSkills(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const techs = cvData.techs || [];

    if (techs.length === 0) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['skills'], isRtl)
    );

    for (const group of techs) {
      content.push({
        text: [
          {
            text: `${group.category}: `,
            font: 'Roboto',
            bold: true,
            fontSize: 9,
            color: '#1a1a1a',
          },

          {
            text: group.items.join(' · '),
            font: 'Roboto',
            fontSize: 9,
            color: '#333333',
          },
        ] as any,

        margin: [0, 0, 0, 3],
      });
    }

    return content;
  }

  private buildCertifications(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const certs = cvData.certificates || [];

    if (certs.length === 0) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['certifications'], isRtl)
    );

    const certList = certs.map((c: any) =>
      c.issuer
        ? `${c.title} — ${c.issuer}`
        : c.title
    );

    content.push({
      ul: certList,
      font: 'Roboto',
      fontSize: 9,
      color: '#333333',
      margin: [0, 0, 0, 6],
      bulletColor: '#666666',
    });

    return content;
  }

  private buildLanguages(
    cvData: CvInput,
    labels: Record<string, string>,
    isRtl: boolean
  ) {
    const langs = cvData.languages || [];

    if (langs.length === 0) {
      return [];
    }

    const content: any[] = [];

    content.push(
      this.getSectionTitle(labels['languages'], isRtl)
    );

    const langText = langs
      .map((l) => `${l.name} (${l.level})`)
      .join(' · ');

    content.push({
      text: langText,
      font: 'Roboto',
      fontSize: 9,
      color: '#333333',
      margin: [0, 0, 0, 6],
    });

    return content;
  }

  async downloadPdf(data?: CvInput, lang = 'en') {
    if (this.downloading) {
      return;
    }

    this.downloading = true;

    try {
      const pm = await this.getPdfMake();

      const labels = this.getLabels(lang);
      const isRtl = lang === 'ar';

      const cvData: CvInput = data || {};

      const content: any[] = [];

      content.push(
        ...this.buildHeader(cvData, isRtl)
      );

      content.push(
        ...this.buildProfile(cvData, labels, isRtl)
      );

      content.push(
        ...this.buildExperience(cvData, labels, isRtl)
      );

      content.push(
        ...this.buildEducation(cvData, labels, isRtl)
      );

      content.push(
        ...this.buildProjects(cvData, labels, isRtl)
      );

      content.push(
        ...this.buildSkills(cvData, labels, isRtl)
      );

      content.push(
        ...this.buildCertifications(cvData, labels, isRtl)
      );

      content.push(
        ...this.buildLanguages(cvData, labels, isRtl)
      );

      const docDef: any = {
        pageSize: 'A4',

        pageMargins: [
          20,
          20,
          20,
          20
        ],

        content,

        defaultFont: 'Roboto',

        fonts: {
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf',
          },
        },

        styles: {
          sectionTitle: {
            font: 'Roboto',
            bold: true,
            fontSize: 11,
            color: '#1a1a1a',
            margin: [0, 10, 0, 4],
            border: [0, 0, 0, 1],
            borderColor: '#cccccc',
            padding: [0, 0, 0, 2],
          },
        },
      };

      const blob = await pm.createPdf(docDef).getBlob();
        const url = URL.createObjectURL(blob);
        window.open(url);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

    } finally {
      this.downloading = false;
    }
  }

  async downloadMotivationLetter(lang = 'en') {
    if (this.downloading) {
      return;
    }

    this.downloading = true;

    try {
      const pm = await this.getPdfMake();

      const content: any[] = [];

      const dateStr = new Date().toLocaleDateString(
        lang === 'ar'
          ? 'ar-SA'
          : lang === 'fr'
            ? 'fr-FR'
            : 'en-US',

        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );

      content.push({
        text: 'MOTIVATION LETTER',
        font: 'Roboto',
        bold: true,
        fontSize: 16,
        color: '#1a1a1a',
        margin: [0, 0, 0, 20],
        alignment: 'center',
      });

      content.push({
        text: dateStr,
        font: 'Roboto',
        fontSize: 9,
        color: '#666666',
        margin: [0, 0, 0, 16],
      });

      const greetingText =
        lang === 'fr'
          ? 'Madame, Monsieur,'
          : lang === 'ar'
            ? 'السيدة والسيد,'
            : 'Dear Hiring Manager,';

      content.push({
        text: greetingText,
        font: 'Roboto',
        fontSize: 10,
        color: '#333333',
        margin: [0, 0, 0, 12],
      });

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
          font: 'Roboto',
          fontSize: 9,
          color: '#333333',
          lineHeight: 1.5,
          margin: [0, 0, 0, 12],
          alignment: 'justify',
        });
      }

      const closingText =
        lang === 'fr'
          ? 'Cordialement,'
          : lang === 'ar'
            ? 'مع فائق الاحترام,'
            : 'Sincerely,';

      content.push({
        text: closingText,
        font: 'Roboto',
        fontSize: 10,
        color: '#333333',
        margin: [0, 20, 0, 60],
      });

      const docDef: any = {
        pageSize: 'A4',

        pageMargins: [
          20,
          20,
          20,
          20
        ],

        content,

        defaultFont: 'Roboto',

        fonts: {
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf',
          },
        },
      };

      await pm.createPdf(docDef).download('Motivation_Letter.pdf');

    } finally {
      this.downloading = false;
    }
  }

  private getSectionTitle(
    title: string,
    rtl: boolean
  ) {
    return {
      text: title,
      font: 'Roboto',
      bold: true,
      fontSize: 11,
      color: '#1a1a1a',
      margin: [0, 10, 0, 4],
      border: [0, 0, 0, 1],
      borderColor: '#cccccc',
      alignment: rtl ? 'right' : 'left',
    };
  }
}