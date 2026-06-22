import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-action-card',
  imports: [RouterLink],
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all h-full">
      <div class="mb-4 text-2xl text-solve-darker dark:text-solve-primary">{{ icon() }}</div>

      <h3 class="text-sm font-bold text-solve-darker dark:text-white mb-2 min-h-10">{{ title() }}</h3>

      <p class="text-xs text-solve-blue-dash dark:text-gray-400 grow mb-4">{{ description() }}</p>

      <a [routerLink]="routePath()" class="w-full py-2 bg-solve-pale-strong dark:bg-gray-800 hover:bg-solve-pale dark:hover:bg-gray-700 text-solve-darker dark:text-gray-200 font-bold rounded-lg transition-colors text-sm">
        {{ buttonText() }}
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  icon = input<string>('📄'); // Valor por defecto
  buttonText = input<string>('Ir'); // Valor por defecto
  routePath = input.required<string>();
}
