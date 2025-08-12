export type Status = 'pendiente' | 'en_progreso' | 'programado' | 'en_ejecucion' | 'completado';

export interface Activity {
  id: number;
  nombre: string;
  estado: Status;
  responsable: string;
  created_at?: string;
}

export const statusLabels: Record<Status, string> = {
  'pendiente': '📋 Pendiente',
  'en_progreso': '⏳ En progreso',
  'programado': '📅 Programado',
  'en_ejecucion': '🖥 En ejecución',
  'completado': '✅ Completado'
};

export const statusOptions: Status[] = [
  'pendiente',
  'en_progreso',
  'programado',
  'en_ejecucion',
  'completado'
];

// Nueva lista de responsables predefinidos
export const responsables = [
  { value: '', label: 'Seleccione una persona', disabled: true}, // Nueva opción por defecto
  { value: 'Jeisson', label: 'Jeisson' },
  { value: 'Luis', label: 'Luis' },
  { value: 'Jesus', label: 'Jesus' },
  { value: 'Oscar', label: 'Oscar' },
  { value: 'Edgar', label: 'Edgar' },
  { value: 'Edulmin', label: 'Edulmin' },
  { value: '', label: '—' } // Opción para no asignar
];