import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

// Inyectamos el cascarón del sistema
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

// Interfaz local para el tipado de roles
interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
}

@Component({
  selector: 'app-gestion-roles',
  imports: [SidebarComponent, HeaderComponent], //routerlink quitado del import
  templateUrl: './gestion-roles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionRolesComponent {
  // Datos simulados basados en tu diseño de Figma
  roles = signal<Rol[]>([
    { id: 1, nombre: 'Administrator', descripcion: 'Full system access', tipo: 'Sistema' },
    { id: 2, nombre: 'Surveyor', descripcion: 'Survey creation and management', tipo: 'Sistema' },
    { id: 3, nombre: 'Surveyed', descripcion: 'Survey response submission', tipo: 'Sistema' }
  ]);

  eliminarRol(id: number): void {
    console.log('Intentando eliminar rol:', id);
    // Nota: El backend probablemente rechace eliminar roles de tipo "Sistema"
  }
}
