import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  private apiUrl = `${environment.apiUrl}/encuestas`;

  // Signals para estado reactivo
  loading = signal<boolean>(false);
  encuestas = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.cargarEncuestas();
  }

  public cargarEncuestas(): void {
    this.loading.set(true);
    this.listar().subscribe({
      next: (encuestas) => {
        this.encuestas.set(encuestas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data).pipe(
      tap(() => this.cargarEncuestas())
    );
  }

  crearEncuestaCompleta(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/completa`, data).pipe(
      tap(() => this.cargarEncuestas())
    );
  }

  actualizar(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.cargarEncuestas())
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarEncuestas())
    );
  }

  obtenerAnaliticas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/analiticas`);
  }

  obtenerEncuestaConDetalles(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detalles`);
  }

  enviarRespuestas(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/responder`, payload);
  }
}