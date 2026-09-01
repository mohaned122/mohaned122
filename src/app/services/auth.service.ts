import { Injectable, inject } from '@angular/core';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth;
  private _user: User | null = null;

  constructor() {
    const fb = inject(FirebaseService);
    this.auth = fb.auth;
    onAuthStateChanged(this.auth, (user) => {
      this._user = user;
    });
  }

  get user(): User | null {
    return this._user;
  }

  get isLoggedIn(): boolean {
    return this._user !== null;
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
