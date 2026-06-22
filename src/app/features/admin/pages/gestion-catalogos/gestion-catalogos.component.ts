import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { CategoriaCatalogo } from '../../../../core/models/catalogo.model';

@Component({
  selector: 'app-gestion-catalogos',
  imports: [SidebarComponent, HeaderComponent, RouterLink],
  templateUrl: './gestion-catalogos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionCatalogosComponent {
  // Datos simulados basados en tu Figma
  categorias = signal<CategoriaCatalogo[]>([
    {
      codCat: 1,
      nombre: 'Satisfacción',
      descripcion: 'Preguntas sobre nivel de satisfacción',
      icono: '😊'
    },
    {
      codCat: 2,
      nombre: 'Demográfico',
      descripcion: 'Preguntas demográficas',
      icono: '👥'
    }
  ]);

  eliminarCategoria(id: number): void {
    console.log('Eliminando categoría con ID:', id);
    // Lógica para consumir DELETE /api/catalogos/{id}
  }
}
