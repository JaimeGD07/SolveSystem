import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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

    const preguntas = enc.preguntas ?? [];
    const obligatorias = preguntas.filter((p: any) => Number(p.obligatoria) === 1 || p.obligatoria === true);

    if (obligatorias.length === 0) return 100;

    let contestadas = 0;

    obligatorias.forEach((p: any) => {
      const control = fg.get(String(p.codPre));

      if (!control) return;

      const valor = control.value;

      if (typeof valor === 'object' && valor !== null) {
        const algunaMarcada = Object.values(valor).some(v => v === true);
        if (algunaMarcada) contestadas++;
        return;
      }

      if (control.valid && valor !== null && valor !== undefined && valor !== '') {
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
    this.encuestaService.buscarPorId(id).pipe(
      switchMap((response: any) => {
        const enc = response.data || response;

        return this.preguntaService.listarPorEncuesta(id).pipe(
          switchMap((preguntas: any[]) => {
            const preguntasNormalizadas = (preguntas ?? []).map((p: any) => this.normalizarPregunta(p));

            if (preguntasNormalizadas.length === 0) {
              return of({
                ...enc,
                preguntas: []
              });
            }

            const peticionesOpciones = preguntasNormalizadas.map((p: any) =>
              this.opcionRespuestaService.listarPorPregunta(p.codPre).pipe(
                map((opciones: any[]) => ({
                  ...p,
                  opciones: (opciones ?? []).map((o: any) => this.normalizarOpcion(o))
                })),
                catchError(() => of({
                  ...p,
                  opciones: []
                }))
              )
            );

            return forkJoin(peticionesOpciones).pipe(
              map((preguntasConOpciones: any[]) => ({
                ...enc,
                preguntas: preguntasConOpciones
              }))
            );
          }),
          catchError((error) => {
            console.error('Error al cargar preguntas:', error);
            console.error('Detalle backend:', error?.error);
            console.error('Mensaje backend:', error?.error?.mensaje || error?.error?.message);

            return of({
              ...enc,
              preguntas: []
            });
          })
        );
      })
    ).subscribe({
      next: (encuestaCompleta: any) => {
        console.log('Encuesta completa cargada:', encuestaCompleta);

        this.encuesta.set(encuestaCompleta);
        this.construirFormulario(encuestaCompleta);
      },
      error: (error) => {
        console.error('Error al cargar encuesta:', error);
        this.encuesta.set(null);
      }
    });
  }
  private normalizarPregunta(p: any): any {
    const tipoNombre = p.tipoPregunta?.nombre || p.tipo || p.nombreTipo;

    return {
      ...p,
      codPre: p.codPre || p.id,
      enunciado: p.enunciado || p.pregunta || p.texto || p.textoPre || 'Pregunta sin texto',
      codTipoPre: p.codTipoPre || p.tipoPregunta?.codTipoPre || this.obtenerCodigoTipo(tipoNombre),
      obligatoria: p.obligatoria === true || p.obligatoria === 1 ? 1 : 0,
      opciones: p.opciones ?? []
    };
  }

  private normalizarOpcion(o: any): any {
    return {
      ...o,
      codOpc: o.codOpc || o.codOpcResp,
      codOpcResp: o.codOpcResp || o.codOpc,
      opcion: o.opcion || o.texto || o.nombre || 'Opción',
      orden: o.orden ?? 1,
      valor: o.valor
    };
  }

  private obtenerCodigoTipo(tipo: string | null | undefined): number {
    if (!tipo) return TipoPregunta.ABIERTA;

    const tipoNormalizado = tipo.trim().toUpperCase();

    switch (tipoNormalizado) {
      case 'ABIERTA':
        return TipoPregunta.ABIERTA;

      case 'DICOTOMICA':
        return TipoPregunta.DICOTOMICA;

      case 'POLITOMICA':
        return TipoPregunta.POLITOMICA;

      case 'ELECCION_MULTIPLE':
        return TipoPregunta.ELECCION_MULTIPLE;

      case 'RANKING':
        return TipoPregunta.RANKING;

      case 'ESCALA_LIKERT':
        return TipoPregunta.ESCALA_LIKERT;

      case 'ESCALA_NUMERICA':
        return TipoPregunta.ESCALA_NUMERICA;

      case 'ESCALA_NOMINAL':
        return TipoPregunta.ESCALA_NOMINAL;

      case 'MIXTA':
        return TipoPregunta.MIXTA;

      default:
        return TipoPregunta.ABIERTA;
    }
  }



  construirFormulario(encuesta: any): void {
    const group: any = {};
    const preguntas = encuesta?.preguntas ?? [];

    preguntas.forEach((p: any) => {
      const validators = Number(p.obligatoria) === 1 ? [Validators.required] : [];
      const codPre = String(p.codPre);
      const tipo = Number(p.codTipoPre);

      if (tipo === TipoPregunta.ELECCION_MULTIPLE || tipo === TipoPregunta.RANKING) {
        const subGroup: any = {};

        (p.opciones ?? []).forEach((o: any) => {
          subGroup[o.opcion] = new FormControl(false);
        });

        group[codPre] = this.fb.group(subGroup);
      } else {
        group[codPre] = new FormControl('', validators);
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
