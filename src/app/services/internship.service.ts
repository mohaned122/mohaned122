import { Injectable, inject } from '@angular/core';
import {
  collection, addDoc, deleteDoc, doc, updateDoc, query, onSnapshot, Firestore, Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Internship } from '../models/internship.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class InternshipService {
  private firestore: Firestore;
  private ref;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.ref = collection(this.firestore, 'internships');
  }

  getAll(): Observable<Internship[]> {
    return new Observable<Internship[]>((observer) => {
      const q = query(this.ref);
      const unsub: Unsubscribe = onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Internship);
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

  async add(item: Internship) { await addDoc(this.ref, item); }
  async update(id: string, data: Partial<Internship>) { await updateDoc(doc(this.firestore, 'internships', id), data); }
  async delete(id: string) { await deleteDoc(doc(this.firestore, 'internships', id)); }
}
