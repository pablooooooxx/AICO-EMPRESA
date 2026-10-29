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

  public isTeacher(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'teacher';
  }

  public isStudent(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'student';
  }

  public register(userData: { name: string; email: string; password: string; role?: 'student' | 'teacher'; autoLogin?: boolean }): { success: boolean; message: string; user?: User } {
    const users = this.getStoredUsers();
    const normalizedEmail = userData.email.trim().toLowerCase();

    const exists = users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const role: 'student' | 'teacher' = userData.role || 'student';
    const newUser: User = {
      id: this.generateId(),
      name: userData.name.trim(),
      email: normalizedEmail,
      password: userData.password,
      role: role,
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

    users.push(newUser);
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));

    // Si autoLogin está activo (o por defecto true), iniciar sesión
    const shouldLogin = userData.autoLogin !== false;
    if (shouldLogin) {
      const session: AuthSession = {
        user: { ...newUser },
        token: 'jwt-mock-' + newUser.id + '-' + Date.now()
      };
      this.saveSession(session);
    }

    return { 
      success: true, 
      message: `¡Registro exitoso! Cuenta de ${role === 'student' ? 'Estudiante' : 'Profesor'} creada correctamente.`, 
      user: newUser 
    };
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

    // Asegurar que tenga rol
    if (!user.role) {
      user.role = 'student';
    }
    if (user.coins === undefined) {
      user.coins = user.role === 'student' ? 1250 : 500;
    }

    const session: AuthSession = {
      user: { ...user },
      token: 'jwt-mock-' + user.id + '-' + Date.now()
    };
    this.saveSession(session);

    return { 
      success: true, 
      message: `¡Bienvenido de nuevo, ${user.name}! (${user.role === 'teacher' ? 'Docente' : 'Estudiante'})`, 
      user: session.user 
    };
  }

  public updateCurrentUser(partialUser: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;

    const updated: User = { ...current, ...partialUser };
    const session = this.getStoredSession();
    if (session) {
      session.user = updated;
      this.saveSession(session);
    }

    // Actualizar también en lista de usuarios
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === current.id || u.email === current.email);
    if (index !== -1) {
      users[index] = { ...users[index], ...partialUser };
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    }
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
    let updated = false;

    // Verificar o agregar demo estudiante
    if (!users.some(u => u.email === 'estudiante@saberstyle.com')) {
      users.push({
        id: 'usr_student_demo',
        name: 'Juan Pérez',
        email: 'estudiante@saberstyle.com',
        password: 'password123',
        role: 'student',
        coins: 1250,
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
      });
      updated = true;
    }

    // Verificar o agregar demo profesor
    if (!users.some(u => u.email === 'profesor@saberstyle.com')) {
      users.push({
        id: 'usr_teacher_demo',
        name: 'Prof. Carlos Ramírez',
        email: 'profesor@saberstyle.com',
        password: 'password123',
        role: 'teacher',
        coins: 500,
        createdAt: new Date().toISOString()
      });
      updated = true;
    }

    // Retrocompatibilidad con demo@aico.com
    if (!users.some(u => u.email === 'demo@aico.com')) {
      users.push({
        id: 'usr_demo_1',
        name: 'Juan Pérez (Demo)',
        email: 'demo@aico.com',
        password: 'password123',
        role: 'student',
        coins: 1250,
        createdAt: new Date().toISOString()
      });
      updated = true;
    }

    if (updated) {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }

  private generateId(): string {
    return 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }
}
