import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  // Inyección estricta con inject(), sin constructor
  private authService = inject(AuthService);

  // Aquí implementaremos los Signals para el formulario reactivo de login
}
