import { Injectable, computed, signal } from '@angular/core';

/**
 * Lleva la cuenta de peticiones HTTP activas para mostrar
 * un loader global. Se alimenta desde loading.interceptor.ts.
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _activeRequests = signal<number>(0);
  readonly isLoading = computed(() => this._activeRequests() > 0);

  increment(): void {
    this._activeRequests.update((n) => n + 1);
  }

  decrement(): void {
    this._activeRequests.update((n) => Math.max(0, n - 1));
  }
}
