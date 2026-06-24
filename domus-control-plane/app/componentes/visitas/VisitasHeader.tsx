import { Search } from 'lucide-react'

export function VisitasHeader({ isPending, onBuscar }: { isPending: boolean; onBuscar: () => void }) {
  return (
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
        onClick={onBuscar}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-domus-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        {isPending ? 'Cargando...' : 'Buscar visitas'}
      </button>
    </header>
  )
}
