'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Building2, Mail, Phone, Save, Search, Trash2, UserRound, X } from 'lucide-react'
import {
  deleteAgenteAction,
  getAgentesAction,
  getAgentesInmobiliariasAction,
  updateAgenteAction,
  type InmobiliariaOption,
} from '@/app/acciones/agentes.acciones'
import type { Agente, EstadoAgente } from '@/app/servicios/agentes.servicio'

const PAGE_SIZE = 5

const ESTADOS: EstadoAgente[] = ['PENDIENTE', 'ACEPTADO', 'RECHAZADO']

const estadoLabels: Record<EstadoAgente, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
}

function statusClass(estado: EstadoAgente) {
  if (estado === 'ACEPTADO') return 'bg-domus-primary/10 text-domus-primary'
  if (estado === 'RECHAZADO') return 'bg-domus-terracota/10 text-domus-terracota'
  return 'bg-domus-secondary text-domus-text'
}

function selectedInmobiliariaName(inmobiliarias: InmobiliariaOption[], id: string) {
  return inmobiliarias.find((item) => item.id === id)?.nombre ?? null
}

function formFromAgente(agente: Agente) {
  return {
    nombreCompleto: agente.nombreCompleto,
    email: agente.email,
    telefono: agente.telefono ?? '',
    vendedorId: agente.vendedorId ?? '',
    estado: agente.estado,
  }
}

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
  const [form, setForm] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    vendedorId: '',
    estado: 'PENDIENTE' as EstadoAgente,
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

      setAgentes(result.data)
      setPage(1)
      setSelectedId(result.data[0]?.id ?? null)
      if (result.data[0]) setForm(formFromAgente(result.data[0]))
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

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
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
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-domus-primaryMid">Agentes</p>
          <h2 className="mt-1 text-3xl font-bold text-domus-primary">Administracion de agentes</h2>
          <p className="mt-2 max-w-2xl text-sm text-domus-textSoft">
            Consulta agentes de la Scheduling App, filtra por inmobiliaria y gestiona sus datos desde el panel global.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAgentes}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-domus-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isPending ? 'Cargando...' : 'Buscar agentes'}
        </button>
      </header>

      <section className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <label className="space-y-1.5 text-sm font-semibold text-domus-text">
          Inmobiliaria
          <select
            value={selectedInmobiliariaId}
            onChange={(event) => setSelectedInmobiliariaId(event.target.value)}
            disabled={isLoadingInmobiliarias}
            className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary disabled:opacity-60"
          >
            <option value="">{isLoadingInmobiliarias ? 'Cargando inmobiliarias...' : 'Todas las inmobiliarias'}</option>
            {inmobiliarias.map((inmobiliaria) => (
              <option key={inmobiliaria.id} value={inmobiliaria.id}>
                {inmobiliaria.nombre}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            setSelectedInmobiliariaId('')
            setSelectedId(null)
            startTransition(async () => {
              const result = await getAgentesAction()
              if (result.success) {
                setAgentes(result.data)
                setPage(1)
                setSelectedId(result.data[0]?.id ?? null)
                if (result.data[0]) setForm(formFromAgente(result.data[0]))
              }
            })
          }}
          disabled={isPending}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-domus-secondary px-4 py-3 text-sm font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-60"
        >
          <X className="h-4 w-4" />
          Limpiar filtro
        </button>
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
          <p className="text-xs text-domus-textSoft">Aceptados</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{stats.aceptados}</strong>
        </div>
        <div className="rounded-2xl border border-domus-secondary bg-white p-4">
          <p className="text-xs text-domus-textSoft">Rechazados</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{stats.rechazados}</strong>
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

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="rounded-2xl border border-domus-secondary bg-white">
          <div className="border-b border-domus-secondary px-4 py-3">
            <h3 className="text-sm font-semibold text-domus-primary">Agentes encontrados</h3>
          </div>

          <div className="divide-y divide-domus-secondary">
            {agentes.length === 0 && (
              <div className="grid min-h-[260px] place-items-center text-center text-sm text-domus-textSoft">
                No hay agentes para mostrar.
              </div>
            )}

            {paginatedAgentes.map((agente) => (
              <button
                key={agente.id}
                type="button"
                onClick={() => selectAgente(agente)}
                className={`grid w-full gap-3 px-4 py-4 text-left transition hover:bg-domus-secondary/40 md:grid-cols-[1fr_auto] ${
                  selectedId === agente.id ? 'bg-domus-primarySoft/20' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-bold text-domus-primary">{agente.nombreCompleto}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(agente.estado)}`}>
                      {estadoLabels[agente.estado]}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-xs text-domus-textSoft">
                    <Building2 className="h-3.5 w-3.5" />
                    {agente.nombreInmobiliaria ?? agente.vendedorId ?? 'Sin inmobiliaria'}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-domus-textSoft">
                    <Mail className="h-3.5 w-3.5" />
                    {agente.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-domus-textSoft">
                  <Phone className="h-3.5 w-3.5" />
                  {agente.telefono ?? 'Sin telefono'}
                </div>
              </button>
            ))}
          </div>

          {agentes.length > PAGE_SIZE && (
            <div className="flex flex-col gap-3 border-t border-domus-secondary px-4 py-3 text-xs text-domus-textSoft sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {pageStart}-{pageEnd} de {agentes.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage === 1}
                  className="rounded-xl border border-domus-secondary px-3 py-2 font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="min-w-16 text-center font-semibold text-domus-text">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-xl border border-domus-secondary px-3 py-2 font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-domus-secondary bg-white p-4">
          {selected ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-domus-primaryMid">Detalle</p>
                <h3 className="mt-1 flex items-center gap-2 text-xl font-bold text-domus-primary">
                  <UserRound className="h-5 w-5" />
                  {selected.nombreCompleto}
                </h3>
                <p className="mt-1 text-sm text-domus-textSoft">{selected.email}</p>
              </div>

              <div className="grid gap-3">
                <label className="space-y-1.5 text-sm font-semibold text-domus-text">
                  Nombre
                  <input
                    value={form.nombreCompleto}
                    onChange={(event) => updateField('nombreCompleto', event.target.value)}
                    className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-domus-text">
                  Email
                  <input
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-domus-text">
                  Telefono
                  <input
                    value={form.telefono}
                    onChange={(event) => updateField('telefono', event.target.value)}
                    className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-domus-text">
                  Inmobiliaria
                  <select
                    value={form.vendedorId}
                    onChange={(event) => updateField('vendedorId', event.target.value)}
                    className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
                  >
                    {inmobiliarias.map((inmobiliaria) => (
                      <option key={inmobiliaria.id} value={inmobiliaria.id}>
                        {inmobiliaria.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-domus-text">
                  Estado
                  <select
                    value={form.estado}
                    onChange={(event) => updateField('estado', event.target.value as EstadoAgente)}
                    className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estadoLabels[estado]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={saveSelected}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-domus-primary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </button>

                <div className="grid gap-2 sm:grid-cols-3">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => changeEstado(estado)}
                      disabled={isPending || selected.estado === estado}
                      className="inline-flex items-center justify-center rounded-2xl border border-domus-secondary px-3 py-2 text-xs font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
                    >
                      {estadoLabels[estado]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={deleteSelected}
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
              Selecciona un agente para ver acciones.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
