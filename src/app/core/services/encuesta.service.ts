import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, tap, Observable } from 'rxjs';

import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { CrearEncuestaRequest, CrearEncuestaCompletaRequest, Encuesta, ResponderEncuestaRequest } from '../models/encuesta.model';

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
  readonly encuestasActivas = computed(() => this._encuestas());

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

  crearEncuestaCompleta(formVal: any): Observable<any> {
    this._loading.set(true);
    
    const payload: CrearEncuestaCompletaRequest = {
      titulo: formVal.titulo || '',
      descripcion: formVal.descripcion || '',
      preguntas: (formVal.preguntas || []).map((p: any) => {
        const tipo = +p.codTipoPre;
        const obligatoriaVal = p.obligatoria ? 1 : 0;
        
        const opcs = (p.opciones || []).map((o: any, idx: number) => ({
          opcion: o.opcion,
          orden: o.orden || (idx + 1),
          valor: o.valor || (idx + 1)
        }));
        
        const preguntaReq: any = {
          codTipoPre: tipo,
          codCat: p.codCat || 1,
          enunciado: p.enunciado,
          obligatoria: obligatoriaVal,
          opciones: opcs
        };

        if (tipo === 6 || tipo === 7) {
          preguntaReq.opciones = [{
            opcion: 'Escala',
            valorMin: p.valorMin || 1,
            valorMax: p.valorMax || 5,
            orden: 1
          }];
        }

        return preguntaReq;
      })
    };

    return this.api.post<Encuesta>(`${ENDPOINT}/completa`, payload).pipe(
      tap((response) => {
        this._encuestas.update((actuales) => [...actuales, response.data]);
        this.notification.success('Encuesta completa creada correctamente.');
      }),
      catchError((err) => {
        this.notification.error('Error al crear la encuesta completa.');
        throw err;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  obtenerEncuestaConDetalles(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.get<any>(`${ENDPOINT}/${id}`).pipe(
      catchError((err) => {
        this.notification.error('No se pudo cargar el detalle de la encuesta.');
        throw err;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  enviarRespuestas(payload: ResponderEncuestaRequest): Observable<any> {
    this._loading.set(true);
    return this.api.post<any>(`respuestas`, payload).pipe(
      tap(() => {
        this.notification.success('¡Respuestas enviadas con éxito!');
      }),
      catchError((err) => {
        this.notification.error('Error al enviar las respuestas.');
        throw err;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  obtenerAnaliticas(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.get<any>(`${ENDPOINT}/${id}/resultados`).pipe(
      catchError((err) => {
        this.notification.error('No se pudieron cargar los resultados de la encuesta.');
        throw err;
      }),
      finalize(() => this._loading.set(false))
    );
  }
}
