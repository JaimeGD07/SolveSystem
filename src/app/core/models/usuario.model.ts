export interface Usuario {
  codUsu: number;
  primNom: string;
  primApell: string;
  email: string;
  rol: string; // Ej: 'administrador', 'encuestador', 'encuestado'
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'BLOQUEADO';
  ultimoAcceso: string; // Ej: 'nunca'
  intentos: number;
}
