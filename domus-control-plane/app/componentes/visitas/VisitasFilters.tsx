import { Search } from 'lucide-react'
import type { InmobiliariaOption } from '@/app/acciones/visitas.acciones'
import type { EstadoTurno } from '@/app/servicios/visitas.servicio'
import { estadoLabels, ESTADOS } from './visitas.utils'

export function VisitasFilters({
  inmobiliarias,
  selectedInmobiliariaId,
  nombreComprador,
  agenteNombre,
  estado,
  isLoadingInmobiliarias,
  onChangeInmobiliaria,
  onChangeNombreComprador,
  onChangeAgenteNombre,
  onChangeEstado,
}: {
  inmobiliarias: InmobiliariaOption[]
  selectedInmobiliariaId: string
  nombreComprador: string
  agenteNombre: string
  estado: EstadoTurno | ''
  isLoadingInmobiliarias: boolean
  onChangeInmobiliaria: (value: string) => void
  onChangeNombreComprador: (value: string) => void
  onChangeAgenteNombre: (value: string) => void
  onChangeEstado: (value: EstadoTurno | '') => void
}) {
  return (
    <section className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_220px]">
      <label className="space-y-1.5 text-sm font-semibold text-domus-text">
        Inmobiliaria
        <select
          value={selectedInmobiliariaId}
          onChange={(event) => onChangeInmobiliaria(event.target.value)}
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
            onChange={(event) => onChangeNombreComprador(event.target.value)}
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
            onChange={(event) => onChangeAgenteNombre(event.target.value)}
            placeholder="Ej: Agente"
            className="w-full rounded-2xl border border-domus-secondary bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-domus-primary"
          />
        </div>
      </label>

      <label className="space-y-1.5 text-sm font-semibold text-domus-text">
        Estado
        <select
          value={estado}
          onChange={(event) => onChangeEstado(event.target.value as EstadoTurno | '')}
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
  )
}
