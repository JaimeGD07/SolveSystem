import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-placeholder-page',
  imports: [SidebarComponent, HeaderComponent, FooterComponent, RouterLink],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden font-sans text-solve-darker">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <app-header></app-header>
        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative flex flex-col">
          <div class="max-w-2xl mx-auto my-auto text-center py-12 px-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div class="text-6xl mb-6 select-none animate-bounce">🛠️</div>
            <h1 class="text-3xl font-extrabold text-solve-primary mb-3">Módulo en Desarrollo</h1>
            <h2 class="text-lg font-bold text-solve-primary bg-blue-50 px-4 py-1.5 rounded-lg inline-block mb-4">{{ title() }}</h2>
            <p class="text-solve-text-light text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Estamos trabajando arduamente para traerte esta sección del sistema Solve. Muy pronto estará disponible con integraciones completas en tiempo real.
            </p>
            <a routerLink="/dashboard" class="inline-flex items-center gap-2 px-6 py-2.5 bg-solve-primary hover:bg-solve-primary-hover text-white font-bold rounded-xl transition-all text-sm shadow-md hover:scale-105 active:scale-95">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver al Dashboard
            </a>
          </div>
        </main>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  title = signal<string>('Sección');

  ngOnInit(): void {
    const dataTitle = this.route.snapshot.data['title'];
    if (dataTitle) {
      this.title.set(dataTitle);
    }
  }
}
