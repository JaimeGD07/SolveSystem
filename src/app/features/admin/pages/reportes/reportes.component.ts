import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  // 1. Creamos un Signal para saber si se está generando el PDF
  isExporting = signal<boolean>(false);

  async exportarPDF(): Promise<void> {
  if (this.isExporting()) return;

  this.isExporting.set(true);

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // =====================================
    // TÍTULO
    // =====================================

    pdf.setFontSize(22);
    pdf.text('Reporte General - Solve', 15, 20);

    pdf.setFontSize(10);
    pdf.text(
      `Generado: ${new Date().toLocaleDateString()}`,
      15,
      28
    );

    // =====================================
    // MÉTRICAS
    // =====================================

    pdf.setFontSize(14);
    pdf.text('Resumen General', 15, 45);

    pdf.setFontSize(11);

    pdf.text('Total Usuarios: 300', 20, 55); //cambiar al conectar backend
    pdf.text('Encuestas Activas: 143', 20, 63);
    pdf.text('Respuestas Globales: 12.5K', 20, 71);
    pdf.text('Tasa de Crecimiento: 8.4%', 20, 79);

    // =====================================
    // GRÁFICOS
    // =====================================

    const usuariosChart = Chart.getChart(
      this.usuariosChartRef.nativeElement
    );

    const actividadChart = Chart.getChart(
      this.actividadChartRef.nativeElement
    );

    if (usuariosChart) {
      pdf.setFontSize(13);
      pdf.text('Distribución de Usuarios', 15, 100);

      pdf.addImage(
        usuariosChart.toBase64Image(),
        'PNG',
        15,
        105,
        70,
        70
      );
    }

    if (actividadChart) {
      pdf.setFontSize(13);
      pdf.text('Actividad de Creación', 100, 100);

      pdf.addImage(
        actividadChart.toBase64Image(),
        'PNG',
        95,
        105,
        95,
        70
      );
    }
    autoTable(pdf, {
      startY: 190,
      head: [['Indicador', 'Valor']],
      body: [
        ['Usuarios', '300'],
        ['Encuestas Activas', '143'],
        ['Respuestas', '12.5K'],
        ['Crecimiento', '8.4%']
      ]
    });

    // =====================================
    // PIE DE PÁGINA
    // =====================================

    pdf.setFontSize(9);

    pdf.text(
      'Sistema de Encuestas Solve',
      15,
      285
    );

    pdf.save(
      `Reporte_Solve_${new Date()
        .toISOString()
        .split('T')[0]}.pdf`
    );

  } catch (error) {
    console.error(
      'Error al generar PDF:',
      error
    );
  } finally {
    this.isExporting.set(false);
  }
}
}

