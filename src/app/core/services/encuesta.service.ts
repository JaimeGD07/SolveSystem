import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';

import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { CrearEncuestaRequest, Encuesta } from '../models/encuesta.model';

const ENDPOINT = 'encuestas';

/**
 * Servicio de ejemplo (DataService) que demuestra el patrón a seguir
 * para cualquier servicio de dominio: compone ApiService, mantiene su
 * propio estado con Signals (privado + readonly expuesto) y expone
 * computed() para estado derivado.
 */
@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  private readonly api = inject(ApiService);
  private readonly notification = inject(NotificationService);

  // Estado privado, solo mutable desde este servicio
  private readonly _encuestas = signal<Encuesta[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _selectedEncuesta = signal<Encuesta | null>(null);

  // Estado expuesto como solo lectura al resto de la app
  readonly encuestas = this._encuestas.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedEncuesta = this._selectedEncuesta.asReadonly();

  // Estado derivado
  readonly totalEncuestas = computed(() => this._encuestas().length);
  readonly encuestasActivas = computed(() => this._encuestas().filter((e) => e.activa));

  cargarEncuestas(): void {
    this._loading.set(true);

    this.api
      .get<Encuesta[]>(ENDPOINT)
      .pipe(
        tap((response) => this._encuestas.set(response.data)),
        catchError(() => {
          this.notification.error('No se pudieron cargar las encuestas.');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  crearEncuesta(payload: CrearEncuestaRequest): void {
    this._loading.set(true);

    this.api
      .post<Encuesta>(ENDPOINT, payload)
      .pipe(
        tap((response) => {
          this._encuestas.update((actuales) => [...actuales, response.data]);
          this.notification.success('Encuesta creada correctamente.');
        }),
        catchError(() => {
          this.notification.error('Error al crear la encuesta.');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  seleccionarEncuesta(encuesta: Encuesta | null): void {
    this._selectedEncuesta.set(encuesta);
  }
}
