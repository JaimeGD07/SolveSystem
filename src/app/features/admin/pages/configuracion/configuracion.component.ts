import { Component, ChangeDetectionStrategy } from '@angular/core';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
// Importamos nuestra tarjeta reutilizable
import { ActionCardComponent } from '../../../../shared/components/action-card/action-card.component';

@Component({
  selector: 'app-configuracion',
  // La agregamos a los imports
  imports: [SidebarComponent, HeaderComponent, ActionCardComponent],
  templateUrl: './configuracion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfiguracionComponent {}
