import { Injectable, inject } from '@angular/core';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private firestore: Firestore;
  private articlesRef;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.articlesRef = collection(this.firestore, 'articles');
  }

  getAll(): Observable<Article[]> {
    return new Observable<Article[]>((observer) => {
      const q = query(this.articlesRef, orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Article);
          observer.next(items);
        },
        (error) => observer.error(error)
      );
      return { unsubscribe };
    });
  }

  async add(article: Article): Promise<void> {
    await addDoc(this.articlesRef, article);
  }

  async update(id: string, data: Partial<Article>): Promise<void> {
    const docRef = doc(this.firestore, 'articles', id);
    await updateDoc(docRef, data);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'articles', id);
    await deleteDoc(docRef);
  }
}
