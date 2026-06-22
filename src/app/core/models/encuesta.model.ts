export enum TipoPregunta {
  ABIERTA = 1,
  DICOTOMICA = 2,
  POLITOMICA = 3,
  ELECCION_MULTIPLE = 4,
  RANKING = 5,
  ESCALA_LIKERT = 6,
  ESCALA_NUMERICA = 7,
  ESCALA_NOMINAL = 8,
  MIXTA = 9
}

export interface Encuesta {
  id?: number;
  codEnc: number;
  titulo: string;
  descripcion?: string;
  numPreguntas?: number;
  num_preguntas?: number;
  numeroPreguntas?: number;
  fechCrea?: string;
  fech_crea?: string;
  fechaCreacion?: string;
  numeroRespuestas?: number;
  preguntas?: Pregunta[];
}

export interface Pregunta {
  codPre: number;
  codEnc?: number;
  enunciado: string;
  obligatoria: number;
  codTipoPre: TipoPregunta;
  tipoPregunta?: any;
  codCat?: number | null;
  opciones: OpcionRespuesta[];
}

export interface OpcionRespuesta {
  codOpcResp: number;
  codOpc?: number;
  codPre?: number;
  opcion: string;
  valor?: number;
  valorMin?: number;
  valorMax?: number;
  orden?: number;
}

export interface CrearEncuestaRequest {
  titulo: string;
  descripcion?: string;
  preguntas?: any[];
}

export interface RespuestaPreguntaRequest {
  codPre: number;
  codOpcResp?: number | null;
  codDetCat?: number | null;
  textoResp?: string | null;
  valorResp?: number | null;
  posicionRank?: number | null;
  opcionesSeleccionadasIds?: number[];
  textoRespuesta?: string;
  valorNumerico?: number;
}

export interface ResponderEncuestaRequest {
  codUsu: number;
  codEnc: number;
  respuestas: RespuestaPreguntaRequest[];
}

export interface FrecuenciaRespuesta {
  opcion: string;
  frecuencia: number;
  porcentaje: number;
}

export interface MetricaPregunta {
  codPre: number;
  enunciado: string;
  codTipoPre: TipoPregunta;
  totalRespuestas: number;
  frecuencias?: FrecuenciaRespuesta[];
  promedio?: number;
  respuestasAbiertas?: string[];
}

export interface AnaliticaEncuestaResponse {
  codEnc: number;
  titulo: string;
  descripcion?: string;
  totalParticipantes: number;
  metricasPreguntas: MetricaPregunta[];
}
