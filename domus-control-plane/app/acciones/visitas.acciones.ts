'use server'

import {
  borrarVisitaMock,
  cancelarVisita,
  fetchVisitas,
  resolverVisita,
  type EstadoTurno,
  type Visita,
  type VisitasFilters,
} from '@/app/servicios/visitas.servicio'
import { getVendedores } from '@/app/servicios/vendedor.servicio'

type ActionResult<T> =
  | { success: true; data: T; mocked?: boolean; message?: string }
  | { success: false; error: string }

export type InmobiliariaOption = {
  id: string
  nombre: string
}

export async function getInmobiliariasAction(): Promise<ActionResult<InmobiliariaOption[]>> {
  try {
    const vendedores = await getVendedores()
    return {
      success: true,
      data: vendedores.map((vendedor) => ({
        id: vendedor.id,
        nombre: vendedor.agencyName ?? vendedor.fullName ?? vendedor.email ?? vendedor.id,
      })),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudieron obtener las inmobiliarias',
    }
  }
}
export async function getVisitasAction(filters: VisitasFilters): Promise<ActionResult<Visita[]>> {
  try {
    const result = await fetchVisitas(filters)
    return { success: true, data: result.visitas, mocked: result.mocked }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudieron obtener las visitas',
    }
  }
}

export async function resolverVisitaAction(data: {
  inmobiliariaId: string
  turnoId: string
  estado: 'PENDIENTE_AGENTE' | 'CONFIRMADO'
}): Promise<ActionResult<Visita | null>> {
  try {
    const visita = await resolverVisita(data.inmobiliariaId, data.turnoId, data.estado)
    return { success: true, data: visita }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo modificar la visita',
    }
  }
}

export async function cancelarVisitaAction(data: {
  compradorId: string
  turnoId: string
}): Promise<ActionResult<null>> {
  try {
    await cancelarVisita(data.compradorId, data.turnoId)
    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo cancelar la visita',
    }
  }
}

export async function borrarVisitaAction(turnoId: string): Promise<ActionResult<null>> {
  await borrarVisitaMock(turnoId)
  return {
    success: true,
    data: null,
    mocked: true,
    message: 'Borrado mockeado: falta implementar DELETE en Scheduling App.',
  }
}

export async function actualizarEstadoMockAction(data: {
  turnoId: string
  estado: EstadoTurno
}): Promise<ActionResult<{ turnoId: string; estado: EstadoTurno }>> {
  return {
    success: true,
    data,
    mocked: true,
    message: 'Actualizacion mockeada: falta endpoint general de update en Scheduling App.',
  }
}