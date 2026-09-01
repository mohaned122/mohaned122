import { Injectable, inject } from '@angular/core';
import {
  collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot, Firestore, Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { GalleryItem } from '../models/gallery.model';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private firestore: Firestore;
  private ref;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.ref = collection(this.firestore, 'gallery');
  }

  getAll(): Observable<GalleryItem[]> {
    return new Observable<GalleryItem[]>((observer) => {
      const q = query(this.ref, orderBy('createdAt', 'desc'));
      const unsub: Unsubscribe = onSnapshot(q, (snap) =>
        observer.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GalleryItem)),
        (err) => observer.error(err),
      );
      return { unsubscribe: unsub };
    });
  }

  async add(item: GalleryItem) { await addDoc(this.ref, item); }
  async update(id: string, data: Partial<GalleryItem>) { await updateDoc(doc(this.firestore, 'gallery', id), data); }
  async delete(id: string) { await deleteDoc(doc(this.firestore, 'gallery', id)); }
}
