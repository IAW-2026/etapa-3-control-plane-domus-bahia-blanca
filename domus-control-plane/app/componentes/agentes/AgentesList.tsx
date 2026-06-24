import { Building2, Mail, Phone } from 'lucide-react'
import type { Agente } from '@/app/servicios/agentes.servicio'
import { estadoLabels, PAGE_SIZE, statusClass } from './agentes.utils'

export function AgentesList({
  agentes,
  paginatedAgentes,
  selectedId,
  safePage,
  totalPages,
  pageStart,
  pageEnd,
  onSelect,
  onPageChange,
}: {
  agentes: Agente[]
  paginatedAgentes: Agente[]
  selectedId: string | null
  safePage: number
  totalPages: number
  pageStart: number
  pageEnd: number
  onSelect: (agente: Agente) => void
  onPageChange: (updater: (current: number) => number) => void
}) {
  return (
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
            onClick={() => onSelect(agente)}
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
              onClick={() => onPageChange((current) => Math.max(1, current - 1))}
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
              onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className="rounded-xl border border-domus-secondary px-3 py-2 font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
