import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
// Importación del servicio base que Claude ya construyó
// import { EncuestaService } from '../../../../core/services/encuesta.service';

@Component({
  selector: 'app-detalle-encuesta',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800">Detalle de Encuesta</h1>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalleEncuestaComponent {
  // private encuestaService = inject(EncuestaService);

  // Aquí consumiremos: this.encuestaService.encuestas()
}
