/**
 * PLACEHOLDER de ejemplo. Reemplazar/ajustar campo por campo
 * cuando se confirme el DTO real expuesto por Spring Boot / Oracle.
 */
export interface Encuesta {
  id: number;
  titulo: string;
  descripcion: string;
  fechaCreacion: string; // LocalDateTime de Java serializado como ISO string
  activa: boolean;
  idUsuarioCreador: number;
}

export interface CrearEncuestaRequest {
  titulo: string;
  descripcion: string;
  idUsuarioCreador: number;
}

export interface ActualizarEncuestaRequest {
  titulo?: string;
  descripcion?: string;
  activa?: boolean;
}
