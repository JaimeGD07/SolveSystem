import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { TipoPregunta } from '../../../../core/models/encuesta.model';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { Pregunta } from '../../../../core/models/encuesta.model';

Chart.register(...registerables);

interface SurveyOption {
  id: number;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-analisis-estadistico',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-solve-darker dark:text-gray-100 transition-colors duration-300">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          <div class="max-w-6xl mx-auto w-full">
            
            <!-- Cabecera -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <a routerLink="/dashboard" class="inline-flex items-center gap-2 text-solve-text-muted hover:text-solve-primary dark:text-solve-text-light dark:hover:text-solve-primary font-bold text-sm mb-4 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Volver al Dashboard
                </a>
                <h1 class="text-3xl font-extrabold text-solve-primary">Análisis Estadístico</h1>
                <p class="text-solve-text-light dark:text-gray-400 text-sm mt-1 font-medium">Visualiza los reportes métricos y gráficos consolidados por encuesta</p>
              </div>

              <!-- Selector de Encuesta Activa -->
              <div class="w-full sm:max-w-xs">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Encuesta a Analizar</label>
                <select (change)="onSurveyChange($event)"
                        class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-solve-primary bg-white dark:bg-gray-900 text-gray-950 dark:text-white font-bold shadow-sm cursor-pointer">
                  @for (enc of encuestas(); track enc.id) {
                    <option [value]="enc.id" [selected]="selectedSurveyId() === enc.id">{{ enc.titulo }}</option>
                  }
                </select>
              </div>
            </div>

            @if (activeSurvey()) {
              <!-- Contenedor del Reporte -->
              <div class="space-y-8">
                
                <!-- KPIs Consolidados -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl flex items-center justify-center text-solve-primary text-xl font-bold">
                      👥
                    </div>
                    <div>
                      <p class="text-xs font-bold text-solve-text-muted dark:text-gray-400 uppercase tracking-wider">Participantes Totales</p>
                      <p class="text-2xl font-black text-solve-primary mt-1">{{ totalParticipantes() }}</p>
                    </div>
                  </div>

                  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-450 text-xl font-bold">
                      📊
                    </div>
                    <div>
                      <p class="text-xs font-bold text-solve-text-muted dark:text-gray-400 uppercase tracking-wider">Tasa de Completitud</p>
                      <p class="text-2xl font-black text-green-600 dark:text-green-405 mt-1">{{ completitud() }}%</p>
                    </div>
                  </div>

                  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-405 text-xl font-bold">
                      ⏱️
                    </div>
                    <div>
                      <p class="text-xs font-bold text-solve-text-muted dark:text-gray-400 uppercase tracking-wider">Tiempo Promedio</p>
                      <p class="text-2xl font-black text-indigo-600 dark:text-indigo-405 mt-1">{{ tiempoPromedio() }} min</p>
                    </div>
                  </div>
                </div>

                <!-- Gráficos por Pregunta -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  @for (q of preguntasReporte(); track q.codPre) {
                    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                      
                      <!-- Detalle pregunta -->
                      <div class="mb-4">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-[10px] font-black text-solve-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded uppercase">
                            Pregunta {{ q.codPre }}
                          </span>
                          <span class="text-[9px] font-bold text-solve-text-muted dark:text-gray-400">
                            {{ q.codTipoPre === TipoPregunta.ABIERTA ? 'Texto Abierto' : q.codTipoPre === TipoPregunta.ESCALA_LIKERT || q.codTipoPre === TipoPregunta.ESCALA_NUMERICA ? 'Escala Numérica' : 'Opciones' }}
                          </span>
                        </div>
                        <h3 class="text-xs font-bold text-gray-850 dark:text-gray-200 leading-snug">
                          {{ q.enunciado }}
                        </h3>
                      </div>

                      <!-- Visualización del Gráfico o Respuestas Abiertas -->
                      <div class="flex-1 flex flex-col justify-center min-h-[200px]">
                        @if (q.codTipoPre === TipoPregunta.ABIERTA) {
                          
                          <!-- Comentarios -->
                          <div class="space-y-2 overflow-y-auto max-h-[180px] text-left pr-1">
                            @for (cmt of q.respuestasAbiertas; track cmt; let cIdx = $index) {
                              <div class="text-[10px] italic border-l-2 border-solve-primary dark:border-solve-secondary pl-2 py-1 text-gray-700 dark:text-gray-300">
                                "{{ cmt }}"
                              </div>
                            }
                            @if (!q.respuestasAbiertas || q.respuestasAbiertas.length === 0) {
                              <p class="text-[10px] text-solve-text-light text-center italic">No hay comentarios cargados.</p>
                            }
                          </div>

                        } @else {
                          
                          <!-- Canvas para los gráficos -->
                          <div class="relative h-44 w-full">
                            <canvas [id]="'chart-q-' + q.codPre"></canvas>
                          </div>
                          @if (q.promedio) {
                            <div class="text-center mt-2 text-[10px] font-black text-solve-primary">
                              Valor Promedio: {{ q.promedio | number:'1.1-2' }}
                            </div>
                          }

                        }
                      </div>

                    </div>
                  }
                </div>

              </div>
            } @else {
              <!-- Empty State -->
              <div class="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
                <div class="text-5xl mb-4">📊</div>
                <h3 class="text-lg font-bold text-solve-primary mb-1">No hay encuestas disponibles</h3>
                <p class="text-solve-text-light dark:text-gray-400 text-sm max-w-md mx-auto">
                  No se han registrado encuestas ni respuestas en el sistema para analizar.
                </p>
              </div>
            }

          </div>
        </main>

        <app-footer></app-footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalisisEstadisticoComponent implements OnInit, OnDestroy {
  private encuestaService = inject(EncuestaService);
  readonly TipoPregunta = TipoPregunta;

  // Signal del estado
  encuestas = signal<SurveyOption[]>([]);
  selectedSurveyId = signal<number>(101);
  activeSurvey = signal<SurveyOption | null>(null);

  // KPIs calculados
  totalParticipantes = signal<number>(15);
  completitud = signal<number>(100);
  tiempoPromedio = signal<number>(2.4);

  // Preguntas formateadas con sus métricas consolidadas
  preguntasReporte = signal<any[]>([]);

  // Instancias de gráficos activos para destruirlas en cambios
  private activeCharts: Map<number, Chart> = new Map();

  constructor() {
    // Escucha cambios en las preguntas métricas y dibuja los gráficos correspondientes
    effect(() => {
      const preguntas = this.preguntasReporte();
      if (preguntas.length > 0) {
        this.destruirGraficos();
        setTimeout(() => {
          this.inicializarGraficos(preguntas);
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.cargarEncuestas();
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  cargarEncuestas(): void {
    this.encuestaService.listar().subscribe({
      next: (encuestas) => {
        const list = (encuestas || []).map((enc: any) => ({
          id: Number(enc.codEnc || enc.id),
          titulo: enc.titulo,
          descripcion: enc.descripcion || ''
        }));

        this.encuestas.set(list);
        if (list.length > 0) {
          this.seleccionarEncuesta(list[0].id);
        }
      },
      error: (error) => {
        console.error('Error al cargar encuestas para análisis:', error);
        this.encuestas.set([]);
      }
    });
  }

  seleccionarEncuesta(id: number): void {
    this.selectedSurveyId.set(id);
    const found = this.encuestas().find(e => e.id === id) || null;
    this.activeSurvey.set(found);

    if (found) {
      this.cargarMetricasEncuesta(id);
    }
  }

  cargarMetricasEncuesta(id: number): void {
    this.encuestaService.obtenerAnaliticas(id).subscribe({
      next: (analitica) => {
        this.totalParticipantes.set(analitica.totalParticipantes || 0);
        this.completitud.set(100);
        this.tiempoPromedio.set(2.4);

        const preguntas = (analitica.metricasPreguntas || []).map((q: any) => ({
          ...q,
          datos: q.frecuencias
            ? {
              labels: q.frecuencias.map((f: any) => f.opcion),
              valores: q.frecuencias.map((f: any) => f.frecuencia)
            }
            : undefined
        }));

        this.preguntasReporte.set(preguntas);
      },
      error: (error) => {
        console.error('Error al cargar métricas desde el backend:', error);
        this.preguntasReporte.set([]);
        this.totalParticipantes.set(0);
        this.completitud.set(0);
        this.tiempoPromedio.set(0);
      }
    });
  }

  inicializarGraficos(preguntas: any[]): void {
    preguntas.forEach(q => {
      if (q.codTipoPre === TipoPregunta.ABIERTA) return;

      const canvas = document.getElementById(`chart-q-${q.codPre}`) as HTMLCanvasElement;
      if (!canvas) return;

      const isDoughnut = q.codTipoPre === TipoPregunta.DICOTOMICA || q.codTipoPre === TipoPregunta.POLITOMICA;
      const chartType = isDoughnut ? 'doughnut' : 'bar';

      // Configuración de colores
      const bgColors = isDoughnut
        ? ['#0188FF', '#6366f1', '#ec4899', '#f59e0b', '#10b981']
        : '#0188FF';

      const chart = new Chart(canvas, {
        type: chartType,
        data: {
          labels: q.datos?.labels || [],
          datasets: [{
            data: q.datos?.valores || [],
            backgroundColor: bgColors,
            borderColor: '#ffffff',
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: isDoughnut,
              position: 'bottom',
              labels: {
                boxWidth: 8,
                font: { size: 8, weight: 'bold' }
              }
            }
          },
          scales: !isDoughnut ? {
            y: {
              beginAtZero: true,
              ticks: { font: { size: 8, weight: 'bold' } }
            },
            x: {
              ticks: { font: { size: 8, weight: 'bold' } }
            }
          } : undefined
        }
      });

      this.activeCharts.set(q.codPre, chart);
    });
  }

  destruirGraficos(): void {
    this.activeCharts.forEach(c => {
      c.destroy();
    });
    this.activeCharts.clear();
  }

  onSurveyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.seleccionarEncuesta(Number(select.value));
  }
}
