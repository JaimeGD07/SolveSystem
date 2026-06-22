import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PreguntaService {

  private apiUrl = `${environment.apiUrl}/preguntas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  listarPorEncuesta(encuestaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/encuesta/${encuestaId}`);
  }
  listarPorPregunta(codPre: number) {
  return this.http.get<any[]>(`${this.apiUrl}/pregunta/${codPre}`);
}

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  crearMultiple(data: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/multiples`, data);
  }

  actualizar(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}