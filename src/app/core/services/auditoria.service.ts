import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private http = inject(HttpClient);
  // Reemplaza esta URL con la ruta real que te de tu compañero de backend
  private apiUrl = 'http://localhost:8080/api/auditoria';

  exportarCsvAuditoria(): Observable<Blob> {
    // Es crucial el responseType 'blob' para que Angular sepa que viene un archivo
    return this.http.get(`${this.apiUrl}/exportar`, { responseType: 'blob' });
  }
}
