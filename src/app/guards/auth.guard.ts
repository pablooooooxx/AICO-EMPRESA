import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia para proteger rutas que requieren autenticación (ej: /home)
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir a login si no está autenticado
  router.navigate(['/login'], { replaceUrl: true });
  return false;
};

/**
 * Guardia para evitar que usuarios ya autenticados ingresen a /login o /register
 */
export const autoLoginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/home'], { replaceUrl: true });
    return false;
  }

  return true;
};
