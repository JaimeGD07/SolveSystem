import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 px-8 text-center text-xs text-solve-text-light dark:text-gray-400 mt-auto transition-colors duration-300">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {{ currentYear }} SolveSystem. Todos los derechos reservados.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-solve-primary dark:hover:text-blue-400 transition-colors">Términos de Servicio</a>
          <span class="text-gray-300 dark:text-gray-700">|</span>
          <a href="#" class="hover:text-solve-primary dark:hover:text-blue-400 transition-colors">Política de Privacidad</a>
          <span class="text-gray-300 dark:text-gray-700">|</span>
          <a href="#" class="hover:text-solve-primary dark:hover:text-blue-400 transition-colors">Soporte Técnico</a>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
