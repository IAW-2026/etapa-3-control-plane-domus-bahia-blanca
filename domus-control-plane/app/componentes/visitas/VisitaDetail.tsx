import { RotateCcw, Trash2, X } from 'lucide-react'
import type { Visita } from '@/app/servicios/visitas.servicio'
import { formatDate } from './visitas.utils'

export function VisitaDetail({
  selected,
  isPending,
  onResolver,
  onCancelar,
  onBorrar,
}: {
  selected: Visita | null
  isPending: boolean
  onResolver: (estado: 'PENDIENTE_AGENTE' | 'CONFIRMADO') => void
  onCancelar: () => void
  onBorrar: () => void
}) {
  return (
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
              onClick={() => onResolver('PENDIENTE_AGENTE')}
              disabled={isPending || selected.estado === 'PENDIENTE_AGENTE'}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-domus-secondary px-4 py-3 text-sm font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Volver a pendiente
            </button>
            <button
              type="button"
              onClick={onCancelar}
              disabled={isPending || selected.estado === 'CANCELADO'}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-domus-terracota/40 px-4 py-3 text-sm font-semibold text-domus-terracota transition hover:bg-domus-terracota/10 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={onBorrar}
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
  )
}
