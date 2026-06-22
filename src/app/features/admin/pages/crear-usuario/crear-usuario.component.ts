import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

@Component({
  selector: 'app-crear-usuario',
  imports: [SidebarComponent, HeaderComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-usuario.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearUsuarioComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Formulario Reactivo con las validaciones estrictas del diseño
  usuarioForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+/) // Exige 1 mayúscula y 1 carácter especial
    ]],
    rol: ['Encuestador', Validators.required]
  });

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.usuarioForm.value;

    // Separar el "Nombre Completo" para calzar con el DTO del backend (primNom, primApell)
    const partesNombre = (formValue.nombreCompleto || '').trim().split(' ');
    const primNom = partesNombre[0];
    const primApell = partesNombre.slice(1).join(' ') || ''; // Si solo pone un nombre, el apellido queda vacío

    const payload = {
      email: formValue.email,
      primNom: primNom,
      primApell: primApell,
      passHash: formValue.password,
      rol: formValue.rol
    };

    console.log('Payload listo para enviar a Spring Boot:', payload);

    // Aquí irá la llamada al servicio: this.usuarioService.crearUsuario(payload).subscribe(...)

    // Tras el éxito, regresamos a la tabla
    this.router.navigate(['/gestion']);
  }
}
