import { CalendarClock, Filter } from 'lucide-react'
import type { Visita } from '@/app/servicios/visitas.servicio'
import { estadoLabels, formatDate, statusClass } from './visitas.utils'

export function VisitasList({
  visitas,
  filteredVisitas,
  selectedId,
  onSelect,
}: {
  visitas: Visita[]
  filteredVisitas: Visita[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
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
              onClick={() => onSelect(visita.id)}
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
  )
}
