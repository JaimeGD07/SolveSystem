import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { TipoPregunta } from '../../../../core/models/encuesta.model';

interface Participacion {
  id: string;
  email: string;
  codEnc: number;
  tituloEncuesta: string;
  fechaEnvio: string;
  respuestas: {
    codPre: number;
    enunciado: string;
    codTipoPre: TipoPregunta;
    textoRespuesta?: string;
    valorNumerico?: number;
    opcionesTexto?: string[];
  }[];
}

@Component({
  selector: 'app-respuestas-recibidas',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-solve-darker dark:text-gray-100 transition-colors duration-300">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          <div class="max-w-6xl mx-auto w-full">
            
            <!-- Cabecera -->
            <div class="mb-8">
              <a routerLink="/dashboard" class="inline-flex items-center gap-2 text-solve-text-muted hover:text-solve-primary dark:text-solve-text-light dark:hover:text-solve-primary font-bold text-sm mb-4 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver al Dashboard
              </a>
              <h1 class="text-3xl font-extrabold text-solve-primary">Respuestas Recibidas</h1>
              <p class="text-solve-text-light dark:text-gray-400 text-sm mt-1">Monitorea y audita los envíos de los participantes en cada encuesta</p>
            </div>

            <!-- Filtros y Grid Principal -->
            <div class="space-y-6">
              
              <!-- Barra de Búsqueda y Filtros -->
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <!-- Buscador de Email -->
                <div class="relative w-full md:max-w-xs">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔍</span>
                  <input type="text" 
                         (input)="onSearchChange($event)"
                         placeholder="Buscar por participante/email..." 
                         class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-solve-primary bg-gray-50/50 dark:bg-gray-800/50 text-gray-950 dark:text-white">
                </div>

                <!-- Selector de Encuesta -->
                <div class="w-full md:max-w-xs">
                  <select (change)="onSurveyFilterChange($event)"
                          class="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-solve-primary bg-gray-50/50 dark:bg-gray-800/50 text-gray-950 dark:text-white">
                    <option value="">Todas las encuestas</option>
                    @for (title of titulosEncuestas(); track title) {
                      <option [value]="title">{{ title }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Vista Compartida de 2 Columnas -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Columna Izquierda: Listado de Envíos (1/3) -->
                <div class="lg:col-span-1 space-y-4">
                  <h3 class="text-sm font-bold text-solve-primary uppercase tracking-wider mb-2">Bandeja de envíos ({{ filtrados().length }})</h3>
                  
                  @if (filtrados().length === 0) {
                    <div class="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                      <p class="text-xs text-solve-text-light dark:text-gray-400">No se encontraron envíos que coincidan con los filtros.</p>
                    </div>
                  } @else {
                    <div class="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                      @for (item of filtrados(); track item.id) {
                        <div (click)="seleccionar(item)"
                             class="p-4 bg-white dark:bg-gray-900 border rounded-xl cursor-pointer hover:shadow-md transition-all select-none flex flex-col justify-between"
                             [class.border-solve-primary]="seleccionada()?.id === item.id"
                             [class.border-gray-200]="seleccionada()?.id !== item.id"
                             [class.dark:border-solve-primary]="seleccionada()?.id === item.id"
                             [class.dark:border-gray-800]="seleccionada()?.id !== item.id">
                          <div>
                            <div class="flex justify-between items-start gap-2 mb-2">
                              <span class="text-xs font-black text-solve-primary truncate dark:text-blue-400 block max-w-[170px]" [title]="item.email">
                                {{ item.email }}
                              </span>
                              <span class="text-[9px] font-bold text-solve-text-light whitespace-nowrap">
                                {{ formatearFecha(item.fechaEnvio) }}
                              </span>
                            </div>
                            <h4 class="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                              {{ item.tituloEncuesta }}
                            </h4>
                          </div>
                          <div class="flex justify-end mt-3 border-t border-gray-100 dark:border-gray-800 pt-2 text-[10px] font-black text-solve-primary">
                            Auditar respuestas →
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Columna Derecha: Detalle de Respuestas (2/3) -->
                <div class="lg:col-span-2">
                  @if (!seleccionada()) {
                    <div class="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm h-full text-center">
                      <div class="text-5xl mb-4">📥</div>
                      <h3 class="text-base font-bold text-solve-primary mb-1">Selecciona una respuesta</h3>
                      <p class="text-xs text-solve-text-light dark:text-gray-400 max-w-sm mx-auto">
                        Haz clic en cualquiera de los envíos de la bandeja izquierda para auditar el desglose de preguntas y respuestas seleccionadas.
                      </p>
                    </div>
                  } @else {
                    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
                      
                      <!-- Datos del Participante -->
                      <div class="border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
                          <span class="text-xs font-black text-solve-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                            Participante Auditado
                          </span>
                          <span class="text-[10px] font-black text-gray-400">
                            ID envío: #{{ seleccionada()?.id }}
                          </span>
                        </div>
                        <h3 class="text-base font-black text-gray-900 dark:text-white">{{ seleccionada()?.email }}</h3>
                        <p class="text-xs text-solve-text-light mt-1">
                          Respondió a la encuesta <span class="font-bold text-gray-700 dark:text-gray-300">"{{ seleccionada()?.tituloEncuesta }}"</span> el {{ formatearFechaDetalle(seleccionada()?.fechaEnvio) }}
                        </p>
                      </div>

                      <!-- Listado de Preguntas y Respuestas del usuario -->
                      <div class="space-y-4">
                        @for (r of seleccionada()?.respuestas; track r.codPre; let idx = $index) {
                          <div class="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-950/20">
                            <div class="flex items-start gap-2 mb-3">
                              <span class="text-[10px] font-black text-solve-primary bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                P.{{ idx + 1 }}
                              </span>
                              <h4 class="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">{{ r.enunciado }}</h4>
                            </div>

                            <div class="pl-8">
                              <div class="inline-flex items-start gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 w-full">
                                <span class="text-solve-primary text-xs flex-shrink-0">✔️</span>
                                <div>
                                  <span class="text-[8px] font-bold text-solve-primary uppercase tracking-wider block mb-0.5">Respuesta:</span>
                                  
                                  @if (r.codTipoPre === TipoPregunta.ELECCION_MULTIPLE) {
                                    <div class="flex flex-wrap gap-1 mt-1">
                                      @for (opt of r.opcionesTexto; track opt) {
                                        <span class="text-[10px] font-bold text-solve-primary bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-md">
                                          {{ opt }}
                                        </span>
                                      }
                                    </div>
                                  } @else if (r.codTipoPre === TipoPregunta.ESCALA_LIKERT || r.codTipoPre === TipoPregunta.ESCALA_NUMERICA) {
                                    <div class="flex items-center gap-2 mt-1">
                                      <div class="w-7 h-7 rounded-full bg-solve-primary text-white flex items-center justify-center font-black text-xs">
                                        {{ r.valorNumerico }}
                                      </div>
                                      <span class="text-[10px] font-bold text-solve-text-light dark:text-gray-400">
                                        sobre {{ r.codTipoPre === TipoPregunta.ESCALA_LIKERT ? 5 : 10 }}
                                      </span>
                                    </div>
                                  } @else {
                                    <p class="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                      "{{ r.textoRespuesta }}"
                                    </p>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>

                    </div>
                  }
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
export class RespuestasRecibidasComponent implements OnInit {
  readonly TipoPregunta = TipoPregunta;

  // Signal del listado completo
  participaciones = signal<Participacion[]>([]);
  seleccionada = signal<Participacion | null>(null);

  // Filtros de búsqueda
  searchEmail = signal<string>('');
  surveyFilter = signal<string>('');

  // Mocks de envíos previos de otros usuarios
  private readonly mockParticipaciones: Participacion[] = [
    {
      id: 'sub-001',
      email: 'sofia.castro@solve.edu',
      codEnc: 101,
      tituloEncuesta: 'Encuesta de Satisfacción General (Solve)',
      fechaEnvio: '2026-06-22T02:15:00.000Z',
      respuestas: [
        { codPre: 1, enunciado: '¿Qué opinión tienes sobre el desempeño del sistema Solve?', codTipoPre: TipoPregunta.ABIERTA, textoRespuesta: 'Me parece un sistema sumamente reactivo y rápido en local.' },
        { codPre: 2, enunciado: '¿Consideras que la reactividad con Angular Signals mejora la velocidad percibida?', codTipoPre: TipoPregunta.DICOTOMICA, textoRespuesta: 'Verdadero' },
        { codPre: 3, enunciado: '¿Cuál de los siguientes módulos te parece el más importante para la demo?', codTipoPre: TipoPregunta.POLITOMICA, textoRespuesta: 'Módulo de Creación Dinámica' },
        { codPre: 4, enunciado: 'Selecciona todas las herramientas aplicadas en el frontend (Múltiple):', codTipoPre: TipoPregunta.ELECCION_MULTIPLE, opcionesTexto: ['Angular 21 (Standalone components)', 'Angular Signals', 'Tailwind CSS v4'] },
        { codPre: 5, enunciado: 'Califica la estética visual general (Escala Likert 1-5):', codTipoPre: TipoPregunta.ESCALA_LIKERT, valorNumerico: 5 },
        { codPre: 6, enunciado: 'Califica la compatibilidad percibida (Escala Numérica 1-10):', codTipoPre: TipoPregunta.ESCALA_NUMERICA, valorNumerico: 10 }
      ]
    },
    {
      id: 'sub-002',
      email: 'carlos.gomez@gmail.com',
      codEnc: 101,
      tituloEncuesta: 'Encuesta de Satisfacción General (Solve)',
      fechaEnvio: '2026-06-21T18:30:00.000Z',
      respuestas: [
        { codPre: 1, enunciado: '¿Qué opinión tienes sobre el desempeño del sistema Solve?', codTipoPre: TipoPregunta.ABIERTA, textoRespuesta: 'Funciona bien, aunque me gustaría ver más transiciones animadas.' },
        { codPre: 2, enunciado: '¿Consideras que la reactividad con Angular Signals mejora la velocidad percibida?', codTipoPre: TipoPregunta.DICOTOMICA, textoRespuesta: 'Verdadero' },
        { codPre: 3, enunciado: '¿Cuál de los siguientes módulos te parece el más importante para la demo?', codTipoPre: TipoPregunta.POLITOMICA, textoRespuesta: 'Bandeja de Listados' },
        { codPre: 4, enunciado: 'Selecciona todas las herramientas aplicadas en el frontend (Múltiple):', codTipoPre: TipoPregunta.ELECCION_MULTIPLE, opcionesTexto: ['Angular 21 (Standalone components)', 'Tailwind CSS v4'] },
        { codPre: 5, enunciado: 'Califica la estética visual general (Escala Likert 1-5):', codTipoPre: TipoPregunta.ESCALA_LIKERT, valorNumerico: 4 },
        { codPre: 6, enunciado: 'Califica la compatibilidad percibida (Escala Numérica 1-10):', codTipoPre: TipoPregunta.ESCALA_NUMERICA, valorNumerico: 8 }
      ]
    },
    {
      id: 'sub-003',
      email: 'maria.lopez@yahoo.com',
      codEnc: 102,
      tituloEncuesta: 'Evaluación del Módulo de Autenticación',
      fechaEnvio: '2026-06-21T15:30:00.000Z',
      respuestas: [
        { codPre: 1, enunciado: '¿Qué tan seguro consideras el login simulado?', codTipoPre: TipoPregunta.ESCALA_LIKERT, valorNumerico: 4 },
        { codPre: 2, enunciado: '¿La velocidad del delay de red simulado es adecuada?', codTipoPre: TipoPregunta.DICOTOMICA, textoRespuesta: 'Verdadero' },
        { codPre: 3, enunciado: 'Describe tu experiencia de redirección por roles:', codTipoPre: TipoPregunta.ABIERTA, textoRespuesta: 'Es inmediata. Detecta el email y asigna el rol correcto en localStorage.' }
      ]
    }
  ];

  ngOnInit(): void {
    this.cargarRespuestas();
  }

  cargarRespuestas(): void {
    try {
      const emailPorDefecto = localStorage.getItem('userEmail') || 'encuestado@gmail.com';
      const savedStr = localStorage.getItem('solve_respuestas_usuario');
      let localList: Participacion[] = [];

      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (parsed.length > 0) {
          localList = parsed.map((item: any, idx: number) => ({
            id: `usr-${100 + idx}`,
            email: emailPorDefecto,
            codEnc: item.codEnc,
            tituloEncuesta: item.titulo,
            fechaEnvio: item.fechaEnvio || new Date().toISOString(),
            respuestas: item.respuestas
          }));
        }
      }

      this.participaciones.set([...localList, ...this.mockParticipaciones]);
      
      // Auto-seleccionar la primera al cargar si existe
      const total = this.participaciones();
      if (total.length > 0) {
        this.seleccionada.set(total[0]);
      }
    } catch {
      this.participaciones.set(this.mockParticipaciones);
      if (this.mockParticipaciones.length > 0) {
        this.seleccionada.set(this.mockParticipaciones[0]);
      }
    }
  }

  // Lista computed filtrada
  readonly filtrados = computed(() => {
    const search = this.searchEmail().toLowerCase().trim();
    const filter = this.surveyFilter();
    
    return this.participaciones().filter(item => {
      const matchSearch = item.email.toLowerCase().includes(search) || item.tituloEncuesta.toLowerCase().includes(search);
      const matchFilter = !filter || item.tituloEncuesta === filter;
      return matchSearch && matchFilter;
    });
  });

  // Lista computed de títulos de encuestas únicos para el filtro
  readonly titulosEncuestas = computed(() => {
    const titulos = this.participaciones().map(item => item.tituloEncuesta);
    return Array.from(new Set(titulos));
  });

  seleccionar(item: Participacion): void {
    this.seleccionada.set(item);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchEmail.set(input.value);
  }

  onSurveyFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.surveyFilter.set(select.value);
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const date = new Date(fechaStr);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dd}/${mm} ${hh}:${min}h`;
    } catch {
      return fechaStr;
    }
  }

  formatearFechaDetalle(fechaStr: string | undefined): string {
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
