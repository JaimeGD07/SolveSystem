import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  template: `
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
      <h3 class="text-sm font-bold text-solve-blue-dash mb-2">{{ title() }}</h3>
      <p class="text-4xl font-bold text-solve-primary mb-2">{{ value() }}</p>
      <p class="text-xs font-bold text-solve-blue-dash mt-auto">{{ subtitle() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  subtitle = input.required<string>();
}
