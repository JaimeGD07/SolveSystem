import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormArray, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Inyectamos el cascarón del sistema
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

@Component({
  selector: 'app-crear-encuesta',
  imports: [ReactiveFormsModule, RouterLink, SidebarComponent, HeaderComponent],
  templateUrl: './crear-encuesta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrearEncuestaComponent {
  private fb = inject(FormBuilder);

  expandedQuestionIndex = signal<number | null>(0);

  encuestaForm = this.fb.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    idioma: ['Español'],
    anonimas: [false],
    barraProgreso: [true],
    aleatorizar: [false], // <-- Aquí está el campo para aleatorizar
    preguntas: this.fb.array([])
  });

  constructor() {
    this.addPregunta();
  }

  get preguntas(): FormArray {
    return this.encuestaForm.get('preguntas') as FormArray;
  }

  // Getter auxiliar para acceder a las opciones de una pregunta específica
  getOpciones(preguntaIndex: number): FormArray {
    return this.preguntas.at(preguntaIndex).get('opciones') as FormArray;
  }

  addPregunta(): void {
    const preguntaGroup = this.fb.group({
      enunciado: ['', Validators.required],
      codTipoPre: [1, Validators.required],
      obligatoria: [true],
      // Sub-arreglo dinámico para opciones
      opciones: this.fb.array([])
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

  // Métodos para manejar las opciones dinámicas
  addOpcion(preguntaIndex: number): void {
    const opciones = this.getOpciones(preguntaIndex);
    opciones.push(this.fb.group({
      texto: ['', Validators.required]
    }));
  }

  removeOpcion(preguntaIndex: number, opcionIndex: number): void {
    this.getOpciones(preguntaIndex).removeAt(opcionIndex);
  }

  toggleQuestion(index: number): void {
    this.expandedQuestionIndex.update(current => current === index ? null : index);
  }

  onSubmit(): void {
    if (this.encuestaForm.invalid) {
      this.encuestaForm.markAllAsTouched();
      return;
    }
    console.log('Datos listos para el backend:', this.encuestaForm.value);
  }
}
