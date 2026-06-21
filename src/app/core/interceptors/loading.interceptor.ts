import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

/**
 * Incrementa/decrementa el contador de peticiones activas en LoadingService
 * para poder mostrar un loader global (spinner/progress bar) en el shell
 * de la aplicación.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.increment();

  return next(req).pipe(finalize(() => loading.decrement()));
};
