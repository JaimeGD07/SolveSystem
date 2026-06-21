# Arquitectura Frontend — Sistema de Encuestas (Solve)

## Estructura de carpetas

```
src/
├── environments/
│   ├── environment.ts              # producción
│   └── environment.development.ts  # local
└── app/
    ├── core/                       # Singletons: servicios, interceptores, modelos base
    │   ├── interceptors/
    │   │   ├── auth.interceptor.ts
    │   │   ├── error.interceptor.ts
    │   │   └── loading.interceptor.ts
    │   ├── services/
    │   │   ├── api.service.ts          # Wrapper genérico sobre HttpClient
    │   │   ├── encuesta.service.ts     # Ejemplo de servicio de dominio
    │   │   ├── notification.service.ts # Sistema de alertas (Signals)
    │   │   └── loading.service.ts      # Estado global de carga (Signals)
    │   └── models/
    │       ├── api-response.model.ts   # Wrapper genérico de respuesta Spring Boot
    │       └── encuesta.model.ts       # DTO de ejemplo (placeholder)
    ├── features/                   # Módulos de negocio, lazy-loaded (Gemini + ChatGPT)
    │   ├── encuestas/
    │   ├── auth/
    │   └── dashboard/
    ├── shared/                     # Componentes/pipes/directivas reutilizables y "tontos"
    │   ├── components/
    │   ├── pipes/
    │   └── directives/
    ├── layout/                     # Shell de la app (header, sidebar, footer)
    │   ├── header/
    │   ├── sidebar/
    │   └── footer/
    └── app.config.ts               # provideHttpClient + interceptores registrados
```

## Decisiones clave

**core/ vs features/ vs shared/.** `core` contiene todo lo que es singleton y
transversal a la app (servicios `providedIn: 'root'`, interceptores, modelos
base). `features` contiene los módulos de negocio que se cargarán de forma
lazy vía `loadChildren`/`loadComponent` (responsabilidad de ChatGPT en
`app.routes.ts`). `shared` solo debe tener piezas "tontas" sin estado de
negocio ni llamadas HTTP propias.

**ApiService como capa única de acceso HTTP.** Ningún componente ni servicio
de dominio debe inyectar `HttpClient` directamente. Todo pasa por
`ApiService`, que centraliza la `baseUrl` (desde `environment`) y los
métodos `get/getById/post/put/patch/delete`, todos tipados con genéricos y
devolviendo `ApiResponse<T>`.

**Patrón de servicio de dominio (`EncuestaService`).** Cada feature que
necesite estado compartido debe seguir este patrón: signals privados
(`_encuestas`), expuestos como `readonly` (`.asReadonly()`), con `computed()`
para estado derivado, y métodos públicos que orquestan la llamada a
`ApiService` + actualización del signal + notificación de éxito/error. Así
los componentes solo leen signals, nunca mutan estado HTTP directamente.

**Sistema de alertas (`NotificationService`).** Expone un signal de solo
lectura `notifications()` con un array de `AppNotification`. Cualquier
servicio o interceptor puede llamar a `.success()/.error()/.warning()/.info()`.
La pieza visual (`toast-container`) que lea ese signal y la pinte queda
para la capa de UI.

**Interceptores funcionales (`HttpInterceptorFn`).** Angular 21 usa
interceptores como funciones puras, no clases con `HttpInterceptor`. Se
registran con `withInterceptors([...])` en `provideHttpClient()`. El orden
en `app.config.ts` es: auth → loading → error.

**Modelos como placeholders.** `encuesta.model.ts` y `api-response.model.ts`
son ejemplos razonables basados en convenciones comunes de Spring Boot. En
cuanto el equipo confirme los DTOs reales (campos, nombres exactos,
formato de fechas, wrapper de respuesta real), hay que actualizar estas
interfaces para que coincidan 1:1 — es el punto #1 de la regla de
"TypeScript Avanzado" del proyecto.

## Pendiente / a coordinar con el equipo

- `app.routes.ts` y los guards de seguridad → ChatGPT.
- Componentes visuales de `features/`, `shared/components/` y `layout/` → Gemini.
- Confirmar el contrato real de `ApiResponse<T>` contra el backend (¿siempre
  envuelve la respuesta así, o solo en ciertos endpoints?).
- Confirmar dónde vive el token de auth (localStorage vs cookie httpOnly)
  antes de cerrar `auth.interceptor.ts` definitivamente.
