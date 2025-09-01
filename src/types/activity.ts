export type Status = 'pendiente' | 'en_progreso' | 'programado' | 'en_ejecucion' | 'completado';

export interface Zona {
  id: number;
  zona: string;
  subzona: string;
  tienda: string;
  empresa: string;
}

export interface Activity {
  id: number;
  nombre: string;
  estado: Status;
  responsable: string;
  created_at: string;
  updated_at: string;
  zona_id: number | null;
  zona?: Zona; 
}

export interface CreateActivityInput {
  nombre: string;
  estado: Status;
  responsable: string;
  zona_id?: number | null;
  subzona?: string;
  tienda?: string;
  empresa?: string;
}


export const statusLabels: Record<Status, string> = {
  'pendiente': '📋 Pendiente',
  'en_progreso': '⏳ En progreso',
  'programado': '📅 Programado',
  'en_ejecucion': '🖥 En ejecución',
  'completado': '✅ Completado'
};

// lista de responsables predefinidos
export const responsables = [
  { value: '', label: 'Seleccione una persona', disabled: true}, 
  { value: 'Jeisson', label: 'Jeisson' },
  { value: 'Luis', label: 'Luis' },
  { value: 'Jesus', label: 'Jesus' },
  { value: 'Oscar', label: 'Oscar' },
  { value: 'Edgar', label: 'Edgar' },
  { value: 'Edurmis', label: 'Edurmis' },
  { value: 'Sin asignar', label: 'Sin asignar' } 
];
