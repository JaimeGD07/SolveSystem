import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Inyectamos el cascarón del sistema y los servicios
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { TipoPregunta, CrearEncuestaRequest } from '../../../../core/models/encuesta.model';
import { EncuestaService } from '../../../../core/services/encuesta.service';

@Component({
  selector: 'app-crear-encuesta',
  imports: [ReactiveFormsModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './crear-encuesta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearEncuestaComponent {
  private fb = inject(FormBuilder);
  private encuestaService = inject(EncuestaService);
  private router = inject(Router);

  readonly TipoPregunta = TipoPregunta;

  expandedQuestionIndex = signal<number | null>(0);

  encuestaForm = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    preguntas: this.fb.array([])
  });

  constructor() {
    this.addPregunta();
  }

  get preguntas(): FormArray {
    return this.encuestaForm.get('preguntas') as FormArray;
  }

  getOpciones(preguntaIndex: number): FormArray {
    return this.preguntas.at(preguntaIndex).get('opciones') as FormArray;
  }

  addPregunta(): void {
    const preguntaGroup = this.fb.group({
      enunciado: ['', Validators.required],
      codTipoPre: [TipoPregunta.ABIERTA, Validators.required],
      obligatoria: [true],
      codCat: [1], // Categoría por defecto
      opciones: this.fb.array([]),
      // Campos opcionales para escalas
      valorMin: [1],
      valorMax: [5]
    });

    this.preguntas.push(preguntaGroup);
    this.expandedQuestionIndex.set(this.preguntas.length - 1);
  }

  removePregunta(index: number): void {
    this.preguntas.removeAt(index);
    if (this.expandedQuestionIndex() === index) {
      this.expandedQuestionIndex.set(null);
    }
  }

  onTipoPreChange(preguntaIndex: number): void {
    const preguntaGroup = this.preguntas.at(preguntaIndex) as FormGroup;
    const tipo = Number(preguntaGroup.get('codTipoPre')?.value);
    const opciones = this.getOpciones(preguntaIndex);

    opciones.clear();

    if (tipo === TipoPregunta.DICOTOMICA) {
      // Dicotómica: Falso/Verdadero predefinido
      opciones.push(this.fb.group({
        opcion: ['Verdadero', Validators.required],
        orden: [1]
      }));
      opciones.push(this.fb.group({
        opcion: ['Falso', Validators.required],
        orden: [2]
      }));
    } else if (tipo === TipoPregunta.POLITOMICA || tipo === TipoPregunta.ELECCION_MULTIPLE || tipo === TipoPregunta.RANKING) {
      // Inicializar con dos opciones vacías para que el usuario las complete
      opciones.push(this.fb.group({
        opcion: ['', Validators.required],
        orden: [1]
      }));
      opciones.push(this.fb.group({
        opcion: ['', Validators.required],
        orden: [2]
      }));
    } else if (tipo === TipoPregunta.ESCALA_LIKERT) {
      preguntaGroup.patchValue({ valorMin: 1, valorMax: 5 });
    } else if (tipo === TipoPregunta.ESCALA_NUMERICA) {
      preguntaGroup.patchValue({ valorMin: 1, valorMax: 10 });
    }
  }

  addOpcion(preguntaIndex: number): void {
    const opciones = this.getOpciones(preguntaIndex);
    opciones.push(this.fb.group({
      opcion: ['', Validators.required],
      orden: [opciones.length + 1]
    }));
  }

  removeOpcion(preguntaIndex: number, opcionIndex: number): void {
    this.getOpciones(preguntaIndex).removeAt(opcionIndex);
  }

  toggleQuestion(index: number): void {
    this.expandedQuestionIndex.update(current => current === index ? null : index);
  }

  onSubmit(): void {
    this.guardarEncuesta();
    if (this.encuestaForm.invalid) {
      this.encuestaForm.markAllAsTouched();
      return;
    }

    const formVal = this.encuestaForm.value;

    const payload: CrearEncuestaRequest = {
      titulo: formVal.titulo || '',
      descripcion: formVal.descripcion || ''
    };

    // Imprimir para depuración y llamar al servicio de creación
    console.log('Enviando encuesta al backend:', payload, formVal.preguntas);


  }
  guardarEncuesta(): void {
    console.log('Botón guardar presionado');

    if (this.encuestaForm.invalid) {
      this.encuestaForm.markAllAsTouched();
      console.log('Formulario inválido');
      return;
    }

    const data = this.encuestaForm.getRawValue();

    const payload = {
      titulo: data.titulo || '',
      descripcion: data.descripcion || '',
      preguntas: (data.preguntas || []).map((p: any) => ({
        texto: p.enunciado,
        tipo: this.obtenerTipoBackend(p.codTipoPre),
        obligatoria: p.obligatoria === true,
        opciones: (p.opciones || []).map((op: any, index: number) => ({
          texto: op.opcion,
          valor: op.valor ?? index + 1,
          orden: op.orden ?? index + 1
        }))
      }))
    };

    console.log('Payload final:', JSON.stringify(payload, null, 2));

    this.encuestaService.crearEncuestaCompleta(payload).subscribe({
      next: (res) => {
        console.log('Encuesta completa guardada:', res);
        this.router.navigate(['/encuestas']);
      },
      error: (err) => {
        console.error('Error al crear encuesta en backend:', err);
        console.error('Mensaje backend:', err?.error?.message);
      }
    });
  }
  private obtenerTipoBackend(tipo: any): string {
    const tipoNumero = Number(tipo);

    switch (tipoNumero) {
      case TipoPregunta.ABIERTA:
        return 'ABIERTA';

      case TipoPregunta.DICOTOMICA:
        return 'DICOTOMICA';

      case TipoPregunta.POLITOMICA:
        return 'POLITOMICA';

      case TipoPregunta.ELECCION_MULTIPLE:
        return 'ELECCION_MULTIPLE';

      case TipoPregunta.RANKING:
        return 'RANKING';

      case TipoPregunta.ESCALA_LIKERT:
        return 'ESCALA_LIKERT';

      case TipoPregunta.ESCALA_NUMERICA:
        return 'ESCALA_NUMERICA';

      case TipoPregunta.ESCALA_NOMINAL:
        return 'ESCALA_NOMINAL';

      case TipoPregunta.MIXTA:
        return 'MIXTA';

      default:
        return String(tipo).trim().toUpperCase();
    }
  }
}

