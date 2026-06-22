import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink], // Esto le enseña a Angular a leer [formGroup] y routerLink
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Señales para manejar el estado de la vista
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Definición del formulario reactivo y sus validaciones
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Función que se ejecuta al darle clic a "Iniciar Sesión"
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.getRawValue();

    // Simulador de red (1.5 segundos)
    setTimeout(() => {
      // 1. Lógica para simular el rol según el correo ingresado
      let mockRole = 'ENCUESTADO'; // Rol por defecto
      let mockName = 'Usuario Encuestado';

      if (credentials.email.includes('admin')) {
        mockRole = 'ADMIN';
        mockName = 'Administrador';
      } else if (credentials.email.includes('encuestador')) {
        mockRole = 'ENCUESTADOR';
        mockName = 'Equipo Encuestador';
      }

      // 2. Guardamos el rol y nombre temporalmente en el navegador para que el Layout los lea
      localStorage.setItem('userRole', mockRole);
      localStorage.setItem('userName', mockName);
      localStorage.setItem('userEmail', credentials.email);

      // 3. Generamos un token falso y usamos estrictamente el método del AuthService
      const mockJwtToken = `fake-jwt-token-for-${mockRole}`;

      try {
        // Envolvemos en try-catch por si el AuthService tiene validaciones internas que lancen error
        this.authService.login(mockJwtToken);

        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      } catch (error) {
        this.isLoading.set(false);
        this.errorMessage.set('Error interno en AuthService. Revisa la consola.');
        console.error(error);
      }

    }, 1500);
  }
}
