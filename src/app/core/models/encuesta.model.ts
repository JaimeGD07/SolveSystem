// ---------------------------------------------------------
// DTOs DE LECTURA (GET)
// ---------------------------------------------------------

// DTO inferido para listar encuestas en el Dashboard/Mis Encuestas
export interface Encuesta {
  id: number;
  titulo: string;
  estado: 'Activa' | 'Borrador' | 'Cerrada';
  numeroRespuestas: number;
  fechaCreacion: string;
  numeroPreguntas: number;
  activa: boolean; // Necesario para el computed() de Claude en el servicio
}

// ---------------------------------------------------------
// DTOs DE ESCRITURA (POST / PUT) - Basados en el Backend
// ---------------------------------------------------------

// DTO para crear la encuesta principal
export interface CrearEncuestaRequest {
  titulo: string;
  descripcion: string;
}

// DTO para crear cada pregunta
export interface CrearPreguntaRequest {
  codEnc?: number; // Se llenará tras crear la encuesta
  codTipoPre: number;
  codCat: number;
  enunciado: string;
  obligatoria: number; // 1 o 0
}

// DTO para crear opciones de respuesta múltiple
export interface OpcionRespuestaRequest {
  codPre?: number; // Se llenará tras crear la pregunta
  opcion: string;
  valor?: number;
  valorMax?: number;
  valorMin?: number;
  orden: number;
}
