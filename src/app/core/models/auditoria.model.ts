export interface AuditoriaLog {
  id: number;
  fechaHora: string; // Ej: '2026-06-21 14:30:00'
  usuario: string; // Email de quien hizo la acción
  accion: string; // Ej: 'LOGIN', 'CREAR_ENCUESTA', 'ELIMINAR_USUARIO'
  detalles: string;
  ip: string;
}
