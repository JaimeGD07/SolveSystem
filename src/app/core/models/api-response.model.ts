/**
 * Estructura genérica de respuesta del backend Spring Boot.
 * IMPORTANTE: Ajustar estos campos para que coincidan EXACTAMENTE
 * con el wrapper real que use el equipo backend (ej. ApiResponseDTO.java).
 * Este es un placeholder razonable basado en patrones comunes de Spring Boot.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Estructura de respuesta paginada de Spring Data (Pageable/Page<T>).
 * Útil para listados de encuestas, usuarios, etc.
 */
export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
