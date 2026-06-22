# Arquitectura del Sistema — Solve (Sistema de Encuestas)

## 📋 Descripción General

**Solve** es una aplicación web para gestión de encuestas construida con **Angular 21**, TypeScript y Tailwind CSS. La arquitectura sigue patrones modernos de Angular con componentes standalone, lazy loading, signals para gestión de estado y una clara separación de responsabilidades.

### Tecnología Base
- **Framework**: Angular 21.2.0
- **Lenguaje**: TypeScript 5.9.2
- **Estilos**: Tailwind CSS 4.1.12 + PostCSS
- **HTTP**: Fetch API (via Angular)
- **Testing**: Vitest 4.0.8 + Jasmine
- **Node**: npm 11.12.1
- **Backend**: Spring Boot (REST API)

---

## 🏗️ Estructura de Carpetas

```
src/
├── environments/                    # Configuración por ambiente
│   ├── environment.ts              # Producción
│   └── environment.development.ts  # Desarrollo
│
├── app/
│   ├── core/                       # Singletons y capas transversales
│   │   ├── guards/
│   │   │   ├── auth.guard.ts      # Protege rutas autenticadas
│   │   │   └── guest.guard.ts     # Protege rutas públicas (no logueados)
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts      # Adjunta token JWT
│   │   │   ├── error.interceptor.ts     # Manejo centralizado de errores HTTP
│   │   │   └── loading.interceptor.ts   # Estado global de carga
│   │   ├── services/
│   │   │   ├── api.service.ts           # Capa HTTP genérica (wrapper HttpClient)
│   │   │   ├── auth.service.ts          # Gestión de autenticación y token
│   │   │   ├── encuesta.service.ts      # Servicio de dominio de encuestas
│   │   │   ├── notification.service.ts  # Sistema de notificaciones (toasts)
│   │   │   └── loading.service.ts       # Estado global de loading
│   │   └── models/
│   │       ├── api-response.model.ts   # DTO genérico de respuesta Spring Boot
│   │       └── encuesta.model.ts       # DTO de encuestas (placeholder)
│   │
│   ├── features/                   # Módulos de negocio (lazy-loaded)
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   └── pages/
│   │   │       ├── landing/        # Landing page pública
│   │   │       └── login/          # Formulario de login
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.routes.ts
│   │   │   └── pages/
│   │   │       └── dashboard/      # Dashboard principal (post-login)
│   │   │
│   │   ├── encuestas/              # Módulo principal de encuestas
│   │   │   ├── encuestas.routes.ts
│   │   │   └── pages/
│   │   │       ├── listado-encuestas/
│   │   │       ├── crear-encuesta/
│   │   │       ├── responder-encuesta/
│   │   │       ├── mis-respuestas/
│   │   │       ├── resultados-encuesta/
│   │   │       ├── analisis-estadistico/
│   │   │       ├── historial/
│   │   │       ├── preferencias/
│   │   │       ├── detalle-encuesta/
│   │   │       └── respuestas-recibidas/
│   │   │
│   │   ├── errors/
│   │   │   └── pages/
│   │   │       └── not-found/      # Página 404
│   │   │
│   │   └── placeholder-page/       # Componente temporal para rutas sin implementar
│   │
│   ├── shared/                     # Componentes y utilidades reutilizables
│   │   ├── components/
│   │   │   ├── action-card/
│   │   │   └── metric-card/
│   │   ├── pipes/
│   │   └── directives/
│   │
│   ├── layout/                     # Shell de la aplicación
│   │   ├── header/                 # Barra superior (nav, usuario, logout)
│   │   ├── sidebar/                # Navegación lateral
│   │   └── footer/                 # Pie de página
│   │
│   ├── app.routes.ts               # Configuración de rutas
│   ├── app.config.ts               # Providers globales
│   ├── app.ts                      # Componente raíz
│   ├── app.css                     # Estilos globales
│   └── app.html                    # Template raíz
│
└── index.html                      # Punto de entrada HTML
```

---

## 🔄 Flujo de Datos

### 1. Componente → Servicio → API
```
Component (lectura de signals)
    ↓
  Llama a método público en DomainService (ej: EncuestaService)
    ↓
  DomainService orquesta:
    • Llamada a ApiService (tipada)
    • Actualización de signal privado
    • Notificación de éxito/error
    ↓
  Component reactivo a cambios del signal (via template binding)
```

### 2. Ciclo de Petición HTTP
```
Component/Service hace llamada
    ↓
  [1] authInterceptor     → Adjunta JWT si existe
    ↓
  [2] loadingInterceptor  → Marca como "cargando"
    ↓
  [3] HttpClient          → Envía petición Fetch
    ↓
  Backend (Spring Boot)
    ↓
  Respuesta ApiResponse<T>
    ↓
  errorInterceptor        → Valida success/error
    ↓
  loadingInterceptor      → Marca como completo
    ↓
  Component recibe Observable
    ↓
  async pipe o .subscribe() actualiza signal
```

---

## 🎯 Capas Arquitectónicas

### Capa de Presentación (Components)
- **Responsabilidad**: Renderizar UI, capturar eventos de usuario
- **Patrón**: Componentes **standalone** con `changeDetection: OnPush`
- **Estado**: Solo lectura de signals (nunca mutación directa)
- **Templates**: Control flow nativo (`@if`, `@for`, `@switch`)
- **Estilos**: Tailwind CSS + ngclass bindings

### Capa de Negocio (Services + Signals)
- **Responsabilidad**: Orquestar datos, validar reglas de negocio
- **Patrón**: Servicios de dominio (`providedIn: 'root'`)
- **Estado**: Signals privados + computed signals
- **HTTP**: Solo vía `ApiService` (nunca `HttpClient` directo)
- **Notificaciones**: Via `NotificationService`

### Capa de Acceso a Datos (API Service)
- **Responsabilidad**: Comunicación HTTP con backend
- **Métodos**: `get<T>()`, `getById<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`
- **Configuración**: `baseUrl` desde `environment`
- **Tipado**: Todos los métodos devuelven `Observable<ApiResponse<T>>`

### Capa Transversal (Interceptores)
- **Auth Interceptor**: Adjunta JWT a todos los requests
- **Loading Interceptor**: Gestiona estado global de carga
- **Error Interceptor**: Captura errores HTTP y notifica

---

## 🔐 Seguridad

### Autenticación
- **Almacenamiento**: Token JWT en `localStorage`
- **Distribución**: Via `authInterceptor` en cada request (header `Authorization: Bearer <token>`)
- **Guardias de Ruta**:
  - `authGuard`: Protege rutas que requieren autenticación
  - `guestGuard`: Protege rutas públicas (redirige si ya está logueado)

### Manejo de Errores
- `errorInterceptor` captura errores HTTP
- `NotificationService` muestra alertas al usuario
- Estados de error manejados por `DomainService` (ej: `EncuestaService`)

---

## 📊 Gestión de Estado

### Patrones
- **Signals privados**: Estado interno mutado solo dentro del servicio
- **Signals readonly**: Expuestos al componente para lectura
- **Computed signals**: Estado derivado (ej: `isLoading$`, `hasErrors`)
- **Async pipe**: Vinculación reactiva en templates

### Ejemplo (EncuestaService)
```typescript
@Injectable({ providedIn: 'root' })
export class EncuestaService {
  private readonly _encuestas = signal<Encuesta[]>([]);
  readonly encuestas = this._encuestas.asReadonly();
  
  readonly isLoading = computed(() => this.loading.isLoading());
  
  loadEncuestas(): void {
    this.loading.show();
    this.api.get<Encuesta[]>('encuestas')
      .subscribe({
        next: (res) => {
          this._encuestas.set(res.data);
          this.notification.success('Encuestas cargadas');
          this.loading.hide();
        },
        error: (err) => {
          this.notification.error('Error al cargar encuestas');
          this.loading.hide();
        }
      });
  }
}
```

---

## 🛣️ Rutas Principales

### Rutas Públicas
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `LandingComponent` | Página de bienvenida |
| `/auth/login` | `LoginComponent` | Formulario de login |

### Rutas Protegidas (autenticadas)
| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/dashboard` | `DashboardComponent` | Panel principal |
| `/encuestas/*` | `EncuestasModule` | Gestión de encuestas |
| `/gestion` | `PlaceholderPageComponent` | Gestión de usuarios (TODO) |
| `/config` | `PlaceholderPageComponent` | Configuración del sistema (TODO) |
| `/reportes` | `PlaceholderPageComponent` | Reportes (TODO) |

---

## 🎨 Layout General

```
┌─────────────────────────────────────┐
│         HEADER (Navigation)         │
├─────┬───────────────────────────────┤
│     │                               │
│ SID │     MAIN CONTENT              │
│ BAR │     (Router Outlet)           │
│     │                               │
├─────┴───────────────────────────────┤
│         FOOTER (Info)               │
└─────────────────────────────────────┘
```

- **Header**: Logo, menú, usuario, logout
- **Sidebar**: Navegación a features principales
- **Main Content**: Router outlet (componentes dinámicos)
- **Footer**: Links, copyright, info

---

## 📦 Modelos de Datos

### ApiResponse<T> (Generic)
```typescript
interface ApiResponse<T> {
  success: boolean;      // ¿Operación exitosa?
  message: string;       // Mensaje del servidor
  data: T;              // Payload tipado
  timestamp: string;    // Timestamp de respuesta
}
```

### PageableResponse<T> (Para listados paginados)
```typescript
interface PageableResponse<T> {
  content: T[];         // Items del actual
  totalElements: number; // Total de items
  totalPages: number;   // Total de páginas
  size: number;         // Items por página
  number: number;       // Número página actual
  first: boolean;       // ¿Es la primera?
  last: boolean;        // ¿Es la última?
}
```

### Encuesta (Placeholder)
```typescript
interface Encuesta {
  id: number;
  titulo: string;
  descripcion: string;
  // ... más campos según backend
}
```

---

## 🔧 Configuración por Ambiente

### `environment.ts` (Producción)
```typescript
export const environment = {
  apiUrl: 'https://api.solve.com'
};
```

### `environment.development.ts` (Desarrollo)
```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 📋 Convenciones de Código

### Componentes
- ✅ Standalone (`standalone: true` es default en v21)
- ✅ `changeDetection: OnPush` (siempre)
- ✅ Inputs/Outputs con funciones `input()` y `output()`
- ✅ Templates inline para componentes pequeños
- ✅ Directivas host via `host` object (no `@HostBinding/@HostListener`)
- ✅ Estilos Tailwind (no CSS customizado)

### Servicios
- ✅ `providedIn: 'root'` para singletons
- ✅ `inject()` en lugar de constructor injection
- ✅ Signals para estado (nunca RxJS subjects directos)
- ✅ Métodos que devuelven `Observable<ApiResponse<T>>`

### Tipado TypeScript
- ✅ Strict mode habilitado
- ✅ Type inference para tipos obvios
- ✅ Evitar `any`; usar `unknown` si es necesario

### Accesibilidad
- ✅ Pasar todas las validaciones AXE
- ✅ Cumplir WCAG AA mínimo
- ✅ Focus management correcto
- ✅ Contraste de colores adecuado
- ✅ ARIA attributes cuando sea necesario

---

## 🚀 Flujo de Desarrollo

### Crear un nuevo componente
```bash
ng generate component features/nueva-feature/pages/nueva-page
```

### Crear un nuevo servicio de dominio
```bash
ng generate service core/services/nuevo-dominio
```

### Agregar una nueva ruta
1. Crear feature en `features/`
2. Definir `<feature>.routes.ts`
3. Importar en `app.routes.ts` con `loadChildren` o `loadComponent`

### Testing
```bash
npm run test
```

### Build
```bash
npm run build
```

---

## ⚠️ Pendientes y Próximos Pasos

### Corto Plazo
- [ ] Confirmar contrato exacto de `ApiResponse<T>` con backend
- [ ] Finalizar interfaz `Encuesta` con todos los campos reales
- [ ] Implementar formularios reactivos en `crear-encuesta` y `responder-encuesta`
- [ ] Componentes visuales para `shared/components/`

### Mediano Plazo
- [ ] Llenar implementaciones de páginas en `encuestas/` feature
- [ ] Implementar rutas protegidas (`/gestion`, `/config`, `/reportes`)
- [ ] Agregar validaciones de formularios
- [ ] Sistemas de filtrado y búsqueda en listados

### Largo Plazo
- [ ] Optimización de performance (virtual scrolling para listados grandes)
- [ ] Caché de datos con service workers
- [ ] Migración a zoneless change detection (v21+)
- [ ] Pruebas E2E completas

---

## 📞 Contacto y Documentación

- **Framework**: [Angular 21 Docs](https://angular.dev)
- **Tailwind CSS**: [Docs](https://tailwindcss.com)
- **TypeScript**: [Handbook](https://www.typescriptlang.org)
