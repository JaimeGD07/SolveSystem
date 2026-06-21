import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes'; // Definido/gestionado por ChatGPT (routing + guards)
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

/**
 * NOTA: El orden de los interceptores importa.
 * 1. auth     -> adjunta el token antes de salir.
 * 2. loading  -> marca la petición como "activa" ya con headers finales.
 * 3. error    -> captura cualquier fallo de la cadena anterior.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
  ],
};
