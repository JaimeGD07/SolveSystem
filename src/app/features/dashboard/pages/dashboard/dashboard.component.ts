import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
// Importamos nuestras tarjetas reciclables
import { ActionCardComponent } from '../../../../shared/components/action-card/action-card.component';
import { MetricCardComponent } from '../../../../shared/components/metric-card/metric-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, HeaderComponent, FooterComponent, ActionCardComponent, MetricCardComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  userRole = signal<string>('ENCUESTADO');

  ngOnInit(): void {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      this.userRole.set(savedRole);
    }
  }
}
