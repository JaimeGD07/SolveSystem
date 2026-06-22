import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RespuestaEncuestaService {

  private apiUrl = `${environment.apiUrl}/respuestas-encuesta`;

  constructor(private http: HttpClient) {}

  responderEncuesta(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/responder`, data);
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  listarPorEncuesta(encuestaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/encuesta/${encuestaId}`);
  }

  listarPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
}