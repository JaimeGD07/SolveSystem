import { Routes } from '@angular/router';

export const ENCUESTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/listado-encuestas/listado-encuestas.component')
        .then((m) => m.ListadoEncuestasComponent),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/crear-encuesta/crear-encuesta.component')
        .then((m) => m.CrearEncuestaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detalle-encuesta/detalle-encuesta.component')
        .then((m) => m.DetalleEncuestaComponent),
  },
  {
    path: ':id/responder',
    loadComponent: () =>
      import('./pages/responder-encuesta/responder-encuesta.component')
        .then((m) => m.ResponderEncuestaComponent),
  },
  {
    path: ':id/resultados',
    loadComponent: () =>
      import('./pages/resultados-encuesta/resultados-encuesta.component')
        .then((m) => m.ResultadosEncuestaComponent),
  },
];
