import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common'; // <-- Importación obligatoria

@Component({
  selector: 'app-landing',
  imports: [RouterLink, NgOptimizedImage], // Necesario para el routerLink en el botón "Ingresar"
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  // Componente puramente visual, el estado es manejado por el OnPush
}
