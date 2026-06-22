import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MetricCardComponent } from '../../../../shared/components/metric-card/metric-card.component';

@Component({
  selector: 'app-reportes',
  imports: [SidebarComponent, HeaderComponent, MetricCardComponent],
  templateUrl: './reportes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesComponent implements AfterViewInit {
  @ViewChild('usuariosChart') usuariosChartRef!: ElementRef;
  @ViewChild('actividadChart') actividadChartRef!: ElementRef;

  ngAfterViewInit(): void {
    this.renderUsuariosChart();
    this.renderActividadChart();
  }

  renderUsuariosChart(): void {
    new Chart(this.usuariosChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Administradores', 'Encuestadores', 'Encuestados'],
        datasets: [{
          data: [5, 45, 250], // Datos simulados globales
          backgroundColor: ['#2A2597', '#0188FF', '#C0FDFF'], // Paleta Solve
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '70%' // Hace que la dona sea más delgada y elegante
      }
    });
  }

  renderActividadChart(): void {
    new Chart(this.actividadChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Nuevas Encuestas Creadas',
          data: [12, 19, 15, 25, 32, 40],
          backgroundColor: '#0188FF',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}
