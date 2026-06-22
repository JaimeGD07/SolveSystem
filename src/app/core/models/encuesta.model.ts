// ---------------------------------------------------------
// ENUMS DE DOMINIO (Mapeo exacto de la tabla TIPO_PREGUNTA)
// ---------------------------------------------------------
export enum TipoPregunta {
  ABIERTA = 1,
  DICOTOMICA = 2,
  POLITOMICA = 3,
  ELECCION_MULTIPLE = 4,
  RANKING = 5,
  ESCALA_LIKERT = 6,
  ESCALA_NUMERICA = 7
}

// ---------------------------------------------------------
// DTOs DE LECTURA (GET) - Para el Dashboard
// ---------------------------------------------------------
export interface Encuesta {
  id: number;              // Mapea a COD_ENC
  titulo: string;          // Mapea a TITULO
  descripcion?: string;    // Mapea a DESCRIPCION
  numeroPreguntas: number; // Mapea a NUM_PREGUNTAS
  fechaCreacion: string;   // Mapea a FECH_CREA
  numeroRespuestas?: number; // Campo calculado opcional (COUNT de respuestas)
}

// ---------------------------------------------------------
// DTOs DE ESCRITURA (POST / PUT) - Creación
// ---------------------------------------------------------
export interface CrearEncuestaRequest {
  titulo: string;
  descripcion: string;
}

export interface CrearEncuestaCompletaRequest extends CrearEncuestaRequest {
  preguntas: CrearPreguntaRequest[];
}

export interface CrearPreguntaRequest {
  codEnc?: number; 
  codTipoPre: TipoPregunta;
  codCat?: number; // Opcional, ya que las abiertas no tienen catálogo
  enunciado: string;
  obligatoria: number; // 1 (Sí) o 0 (No)
  opciones?: OpcionRespuestaRequest[];
}

export interface OpcionRespuestaRequest {
  codPre?: number; 
  opcion: string;
  valor?: number;
  valorMax?: number;
  valorMin?: number;
  orden?: number;
}

// ---------------------------------------------------------
// DTOs DE RESPUESTA (POST) - Llenado de Encuestas
// ---------------------------------------------------------
export interface RespuestaPreguntaRequest {
  codPre: number;
  textoRespuesta?: string;      
  valorNumerico?: number;       
  opcionesSeleccionadasIds?: number[]; // Arreglo de COD_OPC_RESP
}

export interface ResponderEncuestaRequest {
  codEnc: number;
  respuestas: RespuestaPreguntaRequest[];
}

// ---------------------------------------------------------
// DTOs DE ANALÍTICA (GET) - Visualización
// ---------------------------------------------------------
export interface OpcionFrecuenciaDTO {
  opcion: string;
  frecuencia: number;
  porcentaje: number;
}

export interface PreguntaMetricasDTO {
  codPre: number;
  enunciado: string;
  codTipoPre: TipoPregunta;
  totalRespuestas: number;
  promedio?: number;                 
  frecuencias?: OpcionFrecuenciaDTO[]; 
  respuestasAbiertas?: string[];       
}

export interface AnaliticaEncuestaResponse {
  codEnc: number;
  titulo: string;
  descripcion: string;
  totalParticipantes: number;
  metricasPreguntas: PreguntaMetricasDTO[];
}
