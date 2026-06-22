import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'Sistema' | 'Personalizado';
  permisos: string[]; // Lista de capacidades del rol
}

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, ReactiveFormsModule],
  templateUrl: './gestion-roles.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionRolesComponent {
  private fb = inject(FormBuilder);

  // Catálogo maestro de permisos disponibles en el sistema
  PERMISOS_SISTEMA = ['ACCESO_TOTAL', 'CREAR_ENCUESTAS', 'EDITAR_ENCUESTAS', 'RESPONDER_ENCUESTAS', 'VER_AUDITORIA'];

  // Datos semilla con sus respectivos permisos asignados
  roles = signal<Rol[]>([
    { id: 1, nombre: 'Administrator', descripcion: 'Full system access', tipo: 'Sistema', permisos: ['ACCESO_TOTAL', 'VER_AUDITORIA'] },
    { id: 2, nombre: 'Surveyor', descripcion: 'Survey creation and management', tipo: 'Sistema', permisos: ['CREAR_ENCUESTAS', 'EDITAR_ENCUESTAS'] },
    { id: 3, nombre: 'Surveyed', descripcion: 'Survey response submission', tipo: 'Sistema', permisos: ['RESPONDER_ENCUESTAS'] }
  ]);

  isRoleModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedRol = signal<Rol | null>(null);
  modalMode = signal<'create' | 'edit'>('create');

  // Formulario Reactivo con FormArray para los checkboxes de permisos
  roleForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required]],
    tipo: new FormControl<'Sistema' | 'Personalizado'>('Personalizado', { nonNullable: true }),
    permisosSeleccionados: this.fb.array([])
  });

  get permisosFormArray() {
    return this.roleForm.get('permisosSeleccionados') as FormArray;
  }

  private initPermisosCheckboxes(permisosAsignados: string[] = []) {
    this.permisosFormArray.clear();
    this.PERMISOS_SISTEMA.forEach(permiso => {
      this.permisosFormArray.push(new FormControl(permisosAsignados.includes(permiso)));
    });
  }

  private obtenerPermisosDelForm(): string[] {
    return this.PERMISOS_SISTEMA.filter((_, index) => this.permisosFormArray.at(index).value);
  }

  abrirCrear(): void {
    this.modalMode.set('create');
    this.selectedRol.set(null);
    this.roleForm.reset({ tipo: 'Personalizado' });
    this.initPermisosCheckboxes();
    this.roleForm.get('tipo')?.enable(); // Permitir elegir tipo si es nuevo
    this.isRoleModalOpen.set(true);
  }

  abrirEditar(rol: Rol): void {
    if (rol.tipo === 'Sistema') return; // Protección a nivel de código

    this.modalMode.set('edit');
    this.selectedRol.set(rol);
    this.roleForm.patchValue({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      tipo: rol.tipo
    });
    this.initPermisosCheckboxes(rol.permisos);
    this.roleForm.get('tipo')?.disable(); // Regla: No cambiar tipo a roles existentes
    this.isRoleModalOpen.set(true);
  }

  cerrarRoleModal(): void {
    this.isRoleModalOpen.set(false);
    this.selectedRol.set(null);
  }

  guardarRol(): void {
    if (this.roleForm.invalid) return;

    const valoresForm = this.roleForm.getRawValue();
    const permisosDefinidos = this.obtenerPermisosDelForm();

    if (this.modalMode() === 'create') {
      const nuevoId = this.roles().length > 0 ? Math.max(...this.roles().map(r => r.id)) + 1 : 1;
      const nuevoRol: Rol = {
        id: nuevoId,
        nombre: valoresForm.nombre!,
        descripcion: valoresForm.descripcion!,
        tipo: valoresForm.tipo!,
        permisos: permisosDefinidos
      };
      this.roles.update(lista => [...lista, nuevoRol]);
    } else {
      const rolId = this.selectedRol()!.id;
      this.roles.update(lista =>
        lista.map(rol => rol.id === rolId ? {
          ...rol,
          nombre: valoresForm.nombre!,
          descripcion: valoresForm.descripcion!,
          permisos: permisosDefinidos
        } : rol)
      );
    }
    this.cerrarRoleModal();
  }

  abrirEliminar(rol: Rol): void {
    if (rol.tipo === 'Sistema') return; // Bloqueo estricto
    this.selectedRol.set(rol);
    this.isDeleteModalOpen.set(true);
  }

  cerrarEliminar(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedRol.set(null);
  }

  confirmarEliminar(): void {
    const rolId = this.selectedRol()?.id;
    if (!rolId) return;

    this.roles.update(lista => lista.filter(rol => rol.id !== rolId));
    this.cerrarEliminar();
  }
}
