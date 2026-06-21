import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

const DEFAULT_DURATION_MS = 4000;

/**
 * Sistema centralizado de alertas/notificaciones de la aplicación.
 * Cualquier componente o interceptor puede inyectar este servicio
 * para disparar un toast/alerta. El componente visual que lea
 * `notifications()` y lo pinte (toast-container) será responsabilidad
 * de la capa de UI (Gemini), consumiendo este signal de solo lectura.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  success(message: string, duration = DEFAULT_DURATION_MS): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = DEFAULT_DURATION_MS): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration = DEFAULT_DURATION_MS): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = DEFAULT_DURATION_MS): void {
    this.show('info', message, duration);
  }

  dismiss(id: string): void {
    this._notifications.update((actuales) => actuales.filter((n) => n.id !== id));
  }

  clear(): void {
    this._notifications.set([]);
  }

  private show(type: NotificationType, message: string, duration: number): void {
    const id = crypto.randomUUID();
    const notification: AppNotification = { id, type, message, duration };

    this._notifications.update((actuales) => [...actuales, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
