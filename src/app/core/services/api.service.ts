import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/**
 * Servicio base para consumir endpoints REST del backend Spring Boot.
 * Los servicios de dominio (EncuestaService, UsuarioService, etc.) deben
 * componer este servicio en lugar de llamar a HttpClient directamente,
 * para mantener un único punto de configuración (baseUrl, params, etc.).
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, string | number>): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
      params: this.buildParams(params),
    });
  }

  getById<T>(endpoint: string, id: number | string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, id: number | string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`, body);
  }

  patch<T>(endpoint: string, id: number | string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`, body);
  }

  delete<T>(endpoint: string, id: number | string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  private buildParams(params?: Record<string, string | number>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      httpParams = httpParams.set(key, value);
    }
    return httpParams;
  }
}
