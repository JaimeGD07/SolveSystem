import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { Encuesta } from '../../../../core/models/encuesta.model';

@Component({
  selector: 'app-listado-encuestas',
  imports: [CommonModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden font-sans text-solve-darker">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative pb-28 flex flex-col justify-between">
          <div class="max-w-6xl mx-auto w-full flex-1">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 class="text-3xl font-extrabold text-solve-primary">Bandeja de Encuestas</h1>
                <p class="text-solve-text-light text-sm mt-1">Explora, responde y analiza las encuestas disponibles en el sistema</p>
              </div>
              
              @if (userRole() === 'ADMIN' || userRole() === 'ENCUESTADOR') {
                <a routerLink="/encuestas/crear" class="inline-flex items-center gap-2 px-5 py-2.5 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-all text-sm shadow-md hover:scale-105 active:scale-95 self-start md:self-auto">
                  <span>➕ Nueva Encuesta</span>
                </a>
              }
            </div>

            <!-- Filtros de Búsqueda -->
            <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div class="relative w-full sm:max-w-md">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔍</span>
                <input type="text" 
                       (input)="onSearchChange($event)"
                       placeholder="Buscar por título..." 
                       class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-solve-primary bg-gray-50/50">
              </div>
              <div class="text-xs font-bold text-solve-primary bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
                <span>Rol Actual:</span>
                <span class="uppercase text-solve-primary">{{ userRole() }}</span>
              </div>
            </div>

            <!-- Lista de Encuestas -->
            @if (loading()) {
              <!-- Skeleton Loaders -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (item of [1, 2, 3]; track $index) {
                  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="space-y-2">
                      <div class="h-3 bg-gray-200 rounded"></div>
                      <div class="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div class="flex gap-2">
                      <div class="h-6 bg-gray-200 rounded w-16"></div>
                      <div class="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div class="h-9 bg-gray-200 rounded w-full pt-4"></div>
                  </div>
                }
              </div>
            } @else {
              @if (filteredEncuestas().length === 0) {
                <!-- Empty State -->
                <div class="text-center py-16 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                  <div class="text-5xl mb-4">📋</div>
                  <h3 class="text-lg font-bold text-solve-primary mb-1">No se encontraron encuestas</h3>
                  <p class="text-solve-text-light text-sm max-w-md mx-auto mb-6">
                    Aún no se han publicado encuestas que coincidan con tu búsqueda, o no hay registros cargados.
                  </p>
                  @if (userRole() === 'ADMIN' || userRole() === 'ENCUESTADOR') {
                    <a routerLink="/encuestas/crear" class="px-5 py-2.5 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-all text-sm shadow-md">
                      Crear primera encuesta
                    </a>
                  }
                </div>
              } @else {
                <!-- Grid of surveys -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (enc of filteredEncuestas(); track enc.id) {
                    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-solve-primary transition-all flex flex-col justify-between h-full">
                      <div>
                        <!-- Badge y Fecha -->
                        <div class="flex justify-between items-center mb-4">
                          <span class="text-xs font-bold text-solve-primary bg-blue-50 px-2.5 py-1 rounded-lg">
                            📝 {{ enc.numeroPreguntas }} preguntas
                          </span>
                          <span class="text-[10px] font-bold text-solve-text-light">
                            📅 {{ formatearFecha(enc.fechaCreacion) }}
                          </span>
                        </div>

                        <!-- Título y descripción -->
                        <h3 class="text-base font-bold text-gray-900 mb-2 hover:text-solve-primary transition-colors min-h-12 line-clamp-2">
                          {{ enc.titulo }}
                        </h3>
                        <p class="text-solve-text-light text-xs mb-6 line-clamp-3 min-h-12 leading-relaxed">
                          {{ enc.descripcion || 'Sin descripción adicional disponible.' }}
                        </p>
                      </div>

                      <!-- Botones de Acción según rol -->
                      <div class="pt-4 border-t border-gray-100 mt-auto flex flex-col gap-2">
                        @if (userRole() === 'ADMIN' || userRole() === 'ENCUESTADOR') {
                          <div class="flex gap-2">
                            <a [routerLink]="['/encuestas', enc.id, 'resultados']" 
                               class="flex-1 text-center py-2 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-colors text-xs shadow-sm">
                              📊 Analíticas
                            </a>
                            <a [routerLink]="['/encuestas', enc.id]" 
                               class="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-xs">
                              🔍 Detalles
                            </a>
                          </div>
                        } @else {
                          <a [routerLink]="['/encuestas', enc.id, 'responder']" 
                             class="w-full text-center py-2.5 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-colors text-xs shadow-sm flex items-center justify-center gap-2">
                            ✏️ Responder Encuesta
                          </a>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            }
          </div>
        </main>

        <app-footer></app-footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListadoEncuestasComponent implements OnInit {
  private encuestaService = inject(EncuestaService);
  
  // Exponer Signals del servicio
  readonly loading = this.encuestaService.loading;
  readonly encuestas = this.encuestaService.encuestas;
  
  // Estado local
  userRole = signal<string>('ENCUESTADO');
  searchQuery = signal<string>('');

  // Fallback mocks en local para robustez de la demo
  private readonly mockEncuestas: Encuesta[] = [
    {
      id: 101,
      titulo: 'Encuesta de Satisfacción General (Solve)',
      descripcion: 'Te invitamos a responder esta encuesta para validar los flujos reactivos de SolveSystem y evaluar el rendimiento general.',
      numeroPreguntas: 6,
      fechaCreacion: '2026-06-20',
      numeroRespuestas: 14
    },
    {
      id: 102,
      titulo: 'Evaluación del Módulo de Autenticación',
      descripcion: 'Encuesta corta para evaluar la usabilidad del sistema de login simulado y la asignación de roles por correo electrónico.',
      numeroPreguntas: 4,
      fechaCreacion: '2026-06-21',
      numeroRespuestas: 8
    },
    {
      id: 103,
      titulo: 'Sondeo sobre Tailwind CSS v4 vs v3',
      descripcion: 'Comparación técnica de rendimiento, uso de variables de entorno y nuevas directivas en la hoja de estilos global.',
      numeroPreguntas: 5,
      fechaCreacion: '2026-06-22',
      numeroRespuestas: 25
    }
  ];

  // computed para filtrar encuestas
  readonly filteredEncuestas = computed(() => {
    let list = this.encuestas();
    
    // Si el servicio no devolvió nada (backend caído), usamos mocks para la demo
    if (list.length === 0 && !this.loading()) {
      list = this.mockEncuestas;
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return list;
    }

    return list.filter(e => e.titulo.toLowerCase().includes(query) || (e.descripcion && e.descripcion.toLowerCase().includes(query)));
  });

  ngOnInit(): void {
    // 1. Cargar el rol guardado en localStorage
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      this.userRole.set(savedRole);
    }

    // 2. Cargar encuestas reales desde el backend
    this.encuestaService.cargarEncuestas();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const parts = fechaStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return fechaStr;
    } catch {
      return fechaStr;
    }
  }
}
