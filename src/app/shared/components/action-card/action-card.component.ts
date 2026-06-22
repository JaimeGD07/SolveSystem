import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-action-card',
  imports: [RouterLink],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow h-full">
      <div class="mb-4 text-2xl text-solve-darker">{{ icon() }}</div>

      <h3 class="text-sm font-bold text-solve-darker mb-2 min-h-10">{{ title() }}</h3>

      <p class="text-xs text-solve-blue-dash grow mb-4">{{ description() }}</p>

      <a [routerLink]="routePath()" class="w-full py-2 bg-solve-pale-strong hover:bg-solve-pale text-solve-darker font-bold rounded-lg transition-colors text-sm">
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
