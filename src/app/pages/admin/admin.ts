import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { ContactService } from '../../services/contact.service';
import { GalleryService } from '../../services/gallery.service';
import { CertificateService } from '../../services/certificate.service';
import { ArticleService } from '../../services/article.service';
import { EducationService } from '../../services/education.service';
import { SongService } from '../../services/song.service';
import { InternshipService } from '../../services/internship.service';
import { Project } from '../../models/project.model';
import { ContactMessage } from '../../models/contact.model';
import { GalleryItem } from '../../models/gallery.model';
import { Certificate } from '../../models/certificate.model';
import { Article } from '../../models/article.model';
import { Education } from '../../models/education.model';
import { Internship } from '../../models/internship.model';
import { Song } from '../../models/song.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { AdminNavService } from '../../services/admin-nav.service';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private contactService = inject(ContactService);
  private galleryService = inject(GalleryService);
  private certificateService = inject(CertificateService);
  private articleService = inject(ArticleService);
  private educationService = inject(EducationService);
  private songService = inject(SongService);
  private internshipService = inject(InternshipService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  ts = inject(TranslationService);
  adminNav = inject(AdminNavService);

  email = signal('');
  password = signal('');
  isLoggedIn = signal(false);

  projects = signal<Project[]>([]);
  messages = signal<ContactMessage[]>([]);
  selectedMessage = signal<ContactMessage | null>(null);
  galleryItems = signal<GalleryItem[]>([]);
  certs = signal<Certificate[]>([]);
  articles = signal<Article[]>([]);

  articleTitle = signal('');
  articleDate = signal('');
  articleContent = signal('');
  articleType = signal<'Article' | 'News'>('Article');
  articleUrl = signal('');
  articleImage = signal('');
  articleImageFile = signal<File | null>(null);
  articleLockedUntil = signal('');
  articleEditing = signal<string | null>(null);

  title = signal('');
  problem = signal('');
  solution = signal('');
  category = signal('');
  techInput = signal('');
  technologies = signal<string[]>([]);
  github = signal('');
  live = signal('');
  downloadLink = signal('');
  image = signal('');
  imageFile = signal<File | null>(null);
  galleryFiles = signal<File[]>([]);
  galleryUrls = signal<string[]>([]);
  featured = signal(false);
  editing = signal<string | null>(null);

  galleryTitle = signal('');
  galleryDescription = signal('');
  galleryImage = signal('');
  galleryCategory = signal('');
  galleryFile = signal<File | null>(null);
  galleryUploading = signal(false);

  educationList = signal<Education[]>([]);
  eduTitle = signal('');
  eduInstitution = signal('');
  eduDegree = signal('');
  eduField = signal('');
  eduStartDate = signal('');
  eduEndDate = signal('');
  eduDescription = signal('');
  eduGrade = signal('');
  eduEditing = signal<string | null>(null);

  internships = signal<Internship[]>([]);
  internCompany = signal('');
  internPosition = signal('');
  internStartDate = signal('');
  internEndDate = signal('');
  internDescription = signal('');
  internTechInput = signal('');
  internTechnologies = signal<string[]>([]);
  internProjectId = signal('');
  internCompanyUrl = signal('');
  internEditing = signal<string | null>(null);

  songs = signal<Song[]>([]);
  songTitle = signal('');
  songAudioFile = signal<File | null>(null);
  songUploading = signal(false);

  certTitle = signal('');
  certIssuer = signal('');
  certDate = signal('');
  certImage = signal('');
  certLink = signal('');
  certDescription = signal('');
  certFile = signal<File | null>(null);
  certUploading = signal(false);
  certEditing = signal<string | null>(null);

  constructor() {
    this.isLoggedIn.set(this.authService.isLoggedIn);
  }

  ngOnInit() {
    const expected = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.route.paramMap.subscribe((params) => {
      const prefix = params.get('datePrefix');
      if (prefix !== expected) {
        this.router.navigate(['/']);
        return;
      }
      if (this.isLoggedIn()) {
        this.loadProjects();
        this.loadMessages();
        this.loadGallery();
        this.loadCertificates();
        this.loadArticles();
        this.loadEducation();
        this.loadSongs();
        this.loadInternships();
      }
    });
  }

  async login() {
    try {
      await this.authService.login(this.email(), this.password());
      this.isLoggedIn.set(true);
      this.loadProjects();
      this.loadMessages();
    } catch (err) {
      console.error(err);
    }
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedIn.set(false);
  }

  loadGallery() {
    this.galleryService.getAll().subscribe((data) => this.galleryItems.set(data));
  }

  loadEducation() {
    this.educationService.getAll().subscribe((data) => this.educationList.set(data));
  }

  resetEducationForm() {
    this.eduTitle.set('');
    this.eduInstitution.set('');
    this.eduDegree.set('');
    this.eduField.set('');
    this.eduStartDate.set('');
    this.eduEndDate.set('');
    this.eduDescription.set('');
    this.eduGrade.set('');
    this.eduEditing.set(null);
  }

  editEducation(item: Education) {
    this.eduEditing.set(item.id || null);
    this.eduTitle.set(item.title);
    this.eduInstitution.set(item.institution);
    this.eduDegree.set(item.degree);
    this.eduField.set(item.field);
    this.eduStartDate.set(item.startDate);
    this.eduEndDate.set(item.endDate || '');
    this.eduDescription.set(item.description || '');
    this.eduGrade.set(item.grade || '');
  }

  async saveEducation() {
    if (this.eduEditing()) {
      const data: Partial<Education> = {
        title: this.eduTitle(),
        institution: this.eduInstitution(),
        degree: this.eduDegree(),
        field: this.eduField(),
        startDate: this.eduStartDate(),
      };
      if (this.eduEndDate()) data.endDate = this.eduEndDate();
      if (this.eduDescription()) data.description = this.eduDescription();
      if (this.eduGrade()) data.grade = this.eduGrade();
      await this.educationService.update(this.eduEditing()!, data);
    } else {
      const data: Education = {
        title: this.eduTitle(),
        institution: this.eduInstitution(),
        degree: this.eduDegree(),
        field: this.eduField(),
        startDate: this.eduStartDate(),
        createdAt: new Date(),
      };
      if (this.eduEndDate()) data.endDate = this.eduEndDate();
      if (this.eduDescription()) data.description = this.eduDescription();
      if (this.eduGrade()) data.grade = this.eduGrade();
      await this.educationService.add(data);
    }

    this.resetEducationForm();
    this.loadEducation();
  }

  async deleteEducation(id: string) {
    await this.educationService.delete(id);
    this.loadEducation();
  }

  loadInternships() {
    this.internshipService.getAll().subscribe((data) => this.internships.set(data));
  }

  internAddTech() {
    if (this.internTechInput().trim()) {
      this.internTechnologies.update((arr) => [...arr, this.internTechInput().trim()]);
      this.internTechInput.set('');
    }
  }

  internRemoveTech(tech: string) {
    this.internTechnologies.update((arr) => arr.filter((t) => t !== tech));
  }

  editInternship(item: Internship) {
    this.internEditing.set(item.id || null);
    this.internCompany.set(item.company);
    this.internPosition.set(item.position);
    this.internStartDate.set(item.startDate);
    this.internEndDate.set(item.endDate || '');
    this.internDescription.set(item.description || '');
    this.internTechnologies.set([...item.technologies]);
    this.internProjectId.set(item.projectId || '');
    this.internCompanyUrl.set(item.companyUrl || '');
  }

  resetInternshipForm() {
    this.internCompany.set('');
    this.internPosition.set('');
    this.internStartDate.set('');
    this.internEndDate.set('');
    this.internDescription.set('');
    this.internTechnologies.set([]);
    this.internProjectId.set('');
    this.internCompanyUrl.set('');
    this.internEditing.set(null);
  }

  async saveInternship() {
    if (this.internEditing()) {
      const data: Partial<Internship> = {
        company: this.internCompany(),
        position: this.internPosition(),
        startDate: this.internStartDate(),
        technologies: this.internTechnologies(),
      };
      if (this.internEndDate()) data.endDate = this.internEndDate();
      if (this.internDescription()) data.description = this.internDescription();
      if (this.internProjectId()) data.projectId = this.internProjectId();
      if (this.internCompanyUrl()) data.companyUrl = this.internCompanyUrl();
      await this.internshipService.update(this.internEditing()!, data);
    } else {
      const data: Internship = {
        company: this.internCompany(),
        position: this.internPosition(),
        startDate: this.internStartDate(),
        technologies: this.internTechnologies(),
        createdAt: new Date(),
      };
      if (this.internEndDate()) data.endDate = this.internEndDate();
      if (this.internDescription()) data.description = this.internDescription();
      if (this.internProjectId()) data.projectId = this.internProjectId();
      if (this.internCompanyUrl()) data.companyUrl = this.internCompanyUrl();
      await this.internshipService.add(data);
    }

    this.resetInternshipForm();
    this.loadInternships();
  }

  async deleteInternship(id: string) {
    await this.internshipService.delete(id);
    this.loadInternships();
  }

  getProjectTitle(id: string | undefined): string {
    if (!id) return '';
    const p = this.projects().find((proj) => proj.id === id);
    return p ? p.title : '';
  }

  loadSongs() {
    this.songService.getAll().subscribe((data) => this.songs.set(data));
  }

  onSongFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.songAudioFile.set(input.files[0]);
  }

  async saveSong() {
    if (!this.songTitle() || !this.songAudioFile()) return;
    this.songUploading.set(true);
    try {
      await this.songService.upload(this.songTitle(), this.songAudioFile()!);
      this.songTitle.set('');
      this.songAudioFile.set(null);
    } catch (err) {
      console.error('Upload failed', err);
    }
    this.songUploading.set(false);
    this.loadSongs();
  }

  async deleteSong(id: string) {
    await this.songService.delete(id);
    this.loadSongs();
  }

  loadCertificates() {
    this.certificateService.getAll().subscribe((data) => this.certs.set(data));
  }

  onGalleryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.galleryFile.set(input.files[0]);
  }

  onCertFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.certFile.set(input.files[0]);
  }

  compressToWebP(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height / width) * maxWidth);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async saveGalleryItem() {
    let imageUrl = this.galleryImage();
    if (this.galleryFile()) {
      this.galleryUploading.set(true);
      imageUrl = await this.compressToWebP(this.galleryFile()!);
      this.galleryUploading.set(false);
    }
    const item: GalleryItem = {
      title: this.galleryTitle(),
      image: imageUrl,
      createdAt: new Date(),
    };
    if (this.galleryDescription()) (item as any).description = this.galleryDescription();
    if (this.galleryCategory()) (item as any).category = this.galleryCategory();
    await this.galleryService.add(item);
    this.galleryTitle.set('');
    this.galleryDescription.set('');
    this.galleryImage.set('');
    this.galleryCategory.set('');
    this.galleryFile.set(null);
  }

  async deleteGalleryItem(id: string) {
    await this.galleryService.delete(id);
  }

  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async saveCertificate() {
    let imageUrl = this.certImage();
    if (this.certFile()) {
      this.certUploading.set(true);
      try {
        if (this.certFile()!.type.startsWith('image/')) {
          imageUrl = await this.compressToWebP(this.certFile()!);
        } else {
          imageUrl = await this.fileToDataUrl(this.certFile()!);
        }
      } catch (err) {
        console.error('File processing failed', err);
      }
      this.certUploading.set(false);
    }
    const cert: Certificate = {
      title: this.certTitle(),
      issuer: this.certIssuer(),
      createdAt: new Date(),
    };
    if (this.certDate()) (cert as any).date = this.certDate();
    if (imageUrl) (cert as any).image = imageUrl;
    if (this.certLink()) (cert as any).link = this.certLink();
    if (this.certDescription()) (cert as any).description = this.certDescription();

    if (this.certEditing()) {
      await this.certificateService.update(this.certEditing()!, cert);
      this.certEditing.set(null);
    } else {
      await this.certificateService.add(cert);
    }

    this.certTitle.set('');
    this.certIssuer.set('');
    this.certDate.set('');
    this.certImage.set('');
    this.certLink.set('');
    this.certDescription.set('');
    this.certFile.set(null);
  }

  editCertificate(cert: Certificate) {
    this.certEditing.set(cert.id || null);
    this.certTitle.set(cert.title);
    this.certIssuer.set(cert.issuer);
    this.certDate.set(cert.date || '');
    this.certImage.set(cert.image || '');
    this.certLink.set(cert.link || '');
    this.certDescription.set(cert.description || '');
    this.certFile.set(null);
  }

  resetCertificateForm() {
    this.certTitle.set('');
    this.certIssuer.set('');
    this.certDate.set('');
    this.certImage.set('');
    this.certLink.set('');
    this.certDescription.set('');
    this.certFile.set(null);
    this.certEditing.set(null);
  }

  async deleteCertificate(id: string) {
    await this.certificateService.delete(id);
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((data) => {
      this.projects.set(data);
    });
  }

  loadMessages() {
    this.contactService.getMessages().subscribe((data) => {
      this.messages.set(data);
      this.adminNav.messageCount.set(data.length);
    });
  }

  addTech() {
    if (this.techInput().trim()) {
      this.technologies.update((arr) => [...arr, this.techInput().trim()]);
      this.techInput.set('');
    }
  }

  removeTech(tech: string) {
    this.technologies.update((arr) => arr.filter((t) => t !== tech));
  }

  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.imageFile.set(input.files[0]);
  }

  onGalleryFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.galleryFiles.set(Array.from(input.files));
    }
  }

  async saveProject() {
    let imageUrl = this.image();
    if (this.imageFile()) {
      imageUrl = await this.compressToWebP(this.imageFile()!);
    }
    let gallery = this.galleryUrls();
    if (this.galleryFiles().length) {
      for (const f of this.galleryFiles()) {
        gallery.push(await this.compressToWebP(f));
      }
    }
    const project: Project = {
      title: this.title(),
      problem: this.problem(),
      category: this.category(),
      technologies: this.technologies(),
      featured: this.featured(),
      createdAt: new Date(),
    };
    if (this.solution()) (project as any).solution = this.solution();
    if (imageUrl) (project as any).image = imageUrl;
    if (gallery.length) (project as any).gallery = gallery;
    if (this.github()) (project as any).github = this.github();
    if (this.live()) (project as any).live = this.live();
    if (this.downloadLink()) (project as any).downloadLink = this.downloadLink();

    if (this.editing()) {
      await this.projectService.updateProject(this.editing()!, project);
      this.editing.set(null);
    } else {
      await this.projectService.addProject(project);
    }

    this.resetForm();
    this.loadProjects();
  }

  editProject(p: Project) {
    this.editing.set(p.id || null);
    this.title.set(p.title);
    this.problem.set(p.problem);
    this.solution.set(p.solution || '');
    this.category.set(p.category);
    this.technologies.set([...p.technologies]);
    this.image.set(p.image || '');
    this.github.set(p.github || '');
    this.live.set(p.live || '');
    this.downloadLink.set(p.downloadLink || '');
    this.galleryUrls.set(p.gallery || []);
    this.featured.set(p.featured || false);
  }

  async deleteProject(id: string) {
    await this.projectService.deleteProject(id);
    this.loadProjects();
  }

  async markRead(id: string) {
    await this.contactService.markAsRead(id);
    this.loadMessages();
  }

  async deleteMessage(id: string) {
    await this.contactService.deleteMessage(id);
    this.selectedMessage.set(null);
    this.loadMessages();
  }

  viewMessage(msg: ContactMessage) {
    this.selectedMessage.set(msg);
    if (!msg.read) {
      this.markRead(msg.id!);
    }
  }

  closeView() {
    this.selectedMessage.set(null);
  }

  resetForm() {
    this.title.set('');
    this.problem.set('');
    this.solution.set('');
    this.category.set('');
    this.technologies.set([]);
    this.image.set('');
    this.imageFile.set(null);
    this.galleryFiles.set([]);
    this.galleryUrls.set([]);
    this.github.set('');
    this.live.set('');
    this.downloadLink.set('');
    this.featured.set(false);
    this.editing.set(null);
  }

  loadArticles() {
    this.articleService.getAll().subscribe((data) => this.articles.set(data));
  }

  onArticleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.articleImageFile.set(input.files[0]);
  }

  async saveArticle() {
    let imageUrl = this.articleImage();
    if (this.articleImageFile()) {
      imageUrl = await this.compressToWebP(this.articleImageFile()!);
    }
    const article: Article = {
      title: this.articleTitle(),
      date: this.articleDate(),
      content: this.articleContent(),
      type: this.articleType(),
      createdAt: new Date(),
    };
    if (imageUrl) (article as any).image = imageUrl;
    if (this.articleUrl()) (article as any).url = this.articleUrl();
    if (this.articleLockedUntil()) (article as any).lockedUntil = new Date(this.articleLockedUntil());

    if (this.articleEditing()) {
      await this.articleService.update(this.articleEditing()!, article);
      this.articleEditing.set(null);
    } else {
      await this.articleService.add(article);
    }

    this.articleTitle.set('');
    this.articleDate.set('');
    this.articleContent.set('');
    this.articleType.set('Article');
    this.articleUrl.set('');
    this.articleImage.set('');
    this.articleImageFile.set(null);
    this.articleLockedUntil.set('');
    this.loadArticles();
  }

  editArticle(a: Article) {
    this.articleEditing.set(a.id || null);
    this.articleTitle.set(a.title);
    this.articleDate.set(a.date);
    this.articleContent.set(a.content);
    this.articleType.set(a.type);
    this.articleUrl.set(a.url || '');
    this.articleImage.set(a.image || '');
    this.articleLockedUntil.set(a.lockedUntil ? new Date(a.lockedUntil).toISOString().slice(0, 16) : '');
  }

  resetArticleForm() {
    this.articleEditing.set(null);
    this.articleTitle.set('');
    this.articleDate.set('');
    this.articleContent.set('');
    this.articleType.set('Article');
    this.articleUrl.set('');
    this.articleImage.set('');
    this.articleImageFile.set(null);
    this.articleLockedUntil.set('');
  }

  async deleteArticle(id: string) {
    await this.articleService.delete(id);
    this.loadArticles();
  }

  formatDate(d: Date | any): string {
    if (!d) return '';
    const date = d.toDate ? d.toDate() : new Date(d);
    return date.toLocaleDateString();
  }
}
