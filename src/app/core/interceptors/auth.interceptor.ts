import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'auth_token';

/**
 * Adjunta el Bearer token (si existe) a toda petición saliente.
 * La lógica de DÓNDE se guarda el token (localStorage vs cookie httpOnly
 * vs un AuthService con signal) debe coordinarse con ChatGPT, dueño de
 * los Guards de seguridad y el flujo de autenticación/routing.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
