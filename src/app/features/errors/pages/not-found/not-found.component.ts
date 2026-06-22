import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-black flex items-center justify-center font-sans">
      <div class="flex items-center gap-6 text-white">
        <h1 class="text-3xl font-medium tracking-wider">404</h1>
        <div class="h-10 w-px bg-white/30"></div>
        <h2 class="text-sm font-normal tracking-wide text-gray-300">
          This page could not be found.
        </h2>
      </div>

      <a routerLink="/" class="absolute bottom-10 text-xs text-gray-500 hover:text-white transition-colors">
        Volver al inicio
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}
