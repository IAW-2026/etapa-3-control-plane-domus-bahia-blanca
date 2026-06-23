'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { CalendarClock, Filter, RotateCcw, Search, Trash2, X } from 'lucide-react'
import {
  borrarVisitaAction,
  cancelarVisitaAction,
  getInmobiliariasAction,
  getVisitasAction,
  resolverVisitaAction,
} from '@/app/acciones/visitas.acciones'
import type { InmobiliariaOption } from '@/app/acciones/visitas.acciones'
import type { EstadoTurno, Visita } from '@/app/servicios/visitas.servicio'

const ESTADOS: (EstadoTurno | '')[] = [
  '',
  'PENDIENTE_AGENTE',
  'PRE_ACEPTADO',
  'CONFIRMADO',
  'COMPLETADO',
  'CANCELADO',
]

const estadoLabels: Record<EstadoTurno, string> = {
  PENDIENTE_AGENTE: 'Pendiente agente',
  PRE_ACEPTADO: 'Pre aceptado',
  CONFIRMADO: 'Confirmado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

function formatDate(value: string | null) {
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

function matchesVisitFilters(
  visita: Visita,
  filters: { nombreComprador: string; agenteNombre: string }
) {
  return (
    matchesField(visita.nombreComprador ?? visita.compradorId, filters.nombreComprador) &&
    matchesField(visita.agenteNombre ?? visita.agenteId, filters.agenteNombre)
  )
}

function statusClass(estado: EstadoTurno) {
  if (estado === 'CONFIRMADO') return 'bg-domus-primary/10 text-domus-primary'
  if (estado === 'CANCELADO') return 'bg-domus-terracota/10 text-domus-terracota'
  if (estado === 'PRE_ACEPTADO') return 'bg-domus-brown/10 text-domus-brown'
  if (estado === 'COMPLETADO') return 'bg-domus-primarySoft/20 text-domus-primary'
  return 'bg-domus-secondary text-domus-text'
}

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
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-domus-primaryMid">Visitas</p>
          <h2 className="mt-1 text-3xl font-bold text-domus-primary">Administracion de turnos</h2>
          <p className="mt-2 max-w-2xl text-sm text-domus-textSoft">
            Consulta visitas de la Scheduling App y gestiona cambios de estado desde el panel global.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVisitas}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-domus-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isPending ? 'Cargando...' : 'Buscar visitas'}
        </button>
      </header>

      <section className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_220px]">
        <label className="space-y-1.5 text-sm font-semibold text-domus-text">
          Inmobiliaria
          <select
            value={selectedInmobiliariaId}
            onChange={(event) => setSelectedInmobiliariaId(event.target.value)}
            disabled={isLoadingInmobiliarias}
            className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary disabled:opacity-60"
          >
            <option value="">{isLoadingInmobiliarias ? 'Cargando inmobiliarias...' : 'Seleccionar inmobiliaria'}</option>
            {inmobiliarias.map((inmobiliaria) => (
              <option key={inmobiliaria.id} value={inmobiliaria.id}>
                {inmobiliaria.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm font-semibold text-domus-text">
          Nombre comprador
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-domus-textSoft" />
            <input
              value={nombreComprador}
              onChange={(event) => setNombreComprador(event.target.value)}
              placeholder="Ej: Bruno Diaz"
              className="w-full rounded-2xl border border-domus-secondary bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-domus-primary"
            />
          </div>
        </label>

        <label className="space-y-1.5 text-sm font-semibold text-domus-text">
          Agente
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-domus-textSoft" />
            <input
              value={agenteNombre}
              onChange={(event) => setAgenteNombre(event.target.value)}
              placeholder="Ej: Agente"
              className="w-full rounded-2xl border border-domus-secondary bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-domus-primary"
            />
          </div>
        </label>

        <label className="space-y-1.5 text-sm font-semibold text-domus-text">
          Estado
          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value as EstadoTurno | '')}
            className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
          >
            {ESTADOS.map((item) => (
              <option key={item || 'todos'} value={item}>
                {item ? estadoLabels[item] : 'Todos'}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-domus-secondary bg-white p-4">
          <p className="text-xs text-domus-textSoft">Total</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{stats.total}</strong>
        </div>
        <div className="rounded-2xl border border-domus-secondary bg-white p-4">
          <p className="text-xs text-domus-textSoft">Pendientes</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{stats.pendientes}</strong>
        </div>
        <div className="rounded-2xl border border-domus-secondary bg-white p-4">
          <p className="text-xs text-domus-textSoft">Confirmadas</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{stats.confirmadas}</strong>
        </div>
        <div className="rounded-2xl border border-domus-secondary bg-white p-4">
          <p className="text-xs text-domus-textSoft">Canceladas</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{stats.canceladas}</strong>
        </div>
      </section>

      {(error || feedback) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? 'border-domus-terracota/30 bg-domus-terracota/10 text-domus-terracota'
              : 'border-domus-primarySoft/40 bg-domus-primarySoft/20 text-domus-primary'
          }`}
        >
          {error ?? feedback}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-domus-secondary bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-domus-secondary px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-domus-primary">
              <Filter className="h-4 w-4" />
              Resultados
            </div>
            <p className="text-xs text-domus-textSoft">
              {filteredVisitas.length} de {visitas.length} visitas visibles
            </p>
          </div>

          <div className="max-h-[460px] overflow-auto">
            {visitas.length === 0 ? (
              <div className="grid min-h-[240px] place-items-center text-sm text-domus-textSoft">
                No hay visitas cargadas.
              </div>
            ) : filteredVisitas.length === 0 ? (
              <div className="grid min-h-[240px] place-items-center px-6 text-center text-sm text-domus-textSoft">
                No hay visitas que coincidan con la busqueda.
              </div>
            ) : (
              filteredVisitas.map((visita) => (
                <button
                  key={visita.id}
                  type="button"
                  onClick={() => setSelectedId(visita.id)}
                  className={`grid w-full gap-2 border-b border-domus-secondary px-4 py-4 text-left transition hover:bg-domus-secondary/50 ${
                    selectedId === visita.id ? 'bg-domus-secondary/70' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-domus-text">{visita.tituloPropiedad ?? visita.propiedadId}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(visita.estado)}`}>
                      {estadoLabels[visita.estado]}
                    </span>
                  </div>
                  <p className="text-sm text-domus-textSoft">{visita.direccion ?? 'Direccion no disponible'}</p>
                  <p className="text-xs font-medium text-domus-primaryMid">
                    {visita.nombreInmobiliaria ?? visita.vendedorId}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-domus-textSoft">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDate(visita.fechaHoraSolicitada)}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-domus-secondary bg-white p-5">
          {selected ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-domus-primaryMid">Detalle</p>
                <h3 className="mt-1 text-2xl font-bold text-domus-primary">{selected.tituloPropiedad ?? selected.id}</h3>
                <p className="mt-1 text-sm text-domus-textSoft">{selected.direccion ?? 'Sin direccion'}</p>
                <p className="mt-1 text-xs font-semibold text-domus-primaryMid">
                  {selected.nombreInmobiliaria ?? selected.vendedorId}
                </p>
              </div>

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-domus-textSoft">Comprador</dt>
                  <dd className="font-semibold text-domus-text">{selected.nombreComprador ?? selected.compradorId}</dd>
                </div>
                <div>
                  <dt className="text-domus-textSoft">Agente</dt>
                  <dd className="font-semibold text-domus-text">{selected.agenteNombre ?? 'Sin agente asignado'}</dd>
                </div>
                <div>
                  <dt className="text-domus-textSoft">Fecha solicitada</dt>
                  <dd className="font-semibold text-domus-text">{formatDate(selected.fechaHoraSolicitada)}</dd>
                </div>
                <div>
                  <dt className="text-domus-textSoft">Observaciones</dt>
                  <dd className="font-semibold text-domus-text">{selected.observaciones ?? 'Sin observaciones'}</dd>
                </div>
              </dl>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => resolver('PENDIENTE_AGENTE')}
                  disabled={isPending || selected.estado === 'PENDIENTE_AGENTE'}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-domus-secondary px-4 py-3 text-sm font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Volver a pendiente
                </button>
                <button
                  type="button"
                  onClick={cancelar}
                  disabled={isPending || selected.estado === 'CANCELADO'}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-domus-terracota/40 px-4 py-3 text-sm font-semibold text-domus-terracota transition hover:bg-domus-terracota/10 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={borrar}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-domus-terracota px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar 
                </button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[360px] place-items-center text-center text-sm text-domus-textSoft">
              Selecciona una visita para ver acciones.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
