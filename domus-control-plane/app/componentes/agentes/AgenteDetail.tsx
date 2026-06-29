import { Save, Trash2, UserRound } from 'lucide-react'
import type { InmobiliariaOption } from '@/app/acciones/agentes.acciones'
import type { Agente, EstadoAgente } from '@/app/servicios/agentes.servicio'
import { estadoLabels, ESTADOS, type AgenteForm } from './agentes.utils'

export function AgenteDetail({
  selected,
  form,
  inmobiliarias,
  isPending,
  onUpdateField,
  onSave,
  onChangeEstado,
  onDelete,
}: {
  selected: Agente | null
  form: AgenteForm
  inmobiliarias: InmobiliariaOption[]
  isPending: boolean
  onUpdateField: <K extends keyof AgenteForm>(key: K, value: AgenteForm[K]) => void
  onSave: () => void
  onChangeEstado: (estado: EstadoAgente) => void
  onDelete: () => void
}) {
  return (
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
                onChange={(event) => onUpdateField('nombreCompleto', event.target.value)}
                className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
              />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-domus-text">
              Email
              <input
                value={form.email}
                onChange={(event) => onUpdateField('email', event.target.value)}
                className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
              />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-domus-text">
              Telefono
              <input
                value={form.telefono}
                onChange={(event) => onUpdateField('telefono', event.target.value)}
                className="w-full rounded-2xl border border-domus-secondary bg-white px-4 py-3 text-sm outline-none transition focus:border-domus-primary"
              />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-domus-text">
              Inmobiliaria
              <select
                value={form.vendedorId}
                onChange={(event) => onUpdateField('vendedorId', event.target.value)}
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
                onChange={(event) => onUpdateField('estado', event.target.value as EstadoAgente)}
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
              onClick={onSave}
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
                  onClick={() => onChangeEstado(estado)}
                  disabled={isPending || selected.estado === estado}
                  className="inline-flex items-center justify-center rounded-2xl border border-domus-secondary px-3 py-2 text-xs font-semibold text-domus-primary transition hover:bg-domus-secondary disabled:opacity-50"
                >
                  {estadoLabels[estado]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onDelete}
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
  )
}
