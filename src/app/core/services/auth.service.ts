import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  registro(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro`, data);
  }

  cambiarPassword(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cambiar-password`, data);
  }

  recuperarPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recuperar-password`, data);
  }

  restablecerPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/restablecer-password`, data);
  }

  desbloquear(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/desbloquear`, data);
  }

  guardarSesion(res: any): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('tokenType', res.tipoToken ?? 'Bearer');
    localStorage.setItem('userId', String(res.codUsu));
    localStorage.setItem('userName', res.nombreCompleto);
    localStorage.setItem('userEmail', res.email);
    localStorage.setItem('userStatus', res.estado);

    if (res.roles && res.roles.length > 0) {
      localStorage.setItem('userRole', res.roles[0]);
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.obtenerToken();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userStatus');
    localStorage.removeItem('userRole');
  }
}