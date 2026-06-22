import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { TipoPregunta } from '../../../../core/models/encuesta.model';
import { RespuestaEncuestaService } from '../../../../core/services/responder-encuesta.service';

@Component({
  selector: 'app-mis-respuestas',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-solve-darker dark:text-gray-100 transition-colors duration-300">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          <div class="max-w-4xl mx-auto w-full">
            <!-- Cabecera -->
            <div class="mb-8">
              <a routerLink="/dashboard" class="inline-flex items-center gap-2 text-solve-text-muted hover:text-solve-primary dark:text-solve-text-light dark:hover:text-solve-primary font-bold text-sm mb-4 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver al Dashboard
              </a>
              <h1 class="text-3xl font-extrabold text-solve-primary">Mis Respuestas Enviadas</h1>
              <p class="text-solve-text-light dark:text-gray-400 text-sm mt-1">Revisa el historial de tus respuestas y las elecciones enviadas en cada encuesta</p>
            </div>

            <!-- Listado de Respuestas -->
            @if (misRespuestas().length === 0) {
              <div class="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
                <div class="text-5xl mb-4">📩</div>
                <h3 class="text-lg font-bold text-solve-primary mb-1">Aún no has respondido encuestas</h3>
                <p class="text-solve-text-light dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
                  Tus participaciones y respuestas se registrarán aquí automáticamente para tu auditoría.
                </p>
                <a routerLink="/encuestas" class="px-5 py-2.5 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-all text-sm shadow-md">
                  Explorar Encuestas Disponibles
                </a>
              </div>
            } @else {
              <div class="space-y-4">
                @for (registro of misRespuestas(); track registro.codEnc) {
                  <div class="bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden transition-all"
                       [class.border-solve-primary]="expandedSurveyId() === registro.codEnc"
                       [class.border-gray-200]="expandedSurveyId() !== registro.codEnc"
                       [class.dark:border-solve-primary]="expandedSurveyId() === registro.codEnc"
                       [class.dark:border-gray-800]="expandedSurveyId() !== registro.codEnc">
                    
                    <!-- Encabezado Acordeón -->
                    <div (click)="toggleSurvey(registro.codEnc)" 
                          class="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors select-none">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 class="text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                            {{ registro.titulo }}
                          </h3>
                          <span class="text-[10px] font-black text-solve-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/40 uppercase">
                            Respondida
                          </span>
                        </div>
                        <p class="text-xs text-solve-text-light dark:text-gray-400">
                          Enviado el: <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatearFecha(registro.fechaEnvio) }}</span>
                        </p>
                      </div>
                      
                      <div class="flex items-center gap-3">
                        <span class="text-xs text-solve-primary font-bold hidden sm:inline">
                          {{ expandedSurveyId() === registro.codEnc ? 'Ocultar Respuestas' : 'Ver Respuestas' }}
                        </span>
                        <svg class="w-5 h-5 text-solve-primary transition-transform duration-200" 
                             [class.rotate-180]="expandedSurveyId() === registro.codEnc" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>

                    <!-- Detalle de Respuestas -->
                    @if (expandedSurveyId() === registro.codEnc) {
                      <div class="border-t border-gray-150 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-950/20 space-y-6">
                        @for (r of registro.respuestas; track r.codPre; let idx = $index) {
                          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <div class="flex items-start gap-2.5 mb-3">
                              <span class="text-xs font-black text-solve-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                P.{{ idx + 1 }}
                              </span>
                              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">{{ r.enunciado }}</h4>
                            </div>

                            <!-- Visualización de la Respuesta -->
                            <div class="pl-7">
                              <div class="inline-flex items-start gap-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 w-full">
                                <span class="text-solve-primary text-sm flex-shrink-0">✔️</span>
                                <div>
                                  <span class="text-[9px] font-bold text-solve-primary uppercase tracking-wider block mb-0.5">Tu respuesta:</span>
                                  
                                  @if (r.codTipoPre === TipoPregunta.ELECCION_MULTIPLE) {
                                    <div class="flex flex-wrap gap-1.5 mt-1">
                                      @for (opt of r.opcionesTexto; track opt) {
                                        <span class="text-xs font-bold text-solve-primary bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 px-2.5 py-0.5 rounded-lg">
                                          {{ opt }}
                                        </span>
                                      }
                                    </div>
                                  } @else if (r.codTipoPre === TipoPregunta.ESCALA_LIKERT || r.codTipoPre === TipoPregunta.ESCALA_NUMERICA) {
                                    <div class="flex items-center gap-2 mt-1">
                                      <div class="w-8 h-8 rounded-full bg-solve-primary text-white flex items-center justify-center font-black text-sm">
                                        {{ r.valorNumerico }}
                                      </div>
                                      <span class="text-xs font-bold text-solve-text-light dark:text-gray-400">
                                        sobre {{ r.codTipoPre === TipoPregunta.ESCALA_LIKERT ? 5 : 10 }}
                                      </span>
                                    </div>
                                  } @else {
                                    <p class="text-xs font-bold text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                      "{{ r.textoRespuesta }}"
                                    </p>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }

                  </div>
                }
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
export class MisRespuestasComponent implements OnInit {
  private respuestaEncuestaService = inject(RespuestaEncuestaService);
  readonly TipoPregunta = TipoPregunta;
  misRespuestas = signal<any[]>([]);
  expandedSurveyId = signal<number | null>(null);

  // Mocks de respuestas previas para alimentar la demo
  private readonly mockRespuestas = [
    {
      codEnc: 101,
      titulo: 'Encuesta de Satisfacción General (Solve)',
      descripcion: 'Te invitamos a responder esta encuesta para validar los flujos reactivos de SolveSystem.',
      fechaEnvio: '2026-06-22T08:12:00.000Z',
      respuestas: [
        { codPre: 1, enunciado: '¿Qué opinión tienes sobre el desempeño del sistema Solve?', codTipoPre: TipoPregunta.ABIERTA, textoRespuesta: 'El sistema carga de forma inmediata gracias al uso de signals y componentes standalone.' },
        { codPre: 2, enunciado: '¿Consideras que la reactividad con Angular Signals mejora la velocidad percibida?', codTipoPre: TipoPregunta.DICOTOMICA, textoRespuesta: 'Verdadero' },
        { codPre: 3, enunciado: '¿Cuál de los siguientes módulos te parece el más importante para la demo?', codTipoPre: TipoPregunta.POLITOMICA, textoRespuesta: 'Módulo de Creación Dinámica' },
        { codPre: 4, enunciado: 'Selecciona todas las herramientas aplicadas en el frontend (Múltiple):', codTipoPre: TipoPregunta.ELECCION_MULTIPLE, opcionesTexto: ['Angular 21 (Standalone components)', 'Angular Signals', 'Tailwind CSS v4'] },
        { codPre: 5, enunciado: 'Califica la estética visual general (Escala Likert 1-5):', codTipoPre: TipoPregunta.ESCALA_LIKERT, valorNumerico: 5 },
        { codPre: 6, enunciado: 'Califica la compatibilidad percibida (Escala Numérica 1-10):', codTipoPre: TipoPregunta.ESCALA_NUMERICA, valorNumerico: 10 }
      ]
    }
  ];

  ngOnInit(): void {
    this.cargarRespuestas();
  }

  cargarRespuestas(): void {
    const codUsu = Number(localStorage.getItem('userId'));

    if (!codUsu) {
      this.misRespuestas.set([]);
      return;
    }

    this.respuestaEncuestaService.listarPorUsuario(codUsu).subscribe({
      next: (items) => {
        const list = (items || []).map((item: any) => ({
          codEnc: Number(item.codEnc || item.encuesta?.codEnc),
          titulo: item.encuesta?.titulo || 'Encuesta respondida',
          descripcion: item.encuesta?.descripcion || '',
          fechaEnvio: item.fechFin || item.fechInicio || item.fechaEnvio,
          respuestas: []
        }));
        this.misRespuestas.set(list);
      },
      error: (error) => {
        console.error('Error al cargar mis respuestas desde backend:', error);
        this.misRespuestas.set([]);
      }
    });
  }

  toggleSurvey(id: number): void {
    this.expandedSurveyId.update(curr => curr === id ? null : id);
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} a las ${hh}:${min}hs`;
    } catch {
      return fechaStr;
    }
  }
}
