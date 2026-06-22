import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { TipoPregunta, AnaliticaEncuestaResponse } from '../../../../core/models/encuesta.model';

Chart.register(...registerables);

@Component({
  selector: 'app-resultados-encuesta',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './resultados-encuesta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultadosEncuestaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private encuestaService = inject(EncuestaService);

  readonly TipoPregunta = TipoPregunta;

  analitica = signal<AnaliticaEncuestaResponse | null>(null);
  private charts: Chart[] = [];
  private themeObserver: MutationObserver | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarResultados(id);
    }
    this.setupThemeObserver();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  cargarResultados(id: number): void {
    this.encuestaService.obtenerAnaliticas(id).subscribe({
      next: (response) => {
        const data = response.data || response;
        this.analitica.set(data);
        this.inicializarGraficosConRetraso();
      },
      error: () => {
        this.cargarMockResultados(id);
      }
    });
  }

  cargarMockResultados(id: number): void {
    const mock: AnaliticaEncuestaResponse = {
      codEnc: id,
      titulo: 'Encuesta de Satisfacción General (Solve)',
      descripcion: 'Visualización de las métricas recopiladas durante las pruebas de simulación en vivo.',
      totalParticipantes: 3,
      metricasPreguntas: [
        {
          codPre: 101,
          enunciado: '¿Qué opinión tienes sobre el desempeño del sistema Solve?',
          codTipoPre: TipoPregunta.ABIERTA,
          totalRespuestas: 3,
          respuestasAbiertas: [
            'Excelente diseño y muy rápida.',
            'Me encantan las animaciones en los botones.',
            'Fácil de usar, muy intuitiva.'
          ]
        },
        {
          codPre: 102,
          enunciado: '¿Consideras que la reactividad con Angular Signals mejora la velocidad percibida?',
          codTipoPre: TipoPregunta.DICOTOMICA,
          totalRespuestas: 3,
          frecuencias: [
            { opcion: 'Verdadero', frecuencia: 3, porcentaje: 100 },
            { opcion: 'Falso', frecuencia: 0, porcentaje: 0 }
          ]
        },
        {
          codPre: 103,
          enunciado: '¿Cuál de los siguientes módulos te parece el más importante para la demo?',
          codTipoPre: TipoPregunta.POLITOMICA,
          totalRespuestas: 3,
          frecuencias: [
            { opcion: 'Módulo de Creación Dinámica', frecuencia: 1, porcentaje: 33.3 },
            { opcion: 'Motor de Llenado con Limpieza de Estado', frecuencia: 1, porcentaje: 33.3 },
            { opcion: 'Gráficos de Resultados en Tiempo Real', frecuencia: 1, porcentaje: 33.3 }
          ]
        },
        {
          codPre: 104,
          enunciado: 'Selecciona todas las herramientas aplicadas en el frontend (Múltiple):',
          codTipoPre: TipoPregunta.ELECCION_MULTIPLE,
          totalRespuestas: 3,
          frecuencias: [
            { opcion: 'Angular 21 (Standalone components)', frecuencia: 3, porcentaje: 100 },
            { opcion: 'Tailwind CSS v4', frecuencia: 2, porcentaje: 66.7 },
            { opcion: 'Chart.js Canvas', frecuencia: 2, porcentaje: 66.7 },
            { opcion: 'Angular Signals', frecuencia: 3, porcentaje: 100 }
          ]
        },
        {
          codPre: 105,
          enunciado: 'Califica la estética visual general (Escala Likert 1-5):',
          codTipoPre: TipoPregunta.ESCALA_LIKERT,
          totalRespuestas: 3,
          promedio: 4.67,
          frecuencias: [
            { opcion: '1', frecuencia: 0, porcentaje: 0 },
            { opcion: '2', frecuencia: 0, porcentaje: 0 },
            { opcion: '3', frecuencia: 0, porcentaje: 0 },
            { opcion: '4', frecuencia: 1, porcentaje: 33.3 },
            { opcion: '5', frecuencia: 2, porcentaje: 66.7 }
          ]
        },
        {
          codPre: 106,
          enunciado: 'Califica la compatibilidad percibida (Escala Numérica 1-10):',
          codTipoPre: TipoPregunta.ESCALA_NUMERICA,
          totalRespuestas: 3,
          promedio: 9.33,
          frecuencias: [
            { opcion: '1', frecuencia: 0, porcentaje: 0 },
            { opcion: '2', frecuencia: 0, porcentaje: 0 },
            { opcion: '3', frecuencia: 0, porcentaje: 0 },
            { opcion: '4', frecuencia: 0, porcentaje: 0 },
            { opcion: '5', frecuencia: 0, porcentaje: 0 },
            { opcion: '6', frecuencia: 0, porcentaje: 0 },
            { opcion: '7', frecuencia: 0, porcentaje: 0 },
            { opcion: '8', frecuencia: 1, porcentaje: 33.3 },
            { opcion: '9', frecuencia: 0, porcentaje: 0 },
            { opcion: '10', frecuencia: 2, porcentaje: 66.7 }
          ]
        }
      ]
    };
    this.analitica.set(mock);
    this.inicializarGraficosConRetraso();
  }

  inicializarGraficosConRetraso(): void {
    setTimeout(() => {
      this.crearGraficos();
    }, 100);
  }

  crearGraficos(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const data = this.analitica();
    if (!data) return;

    const isDark = document.documentElement.classList.contains('dark');
    const labelColor = isDark ? '#9ca3af' : '#6b7280';
    const gridColor = isDark ? '#374151' : '#f3f4f6';

    data.metricasPreguntas.forEach((pregunta) => {
      if (pregunta.codTipoPre === TipoPregunta.ABIERTA) return;

      const canvasId = `chart-${pregunta.codPre}`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        console.warn(`Canvas con ID ${canvasId} no encontrado.`);
        return;
      }

      const frecuencias = pregunta.frecuencias || [];
      const labels = frecuencias.map(f => f.opcion);
      const values = frecuencias.map(f => f.frecuencia);

      let chartType: 'pie' | 'bar' | 'doughnut' = 'bar';
      let backgroundColors: string[] = [];

      if (pregunta.codTipoPre === TipoPregunta.DICOTOMICA) {
        chartType = 'pie';
        backgroundColors = ['#0891b2', '#f43f5e']; 
      } else if (pregunta.codTipoPre === TipoPregunta.POLITOMICA || pregunta.codTipoPre === TipoPregunta.ELECCION_MULTIPLE) {
        chartType = 'doughnut';
        backgroundColors = ['#0891b2', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];
      } else {
        chartType = 'bar';
        backgroundColors = Array(labels.length).fill('#0891b2');
      }

      const chart = new Chart(canvas, {
        type: chartType,
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderColor: isDark ? '#1f2937' : '#ffffff',
            borderWidth: chartType === 'bar' ? 0 : 2,
            borderRadius: chartType === 'bar' ? 6 : 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: chartType !== 'bar',
              position: 'bottom',
              labels: {
                boxWidth: 12,
                color: labelColor,
                font: {
                  size: 11,
                  weight: 'bold'
                }
              }
            }
          },
          scales: chartType === 'bar' ? {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: labelColor,
                font: {
                  size: 10
                }
              },
              grid: {
                color: gridColor
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: labelColor,
                font: {
                  size: 10,
                  weight: 'bold'
                }
              }
            }
          } : undefined
        }
      });

      this.charts.push(chart);
    });
  }

  setupThemeObserver(): void {
    if (typeof window !== 'undefined' && 'MutationObserver' in window) {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            this.crearGraficos();
          }
        });
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }
}
