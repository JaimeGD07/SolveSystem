import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { RespuestaEncuestaService } from '../../../../core/services/responder-encuesta.service';

Chart.register(...registerables);

@Component({
  selector: 'app-historial',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-solve-darker dark:text-gray-100 transition-colors duration-300">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          <div class="max-w-5xl mx-auto w-full">
            
            <!-- Cabecera -->
            <div class="mb-8">
              <a routerLink="/dashboard" class="inline-flex items-center gap-2 text-solve-text-muted hover:text-solve-primary dark:text-solve-text-light dark:hover:text-solve-primary font-bold text-sm mb-4 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver al Dashboard
              </a>
              <h1 class="text-3xl font-extrabold text-solve-primary">Historial de Participación</h1>
              <p class="text-solve-text-light dark:text-gray-400 text-sm mt-1">Monitorea tus estadísticas de resolución y línea de tiempo de actividades</p>
            </div>

            <!-- KPIs de Resumen -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl flex items-center justify-center text-solve-primary text-xl font-bold">
                  📋
                </div>
                <div>
                  <p class="text-xs font-bold text-solve-text-muted dark:text-gray-400 uppercase tracking-wider">Encuestas Completadas</p>
                  <p class="text-2xl font-black text-solve-primary mt-1">{{ totalEncuestas() }}</p>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-450 text-xl font-bold">
                  📝
                </div>
                <div>
                  <p class="text-xs font-bold text-solve-text-muted dark:text-gray-400 uppercase tracking-wider">Preguntas Respondidas</p>
                  <p class="text-2xl font-black text-green-600 dark:text-green-405 mt-1">{{ totalPreguntas() }}</p>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-405 text-xl font-bold">
                  ⏱️
                </div>
                <div>
                  <p class="text-xs font-bold text-solve-text-muted dark:text-gray-400 uppercase tracking-wider">Tiempo Estimado</p>
                  <p class="text-lg font-black text-indigo-600 dark:text-indigo-405 mt-1">{{ tiempoEstimado() }} min</p>
                </div>
              </div>
            </div>

            <!-- Dos Columnas: Timeline y Gráfico -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              <!-- Timeline (Columna Izquierda 2/3) -->
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm lg:col-span-2">
                <h3 class="text-base font-bold text-solve-primary mb-6">Línea de Tiempo de Actividad</h3>
                
                <div class="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-8 ml-2">
                  @for (log of participaciones(); track log.codEnc) {
                    <div class="relative">
                      <!-- Punto en la línea -->
                      <span class="absolute -left-[31px] top-1 bg-solve-primary border-4 border-white dark:border-gray-900 w-4 h-4 rounded-full shadow-sm"></span>
                      
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">
                            Contestó la encuesta: <span class="text-solve-primary">{{ log.titulo }}</span>
                          </h4>
                          <p class="text-xs text-solve-text-light dark:text-gray-400 mt-1">
                            Se enviaron {{ log.respuestas?.length || 0 }} respuestas de opinión
                          </p>
                        </div>
                        <span class="text-[10px] font-bold text-solve-text-light dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700 px-2 py-0.5 rounded-lg self-start sm:self-auto">
                          {{ formatearFecha(log.fechaEnvio) }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Gráfico de Dona (Columna Derecha 1/3) -->
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 class="text-base font-bold text-solve-primary mb-2">Temáticas de Interés</h3>
                  <p class="text-xs text-solve-text-light dark:text-gray-400 mb-6">Distribución de encuestas completadas por categoría de negocio</p>
                </div>
                
                <div class="relative h-48 w-full mx-auto mb-4">
                  <canvas id="categories-chart"></canvas>
                </div>

                <div class="text-[10px] text-center text-solve-text-light dark:text-gray-400 font-bold">
                  Métricas calculadas en tiempo real
                </div>
              </div>

            </div>

          </div>
        </main>

        <app-footer></app-footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorialComponent implements OnInit, OnDestroy {
  private respuestaEncuestaService = inject(RespuestaEncuestaService);
  participaciones = signal<any[]>([]);
  private chart: Chart | null = null;

  // Fallback mocks en local para robustez de la demo
  private readonly mockParticipaciones = [
    {
      codEnc: 101,
      titulo: 'Encuesta de Satisfacción General (Solve)',
      fechaEnvio: '2026-06-22T08:12:00.000Z',
      categoria: 'Calidad de Software',
      respuestas: [1, 2, 3, 4, 5, 6]
    },
    {
      codEnc: 102,
      titulo: 'Evaluación del Módulo de Autenticación',
      fechaEnvio: '2026-06-21T15:30:00.000Z',
      categoria: 'Usabilidad',
      respuestas: [1, 2, 3]
    },
    {
      codEnc: 103,
      titulo: 'Sondeo sobre Tailwind CSS v4 vs v3',
      fechaEnvio: '2026-06-18T10:45:00.000Z',
      categoria: 'Tecnología',
      respuestas: [1, 2]
    }
  ];

  // computed KPIs
  readonly totalEncuestas = computed(() => this.participaciones().length);
  readonly totalPreguntas = computed(() => {
    return this.participaciones().reduce((sum, item) => sum + (item.respuestas?.length || 0), 0);
  });
  readonly tiempoEstimado = computed(() => {
    // Estimamos 1.5 minutos por encuesta contestada
    return Math.max(1, Math.round(this.totalEncuestas() * 2.5));
  });

  ngOnInit(): void {
    this.cargarHistorial();
    this.inicializarGraficoConRetraso();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  cargarHistorial(): void {
    const codUsu = Number(localStorage.getItem('userId'));

    if (!codUsu) {
      this.participaciones.set([]);
      return;
    }

    this.respuestaEncuestaService.listarPorUsuario(codUsu).subscribe({
      next: (items) => {
        const list = (items || []).map((item: any) => ({
          codEnc: Number(item.codEnc || item.encuesta?.codEnc),
          titulo: item.encuesta?.titulo || 'Encuesta respondida',
          descripcion: item.encuesta?.descripcion || '',
          fechaEnvio: item.fechFin || item.fechInicio || item.fechaEnvio,
          categoria: 'Encuestas',
          respuestas: []
        }));
        this.participaciones.set(list);
        this.inicializarGraficoConRetraso();
      },
      error: (error) => {
        console.error('Error al cargar historial desde backend:', error);
        this.participaciones.set([]);
      }
    });
  }

  inicializarGraficoConRetraso(): void {
    setTimeout(() => {
      this.crearGrafico();
    }, 100);
  }

  crearGrafico(): void {
    const canvas = document.getElementById('categories-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Canvas para gráfico de categorías no encontrado.');
      return;
    }

    // Calcular distribución por categorías de las participaciones
    const categoriasMapa: Record<string, number> = {};
    this.participaciones().forEach(p => {
      // Si viene de local, le asignamos una temática simulada basada en su id
      let cat = p.categoria;
      if (!cat) {
        if (p.codEnc === 101) cat = 'Calidad de Software';
        else if (p.codEnc === 102) cat = 'Usabilidad';
        else cat = 'Tecnología';
      }
      categoriasMapa[cat] = (categoriasMapa[cat] || 0) + 1;
    });

    const labels = Object.keys(categoriasMapa);
    const dataValues = Object.values(categoriasMapa);

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: ['#0891b2', '#6366f1', '#ec4899', '#f59e0b'],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: {
                size: 9,
                weight: 'bold'
              }
            }
          }
        }
      }
    });
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return fechaStr;
    }
  }
}
