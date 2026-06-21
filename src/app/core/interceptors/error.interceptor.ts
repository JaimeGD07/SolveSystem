import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

/**
 * Captura cualquier error HTTP, dispara una notificación legible
 * para el usuario y re-lanza el error para que el componente/servicio
 * que originó la petición pueda reaccionar si lo necesita.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notification.error(resolverMensajeError(error));
      return throwError(() => error);
    })
  );
};

function resolverMensajeError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }
  if (error.status === 401) {
    return 'Sesión expirada. Por favor inicia sesión nuevamente.';
  }
  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (error.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde.';
  }
  return error.error?.message ?? 'Ocurrió un error inesperado.';
}
