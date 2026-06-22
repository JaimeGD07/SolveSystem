import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col h-full transition-all">
      <h3 class="text-sm font-bold text-solve-blue-dash dark:text-gray-400 mb-2">{{ title() }}</h3>
      <p class="text-4xl font-bold text-solve-primary dark:text-blue-400 mb-2">{{ value() }}</p>
      <p class="text-xs font-bold text-solve-blue-dash dark:text-gray-400 mt-auto">{{ subtitle() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  subtitle = input.required<string>();
}
