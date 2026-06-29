import type { EstadoTurno, Visita } from '@/app/servicios/visitas.servicio'

export const ESTADOS: (EstadoTurno | '')[] = [
  '',
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'COMPLETADO',
  'CANCELADO',
]

export const estadoLabels: Record<EstadoTurno, string> = {
  PENDIENTE_AGENTE: 'Pendiente agente',
  PRE_ACEPTADO: 'Pre aceptado',
  CONFIRMADO: 'Confirmado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

export function formatDate(value: string | null) {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesField(value: string | null | undefined, search: string) {
  const tokens = normalizeSearchText(search).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true

  const searchable = normalizeSearchText(value)
  return tokens.every((token) => searchable.includes(token))
}

export function matchesVisitFilters(
  visita: Visita,
  filters: { nombreComprador: string; agenteNombre: string }
) {
  return (
    matchesField(visita.nombreComprador ?? visita.compradorId, filters.nombreComprador) &&
    matchesField(visita.agenteNombre ?? visita.agenteId, filters.agenteNombre)
  )
}

export function statusClass(estado: EstadoTurno) {
  if (estado === 'CONFIRMADO') return 'bg-domus-primary/10 text-domus-primary'
  if (estado === 'CANCELADO') return 'bg-domus-terracota/10 text-domus-terracota'
  if (estado === 'PRE_ACEPTADO') return 'bg-domus-brown/10 text-domus-brown'
  if (estado === 'COMPLETADO') return 'bg-domus-primarySoft/20 text-domus-primary'
  return 'bg-domus-secondary text-domus-text'
}
