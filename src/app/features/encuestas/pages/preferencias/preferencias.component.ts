import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-preferencias',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    FooterComponent
  ],
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
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver al Dashboard
              </a>
              <h1 class="text-3xl font-extrabold text-solve-primary">Preferencias de Cuenta</h1>
              <p class="text-solve-text-light dark:text-gray-400 text-sm mt-1">Configura las alertas de correo, notificaciones y apariencia de tu espacio de trabajo.</p>
            </div>

            <!-- Formulario Principal -->
            <form [formGroup]="prefForm" (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Sección: Perfil -->
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-850 pb-4">
                  <span class="text-xl">👤</span>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Perfil de Usuario</h3>
                    <p class="text-xs text-solve-text-muted dark:text-gray-400">Tus datos básicos de identificación en la plataforma.</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Nombre Completo</label>
                    <input type="text" formControlName="nombre" 
                           class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-solve-primary focus:border-transparent transition-all"
                           [class.border-red-500]="prefForm.get('nombre')?.touched && prefForm.get('nombre')?.invalid"
                           placeholder="Ingresa tu nombre completo">
                    @if (prefForm.get('nombre')?.touched && prefForm.get('nombre')?.hasError('required')) {
                      <p class="text-xs text-red-500 mt-1 font-bold">El nombre es requerido.</p>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Correo Electrónico (Solo Lectura)</label>
                    <input type="email" formControlName="correo" 
                           class="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-450 font-semibold cursor-not-allowed focus:outline-none"
                           readonly>
                  </div>
                </div>
              </div>

              <!-- Sección: Notificaciones -->
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-850 pb-4">
                  <span class="text-xl">🔔</span>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Preferencias de Notificación</h3>
                    <p class="text-xs text-solve-text-muted dark:text-gray-400">Controla cuándo y cómo deseas recibir comunicaciones de encuestas.</p>
                  </div>
                </div>

                <div class="space-y-6">
                  <!-- Alertas por Correo -->
                  <div class="flex justify-between items-center">
                    <div>
                      <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200">Alertas por Correo Electrónico</h4>
                      <p class="text-xs text-solve-text-muted dark:text-gray-400">Recibe una notificación por email cada vez que se publique una nueva encuesta compatible.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="alertasCorreo" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-solve-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-solve-primary"></div>
                    </label>
                  </div>

                  <!-- Recordatorios -->
                  <div class="flex justify-between items-center">
                    <div>
                      <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200">Recordatorios de Encuestas</h4>
                      <p class="text-xs text-solve-text-muted dark:text-gray-400">Recordatorios semanales de encuestas pendientes que están próximas a cerrar.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" formControlName="recordatorios" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-solve-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-solve-primary"></div>
                    </label>
                  </div>

                  <!-- Frecuencia -->
                  <div class="pt-4 border-t border-gray-100 dark:border-gray-850">
                    <label class="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Frecuencia de Notificaciones de Resumen</label>
                    <select formControlName="frecuencia" 
                            class="w-full md:w-64 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-solve-primary focus:border-transparent transition-all">
                      <option value="semanal">Resumen Semanal</option>
                      <option value="quincenal">Resumen Quincenal</option>
                      <option value="mensual">Resumen Mensual</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Sección: Apariencia Visual -->
              <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-850 pb-4">
                  <span class="text-xl">🎨</span>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Personalización Visual</h3>
                    <p class="text-xs text-solve-text-muted dark:text-gray-400">Ajusta el tema y estilo visual de la aplicación para tu comodidad.</p>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200">Modo Oscuro</h4>
                    <p class="text-xs text-solve-text-muted dark:text-gray-400">Cambia la interfaz a una tonalidad oscura para descansar la vista en ambientes de poca luz.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" formControlName="darkMode" class="sr-only peer" (change)="onDarkModeToggle()">
                    <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-solve-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-solve-primary"></div>
                  </label>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="flex justify-end gap-4">
                <button type="button" routerLink="/dashboard" 
                        class="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all text-sm shadow-sm">
                  Cancelar
                </button>
                <button type="submit" 
                        [disabled]="prefForm.invalid || isSaving()"
                        class="px-6 py-3 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-all text-sm shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (isSaving()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  } @else {
                    💾 Guardar Cambios
                  }
                </button>
              </div>

            </form>
          </div>
        </main>

        <app-footer></app-footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferenciasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  isSaving = signal<boolean>(false);

  // Formulario reactivo
  prefForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    correo: [{ value: '', disabled: true }],
    alertasCorreo: [true],
    recordatorios: [true],
    frecuencia: ['semanal'],
    darkMode: [false]
  });

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  cargarPreferencias(): void {
    const savedName = localStorage.getItem('userName') || '';
    const savedEmail = localStorage.getItem('userEmail') || '';
    const currentTheme = localStorage.getItem('solve_theme') || 'light';
    const isDark = currentTheme === 'dark';

    // Cargar configuraciones adicionales desde localStorage si existen, o usar valores por defecto
    const savedAlertas = localStorage.getItem('solve_pref_alertas_correo') !== 'false'; // por defecto true
    const savedRecordatorios = localStorage.getItem('solve_pref_recordatorios') !== 'false'; // por defecto true
    const savedFrecuencia = localStorage.getItem('solve_pref_frecuencia') || 'semanal';

    this.prefForm.patchValue({
      nombre: savedName,
      correo: savedEmail,
      alertasCorreo: savedAlertas,
      recordatorios: savedRecordatorios,
      frecuencia: savedFrecuencia,
      darkMode: isDark
    });
  }

  onDarkModeToggle(): void {
    const isDark = this.prefForm.get('darkMode')?.value || false;
    this.toggleDarkMode(isDark);
  }

  toggleDarkMode(isDark: boolean): void {
    const classList = document.documentElement.classList;
    if (isDark) {
      classList.add('dark');
      localStorage.setItem('solve_theme', 'dark');
    } else {
      classList.remove('dark');
      localStorage.setItem('solve_theme', 'light');
    }
  }

  onSubmit(): void {
    if (this.prefForm.invalid) {
      this.prefForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    // Simular guardado local (1 segundo)
    setTimeout(() => {
      const rawValues = this.prefForm.getRawValue();
      
      // Guardar nombre y preferencias en localStorage
      localStorage.setItem('userName', rawValues.nombre);
      localStorage.setItem('solve_pref_alertas_correo', String(rawValues.alertasCorreo));
      localStorage.setItem('solve_pref_recordatorios', String(rawValues.recordatorios));
      localStorage.setItem('solve_pref_frecuencia', rawValues.frecuencia);
      
      // Cambiar modo oscuro por si acaso
      this.toggleDarkMode(rawValues.darkMode);

      this.isSaving.set(false);
      this.notificationService.success('Las preferencias de tu cuenta han sido guardadas exitosamente.');
    }, 1000);
  }
}
