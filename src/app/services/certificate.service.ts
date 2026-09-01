import { Injectable, inject } from '@angular/core';
import {
  collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot, Firestore, Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Certificate } from '../models/certificate.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private firestore: Firestore;
  private ref;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.ref = collection(this.firestore, 'certificates');
  }

  getAll(): Observable<Certificate[]> {
    return new Observable<Certificate[]>((observer) => {
      const q = query(this.ref, orderBy('createdAt', 'desc'));
      const unsub: Unsubscribe = onSnapshot(q, (snap) =>
        observer.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Certificate)),
        (err) => observer.error(err),
      );
      return { unsubscribe: unsub };
    });
  }

  async add(item: Certificate) { await addDoc(this.ref, item); }
  async update(id: string, data: Partial<Certificate>) { await updateDoc(doc(this.firestore, 'certificates', id), data); }
  async delete(id: string) { await deleteDoc(doc(this.firestore, 'certificates', id)); }
}
