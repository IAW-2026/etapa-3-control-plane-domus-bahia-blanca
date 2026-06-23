'use server'

import {
  borrarVisita,
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
  turnoId: string
  estado: EstadoTurno
}): Promise<ActionResult<Visita | null>> {
  try {
    const visita = await resolverVisita(data.turnoId, data.estado)
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
  try {
    await borrarVisita(turnoId)
    return {
      success: true,
      data: null,
      message: 'Turno eliminado correctamente.',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo eliminar la visita',
    }
  }
}
