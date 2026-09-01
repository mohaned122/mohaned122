import { Injectable, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private _firestore: Firestore;
  private _auth: Auth;
  private _storage: FirebaseStorage;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this._firestore = getFirestore(this.app);
    this._auth = getAuth(this.app);
    this._storage = getStorage(this.app);
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get auth(): Auth {
    return this._auth;
  }

  get storage(): FirebaseStorage {
    return this._storage;
  }
}
