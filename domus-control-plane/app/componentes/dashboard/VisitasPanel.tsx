'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  borrarVisitaAction,
  cancelarVisitaAction,
  getInmobiliariasAction,
  getVisitasAction,
  resolverVisitaAction,
} from '@/app/acciones/visitas.acciones'
import type { InmobiliariaOption } from '@/app/acciones/visitas.acciones'
import type { EstadoTurno, Visita } from '@/app/servicios/visitas.servicio'
import { VisitaDetail } from '@/app/componentes/visitas/VisitaDetail'
import { VisitasFeedback } from '@/app/componentes/visitas/VisitasFeedback'
import { VisitasFilters } from '@/app/componentes/visitas/VisitasFilters'
import { VisitasHeader } from '@/app/componentes/visitas/VisitasHeader'
import { VisitasList } from '@/app/componentes/visitas/VisitasList'
import { VisitasStats } from '@/app/componentes/visitas/VisitasStats'
import { matchesVisitFilters } from '@/app/componentes/visitas/visitas.utils'

export default function VisitasPanel() {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [inmobiliarias, setInmobiliarias] = useState<InmobiliariaOption[]>([])
  const [selectedInmobiliariaId, setSelectedInmobiliariaId] = useState('')
  const [nombreComprador, setNombreComprador] = useState('')
  const [agenteNombre, setAgenteNombre] = useState('')
  const [estado, setEstado] = useState<EstadoTurno | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoadingInmobiliarias, startInmobiliariasTransition] = useTransition()

  const filteredVisitas = useMemo(() => {
    return visitas.filter((visita) =>
      matchesVisitFilters(visita, { nombreComprador, agenteNombre })
    )
  }, [agenteNombre, nombreComprador, visitas])

  const selected = visitas.find((visita) => visita.id === selectedId) ?? null

  const stats = useMemo(() => {
    return {
      total: filteredVisitas.length,
      pendientes: filteredVisitas.filter((visita) => visita.estado === 'PENDIENTE_AGENTE').length,
      confirmadas: filteredVisitas.filter((visita) => visita.estado === 'CONFIRMADO').length,
      canceladas: filteredVisitas.filter((visita) => visita.estado === 'CANCELADO').length,
    }
  }, [filteredVisitas])

  useEffect(() => {
    startInmobiliariasTransition(async () => {
      const result = await getInmobiliariasAction()

      if (!result.success) {
        setError(result.error)
        return
      }

      setInmobiliarias(result.data)
    })
  }, [])

  function loadVisitas() {
    startTransition(async () => {
      setError(null)
      setFeedback(null)

      if (!selectedInmobiliariaId && !nombreComprador.trim() && !agenteNombre.trim() && !estado) {
        setError('Selecciona o ingresa al menos un filtro para buscar visitas.')
        setVisitas([])
        setSelectedId(null)
        return
      }

      const result = await getVisitasAction({
        inmobiliariaId: selectedInmobiliariaId,
        nombreComprador,
        agenteNombre,
        estado,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setVisitas(result.data)
      setSelectedId(result.data[0]?.id ?? null)
      setFeedback(result.mocked ? 'Mostrando visitas mockeadas hasta configurar filtros o endpoints.' : null)
    })
  }

  function updateLocal(turnoId: string, nextEstado: EstadoTurno) {
    setVisitas((current) =>
      current.map((visita) => (visita.id === turnoId ? { ...visita, estado: nextEstado } : visita))
    )
  }

  function replaceLocal(nextVisita: Visita) {
    setVisitas((current) =>
      current.map((visita) => (visita.id === nextVisita.id ? nextVisita : visita))
    )
  }

  function resolver(estadoDestino: 'PENDIENTE_AGENTE' | 'CONFIRMADO') {
    if (!selected) return

    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await resolverVisitaAction({
        turnoId: selected.id,
        estado: estadoDestino,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.data) {
        replaceLocal(result.data)
      } else {
        updateLocal(selected.id, estadoDestino)
      }
      setFeedback('Visita actualizada correctamente.')
    })
  }

  function cancelar() {
    if (!selected) return

    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await cancelarVisitaAction({ compradorId: selected.compradorId, turnoId: selected.id })

      if (!result.success) {
        setError(result.error)
        return
      }

      updateLocal(selected.id, 'CANCELADO')
      setFeedback('Visita cancelada correctamente.')
    })
  }

  function borrar() {
    if (!selected) return

    startTransition(async () => {
      setError(null)
      setFeedback(null)

      const result = await borrarVisitaAction(selected.id)

      if (!result.success) {
        setError(result.error)
        return
      }

      setVisitas((current) => current.filter((visita) => visita.id !== selected.id))
      setSelectedId(null)
      setFeedback(result.message ?? 'Visita eliminada.')
    })
  }

  return (
    <div className="space-y-6">
      <VisitasHeader isPending={isPending} onBuscar={loadVisitas} />

      <VisitasFilters
        inmobiliarias={inmobiliarias}
        selectedInmobiliariaId={selectedInmobiliariaId}
        nombreComprador={nombreComprador}
        agenteNombre={agenteNombre}
        estado={estado}
        isLoadingInmobiliarias={isLoadingInmobiliarias}
        onChangeInmobiliaria={setSelectedInmobiliariaId}
        onChangeNombreComprador={setNombreComprador}
        onChangeAgenteNombre={setAgenteNombre}
        onChangeEstado={setEstado}
      />

      <VisitasStats stats={stats} />
      <VisitasFeedback error={error} feedback={feedback} />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <VisitasList
          visitas={visitas}
          filteredVisitas={filteredVisitas}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <VisitaDetail
          selected={selected}
          isPending={isPending}
          onResolver={resolver}
          onCancelar={cancelar}
          onBorrar={borrar}
        />
      </div>
    </div>
  )
}

