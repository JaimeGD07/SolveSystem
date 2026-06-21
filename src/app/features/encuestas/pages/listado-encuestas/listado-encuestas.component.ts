import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
// Importación del servicio base que Claude ya construyó
// import { EncuestaService } from '../../../../core/services/encuesta.service';

@Component({
  selector: 'app-listado-encuestas',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800">Listado de Encuestas</h1>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListadoEncuestasComponent {
  // private encuestaService = inject(EncuestaService);

  // Aquí consumiremos: this.encuestaService.encuestas()
}
