import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { EncuestaService } from '../../../../core/services/encuesta.service';
import { RespuestaEncuestaService } from '../../../../core/services/responder-encuesta.service';
import { PreguntaService } from '../../../../core/services/pregunta.service';
import { OpcionRespuestaService } from '../../../../core/services/opcion-respuesta.service';
import { TipoPregunta, ResponderEncuestaRequest, RespuestaPreguntaRequest } from '../../../../core/models/encuesta.model';

@Component({
  selector: 'app-responder-encuesta',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, HeaderComponent, FooterComponent],
  templateUrl: './responder-encuesta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponderEncuestaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private encuestaService = inject(EncuestaService);
  private respuestaEncuestaService = inject(RespuestaEncuestaService);
  private preguntaService = inject(PreguntaService);
  private opcionRespuestaService = inject(OpcionRespuestaService);

  readonly TipoPregunta = TipoPregunta;

  encuesta = signal<any>(null);
  formGroup = signal<FormGroup>(this.fb.group({}));
  submitted = signal<boolean>(false);
  success = signal<boolean>(false);

  // Progreso de llenado (porcentaje de preguntas obligatorias contestadas)
  progreso = computed(() => {
    const enc = this.encuesta();
    const fg = this.formGroup();
    if (!enc || !fg) return 0;

    const obligatorias = enc.preguntas.filter((p: any) => p.obligatoria === 1);
    if (obligatorias.length === 0) return 100;

    let contestadas = 0;
    obligatorias.forEach((p: any) => {
      const control = fg.get(p.codPre.toString());
      if (control && control.valid && control.value !== null && control.value !== '') {
        contestadas++;
      }
    });

    return Math.round((contestadas / obligatorias.length) * 100);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarEncuesta(id);
    }
  }

  cargarEncuesta(id: number): void {
    this.encuestaService.buscarPorId(id).subscribe({
      next: (response) => {
        const enc = response.data || response;
        this.encuesta.set(enc);
        this.construirFormulario(enc);
      },
      error: (error) => {
        console.error('Error al cargar encuesta:', error);
        this.cargarMockEncuesta(id);
      }
    });
  }

  cargarMockEncuesta(id: number): void {
    const mock = {
      id: id,
      titulo: 'Encuesta de Satisfacción General (Solve)',
      descripcion: 'Te invitamos a responder esta encuesta para validar los flujos reactivos de SolveSystem.',
      anonimas: true,
      barraProgreso: true,
      aleatorizar: false,
      preguntas: [
        {
          codPre: 101,
          enunciado: '¿Qué opinión tienes sobre el desempeño del sistema Solve?',
          codTipoPre: TipoPregunta.ABIERTA,
          obligatoria: 1,
          opciones: []
        },
        {
          codPre: 102,
          enunciado: '¿Consideras que la reactividad con Angular Signals mejora la velocidad percibida?',
          codTipoPre: TipoPregunta.DICOTOMICA,
          obligatoria: 1,
          opciones: [
            { codOpc: 201, orden: 1, opcion: 'Verdadero' },
            { codOpc: 202, orden: 2, opcion: 'Falso' }
          ]
        },
        {
          codPre: 103,
          enunciado: '¿Cuál de los siguientes módulos te parece el más importante para la demo?',
          codTipoPre: TipoPregunta.POLITOMICA,
          obligatoria: 1,
          opciones: [
            { codOpc: 301, orden: 1, opcion: 'Módulo de Creación Dinámica' },
            { codOpc: 302, orden: 2, opcion: 'Motor de Llenado con Limpieza de Estado' },
            { codOpc: 303, orden: 3, opcion: 'Gráficos de Resultados en Tiempo Real' }
          ]
        },
        {
          codPre: 104,
          enunciado: 'Selecciona todas las herramientas aplicadas en el frontend (Múltiple):',
          codTipoPre: TipoPregunta.ELECCION_MULTIPLE,
          obligatoria: 0,
          opciones: [
            { codOpc: 401, orden: 1, opcion: 'Angular 21 (Standalone components)' },
            { codOpc: 402, orden: 2, opcion: 'Tailwind CSS v4' },
            { codOpc: 403, orden: 3, opcion: 'Chart.js Canvas' },
            { codOpc: 404, orden: 4, opcion: 'Angular Signals' }
          ]
        },
        {
          codPre: 105,
          enunciado: 'Califica la estética visual general (Escala Likert 1-5):',
          codTipoPre: TipoPregunta.ESCALA_LIKERT,
          obligatoria: 1,
          opciones: [{ codOpc: 501, orden: 1, opcion: 'Escala', valorMin: 1, valorMax: 5 }]
        },
        {
          codPre: 106,
          enunciado: 'Califica la compatibilidad percibida (Escala Numérica 1-10):',
          codTipoPre: TipoPregunta.ESCALA_NUMERICA,
          obligatoria: 1,
          opciones: [{ codOpc: 601, orden: 1, opcion: 'Escala', valorMin: 1, valorMax: 10 }]
        }
      ]
    };
    this.encuesta.set(mock);
    this.construirFormulario(mock);
  }

  construirFormulario(encuesta: any): void {
    const group: any = {};
    encuesta.preguntas.forEach((p: any) => {
      const validators = p.obligatoria === 1 ? [Validators.required] : [];
      
      if (p.codTipoPre === TipoPregunta.ELECCION_MULTIPLE) {
        const subGroup: any = {};
        p.opciones.forEach((o: any) => {
          subGroup[o.opcion] = new FormControl(false);
        });
        group[p.codPre.toString()] = this.fb.group(subGroup);
      } else {
        group[p.codPre.toString()] = new FormControl('', validators);
      }
    });
    this.formGroup.set(this.fb.group(group));
  }

  isOptionChecked(preguntaId: number, opcion: string): boolean {
    const fg = this.formGroup().get(preguntaId.toString()) as FormGroup;
    return fg ? !!fg.get(opcion)?.value : false;
  }

  onCheckboxChange(preguntaId: number, opcion: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const fg = this.formGroup().get(preguntaId.toString()) as FormGroup;
    if (fg) {
      fg.get(opcion)?.setValue(checkbox.checked);
      fg.markAsDirty();
      fg.updateValueAndValidity();
    }
  }

  seleccionarEscala(preguntaId: number, valor: number): void {
    const control = this.formGroup().get(preguntaId.toString());
    if (control) {
      control.setValue(valor);
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  obtenerEscalaActiva(preguntaId: number): number | null {
    const control = this.formGroup().get(preguntaId.toString());
    return control ? control.value : null;
  }

  onSubmit(): void {
    this.submitted.set(true);
    const fg = this.formGroup();

    if (fg.invalid) {
      fg.markAllAsTouched();
      return;
    }

    const enc = this.encuesta();
    const codUsu = Number(localStorage.getItem('userId'));
    const codEnc = Number(enc?.codEnc || enc?.id || this.route.snapshot.paramMap.get('id'));

    if (!codUsu) {
      console.error('No existe userId en localStorage. Inicia sesión nuevamente.');
      return;
    }

    if (!codEnc) {
      console.error('No se encontró el código de encuesta:', enc);
      return;
    }

    const respuestas: any[] = [];

    enc.preguntas.forEach((p: any) => {
      const val = fg.get(p.codPre.toString())?.value;
      const tipo = Number(p.codTipoPre);

      if (tipo === TipoPregunta.ELECCION_MULTIPLE || tipo === TipoPregunta.RANKING) {
        Object.keys(val || {}).forEach((k, index) => {
          if (val[k]) {
            const opcObj = p.opciones.find((o: any) => o.opcion === k);
            if (opcObj) {
              respuestas.push({
                codPre: p.codPre,
                codOpcResp: Number(opcObj.codOpcResp || opcObj.codOpc),
                posicionRank: tipo === TipoPregunta.RANKING ? index + 1 : null
              });
            }
          }
        });
        return;
      }

      if (
        tipo === TipoPregunta.DICOTOMICA ||
        tipo === TipoPregunta.POLITOMICA ||
        tipo === TipoPregunta.ESCALA_NOMINAL
      ) {
        const opcObj = p.opciones.find((o: any) => o.opcion === val || Number(o.codOpcResp || o.codOpc) === Number(val));
        respuestas.push({
          codPre: p.codPre,
          codOpcResp: opcObj ? Number(opcObj.codOpcResp || opcObj.codOpc) : null
        });
        return;
      }

      if (tipo === TipoPregunta.ESCALA_LIKERT) {
        const opcObj = p.opciones.find((o: any) => Number(o.valor || o.codOpcResp || o.codOpc) === Number(val));
        respuestas.push({
          codPre: p.codPre,
          codOpcResp: opcObj ? Number(opcObj.codOpcResp || opcObj.codOpc) : null,
          valorResp: Number(val)
        });
        return;
      }

      if (tipo === TipoPregunta.ESCALA_NUMERICA) {
        respuestas.push({
          codPre: p.codPre,
          valorResp: Number(val)
        });
        return;
      }

      respuestas.push({
        codPre: p.codPre,
        textoResp: val ? val.toString() : ''
      });
    });

    const payload: ResponderEncuestaRequest = {
      codUsu,
      codEnc,
      respuestas
    };

    console.log('Enviando respuestas al backend:', payload);

    this.respuestaEncuestaService.responderEncuesta(payload).subscribe({
      next: () => {
        this.guardarEnLocalStorage(enc, respuestas);
        this.success.set(true);
      },
      error: (error) => {
        console.error('Error real al enviar respuestas:', error);
      }
    });
  }

  guardarEnLocalStorage(encuesta: any, respuestas: any[]): void {
    try {
      const savedStr = localStorage.getItem('solve_respuestas_usuario');
      const list = savedStr ? JSON.parse(savedStr) : [];
      
      const nuevoRegistro = {
        codEnc: encuesta.codEnc || encuesta.id,
        titulo: encuesta.titulo,
        descripcion: encuesta.descripcion,
        fechaEnvio: new Date().toISOString(),
        respuestas: respuestas.map(r => {
          const preguntaObj = encuesta.preguntas.find((p: any) => p.codPre === r.codPre);
          return {
            codPre: r.codPre,
            enunciado: preguntaObj ? preguntaObj.enunciado : 'Pregunta sin enunciado',
            codTipoPre: preguntaObj ? preguntaObj.codTipoPre : 1,
            textoRespuesta: r.textoRespuesta,
            valorNumerico: r.valorNumerico,
            opcionesSeleccionadasIds: r.opcionesSeleccionadasIds,
            opcionesTexto: r.opcionesSeleccionadasIds && preguntaObj && preguntaObj.opciones
              ? preguntaObj.opciones
                  .filter((o: any) => r.opcionesSeleccionadasIds.includes(o.codOpc || o.codOpcResp))
                  .map((o: any) => o.opcion)
              : []
          };
        })
      };

      const filterList = list.filter((item: any) => item.codEnc !== (encuesta.codEnc || encuesta.id));
      filterList.unshift(nuevoRegistro);
      localStorage.setItem('solve_respuestas_usuario', JSON.stringify(filterList));
    } catch (e) {
      console.error('Error al persistir respuestas en localStorage:', e);
    }
  }

  resetearLlenado(): void {
    this.submitted.set(false);
    this.success.set(false);
    const enc = this.encuesta();
    if (enc) {
      this.construirFormulario(enc);
    }
  }
}
