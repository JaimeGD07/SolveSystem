import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '', // Ruta raíz
    loadComponent: () => import('./features/auth/pages/landing/landing.component').then(m => m.LandingComponent),
    // Puedes protegerlo con guestGuard si no quieres que usuarios ya logueados la vean
  },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then((m) => m.AUTH_ROUTES),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes')
        .then((m) => m.DASHBOARD_ROUTES),
  },

  {
    path: 'encuestas',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/encuestas/encuestas.routes')
        .then((m) => m.ENCUESTAS_ROUTES),
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
