'use server'

import {
  deleteAgente,
  fetchAgentes,
  updateAgente,
  type Agente,
  type AgentesFilters,
  type AgenteUpdateInput,
} from '@/app/servicios/agentes.servicio'
import { getVendedores } from '@/app/servicios/vendedor.servicio'

type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

export type InmobiliariaOption = {
  id: string
  nombre: string
}

export async function getAgentesAction(filters: AgentesFilters = {}): Promise<ActionResult<Agente[]>> {
  try {
    const agentes = await fetchAgentes(filters)
    return { success: true, data: agentes }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudieron obtener los agentes',
    }
  }
}

export async function getAgentesInmobiliariasAction(): Promise<ActionResult<InmobiliariaOption[]>> {
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

export async function updateAgenteAction(
  id: string,
  data: AgenteUpdateInput
): Promise<ActionResult<Agente | null>> {
  try {
    const agente = await updateAgente(id, data)
    return { success: true, data: agente, message: 'Agente actualizado correctamente.' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo actualizar el agente',
    }
  }
}

export async function deleteAgenteAction(id: string): Promise<ActionResult<null>> {
  try {
    await deleteAgente(id)
    return { success: true, data: null, message: 'Agente eliminado correctamente.' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo eliminar el agente',
    }
  }
}
