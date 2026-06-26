import type { InmobiliariaOption } from '@/app/acciones/agentes.acciones'
import type { Agente, EstadoAgente } from '@/app/servicios/agentes.servicio'

export const PAGE_SIZE = 5

export const ESTADOS: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO', 'RECHAZADO']

export const estadoLabels: Record<EstadoAgente, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
}

export type AgenteForm = {
  nombreCompleto: string
  email: string
  telefono: string
  vendedorId: string
  estado: EstadoAgente
}

export function statusClass(estado: EstadoAgente) {
  if (estado === 'ACEPTADO') return 'bg-domus-primary/10 text-domus-primary'
  if (estado === 'RECHAZADO') return 'bg-domus-terracota/10 text-domus-terracota'
  return 'bg-domus-secondary text-domus-text'
}

export function selectedInmobiliariaName(inmobiliarias: InmobiliariaOption[], id: string) {
  return inmobiliarias.find((item) => item.id === id)?.nombre ?? null
}

export function formFromAgente(agente: Agente): AgenteForm {
  return {
    nombreCompleto: agente.nombreCompleto,
    email: agente.email,
    telefono: agente.telefono ?? '',
    vendedorId: agente.vendedorId ?? '',
    estado: agente.estado,
  }
}
