import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

interface ParametroConfig {
  id: number;
  clave: string;
  valor: string;
  descripcion: string;
  categoria: 'Seguridad' | 'Encuestas' | 'General';
}

@Component({
  selector: 'app-configuracion-sistema',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, ReactiveFormsModule],
  templateUrl: './configuracion-sistema.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfiguracionSistemaComponent {
  private fb = inject(FormBuilder);

  // Estado Reactivo con parámetros base típicos del ecosistema Spring Boot + Oracle
  parametros = signal<ParametroConfig[]>([
    { id: 1, clave: 'MAX_LOGIN_ATTEMPTS', valor: '5', descripcion: 'Intentos permitidos antes de bloquear usuario', categoria: 'Seguridad' },
    { id: 2, clave: 'SESSION_TIMEOUT_MIN', valor: '30', descripcion: 'Tiempo de vida de la sesión JWT', categoria: 'Seguridad' },
    { id: 3, clave: 'AUTO_SAVE_INTERVAL_SEC', valor: '15', descripcion: 'Frecuencia de guardado automático de encuestas', categoria: 'Encuestas' },
    { id: 4, clave: 'SUPPORT_EMAIL', valor: 'soporte@solve.com', descripcion: 'Correo remitente para notificaciones del sistema', categoria: 'General' }
  ]);

  // Controladores de estado para modales
  isConfigModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedParam = signal<ParametroConfig | null>(null);
  modalMode = signal<'create' | 'edit'>('create');

  // Formulario reactivo único con validaciones estrictas (DRY)
  configForm: FormGroup = this.fb.group({
    clave: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]], // Solo mayúsculas, números y guiones bajos
    valor: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    categoria: ['General', [Validators.required]]
  });

  // --- Operaciones del Formulario Modales (Crear / Editar) ---
  abrirCrear(): void {
    this.modalMode.set('create');
    this.selectedParam.set(null);
    this.configForm.reset({ categoria: 'General' });
    this.configForm.get('clave')?.enable(); // Permitir definir clave si es nueva
    this.isConfigModalOpen.set(true);
  }

  abrirEditar(param: ParametroConfig): void {
    this.modalMode.set('edit');
    this.selectedParam.set(param);
    this.configForm.patchValue({
      clave: param.clave,
      valor: param.valor,
      descripcion: param.descripcion,
      categoria: param.categoria
    });
    this.configForm.get('clave')?.disable(); // Regla de negocio: La clave técnica no se edita, solo su valor
    this.isConfigModalOpen.set(true);
  }

  cerrarConfigModal(): void {
    this.isConfigModalOpen.set(false);
    this.selectedParam.set(null);
    this.configForm.reset();
  }

  guardarParametro(): void {
    if (this.configForm.invalid) return;

    // getRawValue extrae incluso los campos deshabilitados (como 'clave' en modo edición)
    const datosForm = this.configForm.getRawValue();

    if (this.modalMode() === 'create') {
      const nuevoId = this.parametros().length > 0 ? Math.max(...this.parametros().map(p => p.id)) + 1 : 1;
      const nuevoParam: ParametroConfig = { id: nuevoId, ...datosForm };

      this.parametros.update(lista => [...lista, nuevoParam]);
      // TODO: Conectar endpoint Spring Boot: POST /api/configuraciones
    } else {
      const paramId = this.selectedParam()!.id;

      this.parametros.update(lista =>
        lista.map(p => p.id === paramId ? { ...p, ...datosForm } : p)
      );
      // TODO: Conectar endpoint Spring Boot: PUT /api/configuraciones/id
    }

    this.cerrarConfigModal();
  }

  // --- Operaciones de Eliminación ---
  abrirEliminar(param: ParametroConfig): void {
    this.selectedParam.set(param);
    this.isDeleteModalOpen.set(true);
  }

  cerrarEliminar(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedParam.set(null);
  }

  confirmarEliminar(): void {
    const paramId = this.selectedParam()?.id;
    if (!paramId) return;

    this.parametros.update(lista => lista.filter(p => p.id !== paramId));
    // TODO: Conectar endpoint Spring Boot: DELETE /api/configuraciones/id
    this.cerrarEliminar();
  }
}
