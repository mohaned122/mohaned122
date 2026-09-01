import { Injectable, inject } from '@angular/core';
import {
  collection, addDoc, deleteDoc, doc, updateDoc, query, onSnapshot, Firestore, Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Education } from '../models/education.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private firestore: Firestore;
  private ref;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.ref = collection(this.firestore, 'education');
  }

  getAll(): Observable<Education[]> {
    return new Observable<Education[]>((observer) => {
      const q = query(this.ref);
      const unsub: Unsubscribe = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Education);
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
          return dateB - dateA;
        });
        observer.next(list);
      }, (err) => observer.error(err));
      return { unsubscribe: unsub };
    });
  }

  async add(item: Education) { await addDoc(this.ref, item); }
  async update(id: string, data: Partial<Education>) { await updateDoc(doc(this.firestore, 'education', id), data); }
  async delete(id: string) { await deleteDoc(doc(this.firestore, 'education', id)); }
}
