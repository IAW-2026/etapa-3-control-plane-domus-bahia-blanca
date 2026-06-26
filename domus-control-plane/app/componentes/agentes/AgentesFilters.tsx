import { X } from 'lucide-react'
import type { InmobiliariaOption } from '@/app/acciones/agentes.acciones'

export function AgentesFilters({
  inmobiliarias,
  selectedInmobiliariaId,
  isLoadingInmobiliarias,
  isPending,
  onChangeInmobiliaria,
  onLimpiar,
}: {
  inmobiliarias: InmobiliariaOption[]
  selectedInmobiliariaId: string
  isLoadingInmobiliarias: boolean
  isPending: boolean
  onChangeInmobiliaria: (value: string) => void
  onLimpiar: () => void
}) {
  return (
    <section className="grid gap-3 lg:grid-cols-[1fr_220px]">
      <label className="space-y-1.5 text-sm font-semibold text-domus-text">
        Inmobiliaria
        <select
          value={selectedInmobiliariaId}
          onChange={(event) => onChangeInmobiliaria(event.target.value)}
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
        onClick={onLimpiar}
        disabled={isPending}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-domus-secondary px-4 py-3 text-sm font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-60"
      >
        <X className="h-4 w-4" />
        Limpiar filtro
      </button>
    </section>
  )
}
