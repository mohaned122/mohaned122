import { Injectable, inject } from '@angular/core';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private firestore: Firestore;
  private projectsRef;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.projectsRef = collection(this.firestore, 'projects');
  }

  getProjects(): Observable<Project[]> {
    return new Observable<Project[]>((observer) => {
      const q = query(this.projectsRef, orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projects = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Project
          );
          observer.next(projects);
        },
        (error) => observer.error(error)
      );
      return { unsubscribe };
    });
  }

  getProjectsByCategory(category: string): Observable<Project[]> {
    return new Observable<Project[]>((observer) => {
      const q = query(
        this.projectsRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projects = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Project
          );
          observer.next(projects);
        },
        (error) => observer.error(error)
      );
      return { unsubscribe };
    });
  }

  async addProject(project: Project): Promise<void> {
    await addDoc(this.projectsRef, project);
  }

  async updateProject(id: string, project: Partial<Project>): Promise<void> {
    const docRef = doc(this.firestore, 'projects', id);
    await updateDoc(docRef, project);
  }

  async deleteProject(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'projects', id);
    await deleteDoc(docRef);
  }
}
