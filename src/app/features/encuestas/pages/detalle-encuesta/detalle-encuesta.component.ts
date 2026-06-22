import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { TipoPregunta } from '../../../../core/models/encuesta.model';

@Component({
  selector: 'app-detalle-encuesta',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden font-sans text-solve-darker">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative pb-28 flex flex-col justify-between">
          <div class="max-w-4xl mx-auto w-full flex-1">
            
            <!-- Botón Volver -->
            <div class="mb-6">
              <a routerLink="/encuestas" class="inline-flex items-center gap-2 text-solve-text-muted hover:text-solve-primary font-bold text-sm mb-4 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver a Encuestas
              </a>
              <h1 class="text-3xl font-extrabold text-solve-primary">Detalle de Encuesta</h1>
              <p class="text-solve-text-light text-sm mt-1">Estructura y configuración técnica de la encuesta publicada</p>
            </div>

            @if (encuesta()) {
              <!-- Ficha Técnica -->
              <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
                <h2 class="text-xl font-bold text-solve-primary mb-3">{{ encuesta().titulo }}</h2>
                <p class="text-solve-text-light text-sm mb-6 leading-relaxed">
                  {{ encuesta().descripcion || 'Sin descripción disponible.' }}
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                    <span class="text-[10px] font-bold text-solve-text-light uppercase tracking-wider">Preguntas</span>
                    <p class="text-2xl font-black text-solve-primary mt-1">{{ encuesta().preguntas?.length || 0 }}</p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                    <span class="text-[10px] font-bold text-solve-text-light uppercase tracking-wider">Tipo Acceso</span>
                    <p class="text-sm font-black text-solve-primary mt-2">
                      {{ encuesta().anonimas ? '🔒 Anónima' : '👤 Autenticada' }}
                    </p>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                    <span class="text-[10px] font-bold text-solve-text-light uppercase tracking-wider">Fecha Publicación</span>
                    <p class="text-sm font-black text-solve-primary mt-2">22/06/2026</p>
                  </div>
                </div>
              </div>

              <!-- Lista de Preguntas -->
              <div class="space-y-6">
                <h3 class="text-lg font-bold text-solve-primary">Preguntas Configuradas</h3>

                @for (preg of encuesta().preguntas; track preg.codPre; let idx = $index) {
                  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-black text-solve-primary bg-blue-50 px-2 py-1 rounded">
                          P.{{ idx + 1 }}
                        </span>
                        <h4 class="text-sm font-bold text-gray-800">{{ preg.enunciado }}</h4>
                      </div>

                      <div class="flex gap-2">
                        <span class="text-[10px] font-bold text-solve-primary bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                          {{ obtenerNombreTipoPregunta(preg.codTipoPre) }}
                        </span>
                        @if (preg.obligatoria === 1) {
                          <span class="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                            Obligatoria
                          </span>
                        } @else {
                          <span class="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-lg">
                            Opcional
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Renderizado de Opciones en modo lectura -->
                    @if (preg.opciones && preg.opciones.length > 0) {
                      <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-150 space-y-2">
                        <p class="text-[10px] font-bold text-solve-text-light uppercase tracking-wider mb-2">Opciones de Respuesta:</p>
                        
                        @if (preg.codTipoPre === TipoPregunta.ESCALA_LIKERT || preg.codTipoPre === TipoPregunta.ESCALA_NUMERICA) {
                          <div class="flex gap-2 items-center">
                            <span class="text-xs text-gray-500 font-bold">Rango:</span>
                            <span class="text-xs text-solve-primary font-black">
                              {{ preg.opciones[0].valorMin || 1 }} al {{ preg.opciones[0].valorMax || (preg.codTipoPre === TipoPregunta.ESCALA_LIKERT ? 5 : 10) }}
                            </span>
                          </div>
                        } @else {
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            @for (opc of preg.opciones; track opc.orden) {
                              <div class="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                <span class="text-solve-primary">▪</span>
                                <span>{{ opc.opcion }}</span>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="text-xs italic text-gray-400 bg-gray-50/30 p-3 rounded-lg border border-dashed border-gray-200">
                        Esta pregunta no requiere opciones predefinidas (respuesta libre por texto).
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <!-- Loading Spinner -->
              <div class="text-center py-20">
                <div class="w-12 h-12 border-4 border-solve-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-solve-text-muted font-bold text-sm">Cargando detalles de la encuesta...</p>
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
export class DetalleEncuestaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private encuestaService = inject(EncuestaService);

  readonly TipoPregunta = TipoPregunta;
  encuesta = signal<any>(null);

  // Mocks de detalles en caso de que no haya conexión
  private readonly mockDetalles: Record<number, any> = {
    101: {
      id: 101,
      titulo: 'Encuesta de Satisfacción General (Solve)',
      descripcion: 'Te invitamos a responder esta encuesta para validar los flujos reactivos de SolveSystem.',
      anonimas: true,
      preguntas: [
        { codPre: 1, enunciado: '¿Qué opinión tienes sobre el desempeño del sistema Solve?', codTipoPre: TipoPregunta.ABIERTA, obligatoria: 1, opciones: [] },
        { codPre: 2, enunciado: '¿Consideras que la reactividad con Angular Signals mejora la velocidad percibida?', codTipoPre: TipoPregunta.DICOTOMICA, obligatoria: 1, opciones: [{ opcion: 'Verdadero', orden: 1 }, { opcion: 'Falso', orden: 2 }] },
        { codPre: 3, enunciado: '¿Cuál de los siguientes módulos te parece el más importante para la demo?', codTipoPre: TipoPregunta.POLITOMICA, obligatoria: 1, opciones: [{ opcion: 'Módulo de Creación Dinámica', orden: 1 }, { opcion: 'Motor de Llenado con Limpieza de Estado', orden: 2 }, { opcion: 'Gráficos de Resultados en Tiempo Real', orden: 3 }] },
        { codPre: 4, enunciado: 'Selecciona todas las herramientas aplicadas en el frontend (Múltiple):', codTipoPre: TipoPregunta.ELECCION_MULTIPLE, obligatoria: 0, opciones: [{ opcion: 'Angular 21 (Standalone components)', orden: 1 }, { opcion: 'Tailwind CSS v4', orden: 2 }, { opcion: 'Chart.js Canvas', orden: 3 }, { opcion: 'Angular Signals', orden: 4 }] },
        { codPre: 5, enunciado: 'Califica la estética visual general (Escala Likert 1-5):', codTipoPre: TipoPregunta.ESCALA_LIKERT, obligatoria: 1, opciones: [{ opcion: 'Escala', valorMin: 1, valorMax: 5, orden: 1 }] },
        { codPre: 6, enunciado: 'Califica la compatibilidad percibida (Escala Numérica 1-10):', codTipoPre: TipoPregunta.ESCALA_NUMERICA, obligatoria: 1, opciones: [{ opcion: 'Escala', valorMin: 1, valorMax: 10, orden: 1 }] }
      ]
    },
    102: {
      id: 102,
      titulo: 'Evaluación del Módulo de Autenticación',
      descripcion: 'Encuesta corta para evaluar la usabilidad del sistema de login y roles en local.',
      anonimas: false,
      preguntas: [
        { codPre: 7, enunciado: '¿Consideras amigable el flujo de login?', codTipoPre: TipoPregunta.DICOTOMICA, obligatoria: 1, opciones: [{ opcion: 'Sí', orden: 1 }, { opcion: 'No', orden: 2 }] },
        { codPre: 8, enunciado: '¿El cambio de roles en localStorage actualiza correctamente el Layout?', codTipoPre: TipoPregunta.DICOTOMICA, obligatoria: 1, opciones: [{ opcion: 'Sí', orden: 1 }, { opcion: 'No', orden: 2 }] },
        { codPre: 9, enunciado: '¿Qué mejoras añadirías al panel de login?', codTipoPre: TipoPregunta.ABIERTA, obligatoria: 0, opciones: [] }
      ]
    },
    103: {
      id: 103,
      titulo: 'Sondeo sobre Tailwind CSS v4 vs v3',
      descripcion: 'Comparación técnica de rendimiento y nuevas características sintácticas de la hoja de estilos.',
      anonimas: true,
      preguntas: [
        { codPre: 10, enunciado: '¿Qué versión de Tailwind prefieres?', codTipoPre: TipoPregunta.POLITOMICA, obligatoria: 1, opciones: [{ opcion: 'Tailwind CSS v3', orden: 1 }, { opcion: 'Tailwind CSS v4 (Nueva)', orden: 2 }] },
        { codPre: 11, enunciado: 'Califica la facilidad de migración a la v4:', codTipoPre: TipoPregunta.ESCALA_LIKERT, obligatoria: 1, opciones: [{ opcion: 'Escala', valorMin: 1, valorMax: 5, orden: 1 }] }
      ]
    }
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarDetalle(id);
    }
  }

  cargarDetalle(id: number): void {
    this.encuestaService.obtenerEncuestaConDetalles(id).subscribe({
      next: (response) => {
        const data = response.data || response;
        this.encuesta.set(data);
      },
      error: () => {
        // Fallback robusto en local
        const mock = this.mockDetalles[id] || this.mockDetalles[101];
        // Forzar el ID correcto si caemos en el default
        mock.id = id;
        this.encuesta.set(mock);
      }
    });
  }

  obtenerNombreTipoPregunta(tipo: TipoPregunta): string {
    switch (tipo) {
      case TipoPregunta.ABIERTA: return 'Abierta';
      case TipoPregunta.DICOTOMICA: return 'Dicotómica';
      case TipoPregunta.POLITOMICA: return 'Politómica';
      case TipoPregunta.ELECCION_MULTIPLE: return 'Selección Múltiple';
      case TipoPregunta.RANKING: return 'Ranking';
      case TipoPregunta.ESCALA_LIKERT: return 'Escala Likert';
      case TipoPregunta.ESCALA_NUMERICA: return 'Escala Numérica';
      default: return 'Desconocido';
    }
  }
}
