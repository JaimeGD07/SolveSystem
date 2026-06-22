import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common'; // 1. Agregamos esta importación

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [SidebarComponent, HeaderComponent, FormsModule, RouterLink, LowerCasePipe],
  templateUrl: './gestion-usuarios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuariosComponent {
  // Datos simulados iniciales (Se reemplazarán por GET /api/usuarios)
  usuarios = signal<Usuario[]>([
    { codUsu: 1, primNom: 'admin', primApell: '', email: 'corr@dominio.com', rol: 'administrador', estado: 'ACTIVO', ultimoAcceso: 'nunca', intentos: 0 },
    { codUsu: 2, primNom: 'encuestador', primApell: '', email: 'corr@dominio.com', rol: 'encuestador', estado: 'ACTIVO', ultimoAcceso: 'nunca', intentos: 0 },
    { codUsu: 3, primNom: 'encuestado', primApell: '', email: 'corr@dominio.com', rol: 'encuestado', estado: 'ACTIVO', ultimoAcceso: 'nunca', intentos: 0 }
  ]);

  // Estado de los filtros
  searchTerm = signal<string>('');
  rolFilter = signal<string>('Todos los roles');
  estadoFilter = signal<string>('Todos los estados');

  // Señal computada: Filtra la tabla automáticamente cuando cambia un filtro
  usuariosFiltrados = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const rol = this.rolFilter();
    const estado = this.estadoFilter();

    return this.usuarios().filter(u => {
      const nombreCompleto = `${u.primNom} ${u.primApell}`.toLowerCase();

      const matchSearch = nombreCompleto.includes(term) || u.email.toLowerCase().includes(term);
      const matchRol = rol === 'Todos los roles' || u.rol.toLowerCase() === rol.toLowerCase();
      const matchEstado = estado === 'Todos los estados' || u.estado.toLowerCase() === estado.toLowerCase();

      return matchSearch && matchRol && matchEstado;
    });
  });

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.rolFilter.set('Todos los roles');
    this.estadoFilter.set('Todos los estados');
  }

  eliminarUsuario(id: number): void {
    // Aquí implementaremos el DELETE /api/usuarios/{id}
    console.log('Eliminar usuario:', id);
  }
}
