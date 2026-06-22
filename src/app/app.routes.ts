import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '', // Ruta raíz
    loadComponent: () =>
      import('./features/auth/pages/landing/landing.component')
        .then(m => m.LandingComponent),
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

  // Rutas pendientes del Sidebar/Dashboard mapeadas al PlaceholderPageComponent
  // {
  //   path: 'gestion',
  //   canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./features/placeholder-page/placeholder-page.component')
  //       .then((m) => m.PlaceholderPageComponent),
  //   data: { title: 'Gestión de Usuarios' }
  // },
  // RUTA DE GESTIÓN DE USUARIOS
  {
    path: 'gestion',
    loadComponent: () => import('./features/admin/pages/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent)
  },
  {
    path: 'gestion/crear',
    loadComponent: () => import('./features/admin/pages/crear-usuario/crear-usuario.component').then(m => m.CrearUsuarioComponent)
  },
  {
    path: 'config',
    loadComponent: () => import('./features/admin/pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
  },
  {
    path: 'gestion/roles',
    loadComponent: () => import('./features/admin/pages/gestion-roles/gestion-roles.component').then(m => m.GestionRolesComponent)
  },
  {
    path: 'gestion/catalogos',
    loadComponent: () => import('./features/admin/pages/gestion-catalogos/gestion-catalogos.component').then(m => m.GestionCatalogosComponent)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/admin/pages/reportes/reportes.component').then(m => m.ReportesComponent)
  },
  {
    path: 'auditoria',
    loadComponent: () => import('./features/admin/pages/auditoria/auditoria.component').then(m => m.AuditoriaComponent)
  },
  // {
  //   path: 'config',
  //   canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./features/placeholder-page/placeholder-page.component')
  //       .then((m) => m.PlaceholderPageComponent),
  //   data: { title: 'Configuración del Sistema' }
  // },
  // {
  //   path: 'reportes',
  //   canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./features/placeholder-page/placeholder-page.component')
  //       .then((m) => m.PlaceholderPageComponent),
  //   data: { title: 'Reportes Generales' }
  // },
  // {
  //   path: 'auditoria',
  //   canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./features/placeholder-page/placeholder-page.component')
  //       .then((m) => m.PlaceholderPageComponent),
  //   data: { title: 'Bitácora de Auditoría' }
  // },
  {
    path: 'respuestas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/encuestas/pages/respuestas-recibidas/respuestas-recibidas.component')
        .then((m) => m.RespuestasRecibidasComponent),
    data: { title: 'Buzón de Respuestas Recibidas' }
  },
  {
    path: 'analisis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/encuestas/pages/analisis-estadistico/analisis-estadistico.component')
        .then((m) => m.AnalisisEstadisticoComponent),
    data: { title: 'Análisis Estadístico' }
  },
  {
    path: 'encuestas-disponibles',
    redirectTo: 'encuestas',
    pathMatch: 'full'
  },
  {
    path: 'mis-respuestas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/encuestas/pages/mis-respuestas/mis-respuestas.component')
        .then((m) => m.MisRespuestasComponent),
    data: { title: 'Mis Respuestas Enviadas' }
  },
  {
    path: 'historial',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/encuestas/pages/historial/historial.component')
        .then((m) => m.HistorialComponent),
    data: { title: 'Historial de Participación' }
  },
  {
    path: 'preferencias',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/encuestas/pages/preferencias/preferencias.component')
        .then((m) => m.PreferenciasComponent),
    data: { title: 'Preferencias de Cuenta' }
  },

  //**
  //  { path: '**', redirectTo: 'dashboard',}, */

  {
    path: '**',
    loadComponent: () => import('./features/errors/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
