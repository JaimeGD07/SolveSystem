import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  userRole = signal<string>('ENCUESTADO');

  // Nuevo Signal para controlar el estado del menú
  isCollapsed = signal<boolean>(false);

  ngOnInit(): void {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      this.userRole.set(savedRole);
    }
  }

  // Función que se dispara al hacer clic en la hamburguesa
  toggleSidebar(): void {
    this.isCollapsed.update(val => !val);
  }
}
