'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  deleteAgenteAction,
  getAgentesAction,
  getAgentesInmobiliariasAction,
  updateAgenteAction,
  type InmobiliariaOption,
} from '@/app/acciones/agentes.acciones'
import type { Agente, EstadoAgente } from '@/app/servicios/agentes.servicio'
import { AgenteDetail } from '@/app/componentes/agentes/AgenteDetail'
import { AgentesFeedback } from '@/app/componentes/agentes/AgentesFeedback'
import { AgentesFilters } from '@/app/componentes/agentes/AgentesFilters'
import { AgentesHeader } from '@/app/componentes/agentes/AgentesHeader'
import { AgentesList } from '@/app/componentes/agentes/AgentesList'
import { AgentesStats } from '@/app/componentes/agentes/AgentesStats'
import {
  formFromAgente,
  PAGE_SIZE,
  selectedInmobiliariaName,
  type AgenteForm,
} from '@/app/componentes/agentes/agentes.utils'

export default function AgentePanel() {
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [inmobiliarias, setInmobiliarias] = useState<InmobiliariaOption[]>([])
  const [selectedInmobiliariaId, setSelectedInmobiliariaId] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoadingInmobiliarias, startInmobiliariasTransition] = useTransition()
  const [form, setForm] = useState<AgenteForm>({
    nombreCompleto: '',
    email: '',
    telefono: '',
    vendedorId: '',
    estado: 'PENDIENTE',
  })

  const selected = agentes.find((agente) => agente.id === selectedId) ?? null
  const totalPages = Math.max(1, Math.ceil(agentes.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedAgentes = agentes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const pageStart = agentes.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(safePage * PAGE_SIZE, agentes.length)

  const stats = useMemo(() => {
    return {
      total: agentes.length,
      pendientes: agentes.filter((agente) => agente.estado === 'PENDIENTE').length,
      aceptados: agentes.filter((agente) => agente.estado === 'ACEPTADO').length,
      rechazados: agentes.filter((agente) => agente.estado === 'RECHAZADO').length,
    }
  }, [agentes])

  useEffect(() => {
    startInmobiliariasTransition(async () => {
      const result = await getAgentesInmobiliariasAction()

      if (!result.success) {
        setError(result.error)
        return
      }

      setInmobiliarias(result.data)
    })
  }, [])

  useEffect(() => {
    loadAgentes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyLoadedAgentes(nextAgentes: Agente[]) {
    setAgentes(nextAgentes)
    setPage(1)
    setSelectedId(nextAgentes[0]?.id ?? null)
    if (nextAgentes[0]) setForm(formFromAgente(nextAgentes[0]))
  }

  function loadAgentes() {
    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await getAgentesAction({
        inmobiliariaId: selectedInmobiliariaId,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      applyLoadedAgentes(result.data)
    })
  }

  function clearFilter() {
    setSelectedInmobiliariaId('')
    setSelectedId(null)
    startTransition(async () => {
      const result = await getAgentesAction()
      if (result.success) applyLoadedAgentes(result.data)
    })
  }

  function selectAgente(agente: Agente) {
    setSelectedId(agente.id)
    setForm(formFromAgente(agente))
  }

  function replaceLocal(nextAgente: Agente) {
    setAgentes((current) =>
      current.map((agente) => (agente.id === nextAgente.id ? nextAgente : agente))
    )
  }

  function updateField<K extends keyof AgenteForm>(key: K, value: AgenteForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function saveSelected() {
    if (!selected) return

    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await updateAgenteAction(selected.id, {
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        telefono: form.telefono,
        vendedorId: form.vendedorId,
        nombreInmobiliaria: selectedInmobiliariaName(inmobiliarias, form.vendedorId) ?? undefined,
        estado: form.estado,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.data) {
        replaceLocal(result.data)
        setForm(formFromAgente(result.data))
      }
      setFeedback(result.message ?? 'Agente actualizado correctamente.')
    })
  }

  function changeEstado(estado: EstadoAgente) {
    if (!selected) return

    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await updateAgenteAction(selected.id, { estado })

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.data) {
        replaceLocal(result.data)
        setForm(formFromAgente(result.data))
      }
      setFeedback(result.message ?? 'Estado actualizado correctamente.')
    })
  }

  function deleteSelected() {
    if (!selected) return

    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await deleteAgenteAction(selected.id)

      if (!result.success) {
        setError(result.error)
        return
      }

      setAgentes((current) => current.filter((agente) => agente.id !== selected.id))
      setSelectedId(null)
      setFeedback(result.message ?? 'Agente eliminado correctamente.')
    })
  }

  return (
    <div className="space-y-6">
      <AgentesHeader isPending={isPending} onBuscar={loadAgentes} />

      <AgentesFilters
        inmobiliarias={inmobiliarias}
        selectedInmobiliariaId={selectedInmobiliariaId}
        isLoadingInmobiliarias={isLoadingInmobiliarias}
        isPending={isPending}
        onChangeInmobiliaria={setSelectedInmobiliariaId}
        onLimpiar={clearFilter}
      />

      <AgentesStats stats={stats} />
      <AgentesFeedback error={error} feedback={feedback} />

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <AgentesList
          agentes={agentes}
          paginatedAgentes={paginatedAgentes}
          selectedId={selectedId}
          safePage={safePage}
          totalPages={totalPages}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onSelect={selectAgente}
          onPageChange={setPage}
        />

        <AgenteDetail
          selected={selected}
          form={form}
          inmobiliarias={inmobiliarias}
          isPending={isPending}
          onUpdateField={updateField}
          onSave={saveSelected}
          onChangeEstado={changeEstado}
          onDelete={deleteSelected}
        />
      </div>
    </div>
  )
}
