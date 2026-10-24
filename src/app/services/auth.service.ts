import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthSession } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_STORAGE_KEY = 'aico_users';
  private readonly SESSION_STORAGE_KEY = 'aico_session';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private router: Router) {
    this.initDefaultUsers();
    const storedSession = this.getStoredSession();
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedSession ? storedSession.user : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.getStoredSession();
  }

  public register(userData: { name: string; email: string; password: string }): { success: boolean; message: string; user?: User } {
    const users = this.getStoredUsers();
    const normalizedEmail = userData.email.trim().toLowerCase();

    const exists = users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const newUser: User = {
      id: this.generateId(),
      name: userData.name.trim(),
      email: normalizedEmail,
      password: userData.password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));

    // Iniciar sesión automáticamente tras el registro
    const session: AuthSession = {
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token: 'jwt-mock-' + newUser.id + '-' + Date.now()
    };
    this.saveSession(session);

    return { success: true, message: '¡Registro exitoso! Bienvenido a AICO.', user: session.user };
  }

  public login(credentials: { email: string; password: string }): { success: boolean; message: string; user?: User } {
    const users = this.getStoredUsers();
    const normalizedEmail = credentials.email.trim().toLowerCase();

    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, message: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    if (user.password !== credentials.password) {
      return { success: false, message: 'La contraseña ingresada es incorrecta.' };
    }

    const session: AuthSession = {
      user: { id: user.id, name: user.name, email: user.email },
      token: 'jwt-mock-' + user.id + '-' + Date.now()
    };
    this.saveSession(session);

    return { success: true, message: `¡Bienvenido de nuevo, ${user.name}!`, user: session.user };
  }

  public logout(): void {
    localStorage.removeItem(this.SESSION_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(session));
    this.currentUserSubject.next(session.user);
  }

  private getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(this.SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private getStoredUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private initDefaultUsers(): void {
    const users = this.getStoredUsers();
    if (users.length === 0) {
      const defaultUser: User = {
        id: 'usr_demo_1',
        name: 'Usuario Demo',
        email: 'demo@aico.com',
        password: 'password123',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify([defaultUser]));
    }
  }

  private generateId(): string {
    return 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }
}
