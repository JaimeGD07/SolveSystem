import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RespuestaEncuestaService {

  private apiUrl = `${environment.apiUrl}/respuestas-encuesta`;

  constructor(private http: HttpClient) {}

  responderEncuesta(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/responder`, data);
  }
}