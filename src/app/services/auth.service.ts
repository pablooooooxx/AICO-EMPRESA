import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../models/user.model';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, async firebaseUser => {
      if (!firebaseUser) {
        this.currentUserSubject.next(null);
        return;
      }

      try {
        const userRef = doc(this.firestore, 'usuarios', firebaseUser.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          this.currentUserSubject.next(snapshot.data() as User);
        } else {
          this.currentUserSubject.next(null);
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }
    });
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  isTeacher(): boolean {
    return this.currentUserValue?.role === 'teacher';
  }

  isStudent(): boolean {
    return this.currentUserValue?.role === 'student';
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'teacher';
    autoLogin?: boolean;
  }): Promise<{ success: boolean; message: string; user?: User }> {

    try {
      const email = userData.email.trim().toLowerCase();
      const role = userData.role || 'student';

      const credential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        userData.password
      );

      const newUser: User = {
        id: credential.user.uid,
        name: userData.name.trim(),
        email,
        role,
        coins: role === 'student' ? 1250 : 500,
        avatarConfig: {
          skinColor: '#f8d9b6',
          hairId: 'cabello-moderno',
          topId: 'hoodie-galaxia',
          bottomId: 'pantalon-urbano',
          shoesId: 'sneakers-pro',
          accessoryId: 'gorra-snoopy',
          expression: 'Feliz'
        },
        createdAt: new Date().toISOString()
      };

      const userRef = doc(this.firestore, 'usuarios', credential.user.uid);

      await setDoc(userRef, newUser);

      if (userData.autoLogin === false) {
        await signOut(this.auth);
        this.currentUserSubject.next(null);
      } else {
        this.currentUserSubject.next(newUser);
      }

      return {
        success: true,
        message: '¡Registro exitoso! Tu cuenta ha sido creada.',
        user: newUser
      };

    } catch (error: any) {
      console.error('Error registrando usuario:', error);

      let message = 'No se pudo crear la cuenta. Inténtalo nuevamente.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya tiene una cuenta registrada.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido.';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (
        error.code === 'permission-denied' ||
        error.code === 'firestore/permission-denied'
      ) {
        message = 'No hay permisos para guardar el perfil en Firestore.';
      }

      return { success: false, message };
    }
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {

    try {
      const email = credentials.email.trim().toLowerCase();

      const credential = await signInWithEmailAndPassword(
        this.auth,
        email,
        credentials.password
      );

      const userRef = doc(
        this.firestore,
        'usuarios',
        credential.user.uid
      );

      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        await signOut(this.auth);

        return {
          success: false,
          message: 'No se encontró el perfil de esta cuenta.'
        };
      }

      const user = snapshot.data() as User;
      this.currentUserSubject.next(user);

      return {
        success: true,
        message: `¡Bienvenido de nuevo, ${user.name}!`,
        user
      };

    } catch (error: any) {
      console.error('Error iniciando sesión:', error);

      let message = 'No se pudo iniciar sesión. Inténtalo nuevamente.';

      if (
        ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password']
          .includes(error.code)
      ) {
        message = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'El correo electrónico no es válido.';
      }

      return { success: false, message };
    }
  }

  async updateCurrentUser(partialUser: Partial<User>): Promise<void> {
    const current = this.currentUserValue;

    if (!current || !this.auth.currentUser) return;

    const updated: User = { ...current, ...partialUser };

    const userRef = doc(
      this.firestore,
      'usuarios',
      this.auth.currentUser.uid
    );

    await updateDoc(userRef, partialUser);

    this.currentUserSubject.next(updated);
  }

  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(
      this.auth,
      email.trim().toLowerCase()
    );
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);

    await this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }
}