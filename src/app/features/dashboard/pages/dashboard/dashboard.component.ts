import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

@Component({
  selector: 'app-dashboard',
  // Importamos los componentes del Layout para que Angular reconozca las etiquetas
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
