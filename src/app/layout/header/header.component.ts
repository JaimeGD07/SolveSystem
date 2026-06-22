import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para almacenar la info
  userRoleText = signal<string>('Usuario');
  userEmail = signal<string>('correo@dominio.com');
  currentDate = signal<string>('');

  ngOnInit(): void {
    const savedRole = localStorage.getItem('userRole');
    const savedEmail = localStorage.getItem('userEmail');

    if (savedEmail) this.userEmail.set(savedEmail);

    if (savedRole === 'ADMIN') this.userRoleText.set('Administrador');
    else if (savedRole === 'ENCUESTADOR') this.userRoleText.set('Encuestador');
    else this.userRoleText.set('Encuestado');

    // Calculamos la fecha en el TS para mantener la plantilla HTML limpia de lógica
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    this.currentDate.set(`${dd}/${mm}/${yyyy}`);
  }

  onLogout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/login']);
  }

  onThemeToggle(): void {
    const classList = document.documentElement.classList;
    if (classList.contains('dark')) {
      classList.remove('dark');
      localStorage.setItem('solve_theme', 'light');
    } else {
      classList.add('dark');
      localStorage.setItem('solve_theme', 'dark');
    }
  }
}
