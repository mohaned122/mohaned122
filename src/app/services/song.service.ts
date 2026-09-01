import { Injectable, inject } from '@angular/core';
import {
  collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, getDocs,
  where, Firestore, Unsubscribe, writeBatch,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Song } from '../models/song.model';
import { FirebaseService } from './firebase.service';
import { AudioCompressorService } from './audio-compressor.service';

const CHUNK_SIZE = 500_000;

@Injectable({ providedIn: 'root' })
export class SongService {
  private firestore: Firestore;
  private songsRef;
  private compressor = inject(AudioCompressorService);

  constructor() {
    const fb = inject(FirebaseService);
    this.firestore = fb.firestore;
    this.songsRef = collection(this.firestore, 'songs');
  }

  getAll(): Observable<Song[]> {
    return new Observable<Song[]>((observer) => {
      const q = query(this.songsRef, orderBy('createdAt', 'desc'));
      const unsub: Unsubscribe = onSnapshot(
        q,
        (snap) => observer.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Song)),
        () => observer.next([]),
      );
      return { unsubscribe: unsub };
    });
  }

  async upload(title: string, file: File): Promise<void> {
    const { parts, total, mime } = await this.compressor.compressAndSplit(file);
    const songRef = doc(collection(this.firestore, 'songs'));
    const song: Song = { title, createdAt: new Date(), audioParts: total, mime };
    const batch = writeBatch(this.firestore);
    batch.set(songRef, song);

    for (let i = 0; i < parts.length; i++) {
      const partRef = doc(collection(this.firestore, 'songs', songRef.id, 'parts'));
      batch.set(partRef, { index: i, data: parts[i] });
    }
    await batch.commit();
  }

  async getAudio(songId: string): Promise<string> {
    const partsRef = collection(this.firestore, 'songs', songId, 'parts');
    const q = query(partsRef, orderBy('index'));
    const snap = await getDocs(q);
    const chunks = snap.docs.map((d) => d.data()['data'] as string);
    return this.compressor.joinParts(chunks);
  }

  async delete(id: string) {
    const partsRef = collection(this.firestore, 'songs', id, 'parts');
    const snap = await getDocs(partsRef);
    const batch = writeBatch(this.firestore);
    batch.delete(doc(this.firestore, 'songs', id));
    snap.docs.forEach((d) => batch.delete(doc(this.firestore, 'songs', id, 'parts', d.id)));
    await batch.commit();
  }
}
