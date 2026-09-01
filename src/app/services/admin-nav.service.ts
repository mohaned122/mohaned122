import { Injectable, signal } from '@angular/core';

export type AdminTab = 'projects' | 'messages' | 'gallery' | 'certificates' | 'articles' | 'education' | 'internship' | 'music';

@Injectable({ providedIn: 'root' })
export class AdminNavService {
  activeTab = signal<AdminTab>('projects');
  messageCount = signal(0);
}