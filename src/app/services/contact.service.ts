import { Injectable, inject } from '@angular/core';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { ContactMessage } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private firestore: Firestore;
  private messagesRef;

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.messagesRef = collection(this.firestore, 'messages');
  }

  async sendMessage(message: ContactMessage): Promise<void> {
    await addDoc(this.messagesRef, message);
  }

  getMessages(): Observable<ContactMessage[]> {
    return new Observable<ContactMessage[]>((observer) => {
      const q = query(this.messagesRef, orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as ContactMessage
          );
          observer.next(messages);
        },
        (error) => observer.error(error)
      );
      return { unsubscribe };
    });
  }

  async markAsRead(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'messages', id);
    await updateDoc(docRef, { read: true });
  }

  async deleteMessage(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'messages', id);
    await deleteDoc(docRef);
  }
}
