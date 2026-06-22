import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core'; //se agrega inject para el archivo csv
import { AuditoriaService } from '../../../../core/services/auditoria.service';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { AuditoriaLog } from '../../../../core/models/auditoria.model';

@Component({
  selector: 'app-auditoria',
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './auditoria.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditoriaComponent {
  private auditoriaService = inject(AuditoriaService); // inyecta el servicio al inicio de la clase
  // Generamos 23 logs simulados para probar las 3 páginas
  logs = signal<AuditoriaLog[]>(Array.from({ length: 23 }, (_, i) => ({
    id: 1000 + i,
    fechaHora: `2026-06-${21 - (i % 5)} 1${4 - (i % 3)}:${10 + i}:00`,
    usuario: i % 4 === 0 ? 'admin@dominio.com' : 'encuestador@dominio.com',
    accion: i % 3 === 0 ? 'LOGIN_EXITOSO' : (i % 2 === 0 ? 'CREAR_ENCUESTA' : 'ACTUALIZAR_PERFIL'),
    detalles: i % 3 === 0 ? 'Inicio de sesión en el sistema' : 'Acción realizada correctamente',
    ip: `192.168.1.${10 + i}`
  })));

  // ESTADO DE PAGINACIÓN
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // SIGNALS COMPUTADOS PARA LA LÓGICA DE TABLA
  totalPages = computed(() => Math.ceil(this.logs().length / this.itemsPerPage()));

  // Cortamos el arreglo exacto para la página actual
  paginatedLogs = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.logs().slice(startIndex, startIndex + this.itemsPerPage());
  });

  // Cálculos para mostrar "Mostrando X a Y de Z"
  startIndexDisplay = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  endIndexDisplay = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.logs().length));

  // MÉTODOS DE CONTROL
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
  // función para exportar
  descargarCSV(): void {
    this.auditoriaService.exportarCsvAuditoria().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        // Nombre del archivo con la fecha actual
        enlace.download = `Auditoria_Solve_${new Date().toISOString().split('T')[0]}.csv`;
        enlace.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el CSV de auditoría:', err);
        // Aquí podrías mostrar un Toast o alerta de error en el futuro
      }
    });
  }
}
