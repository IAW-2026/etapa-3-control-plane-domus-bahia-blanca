export type VisitasStatsData = {
  total: number
  pendientes: number
  confirmadas: number
  canceladas: number
}

export function VisitasStats({ stats }: { stats: VisitasStatsData }) {
  const items = [
    ['Total', stats.total],
    ['Pendientes', stats.pendientes],
    ['Confirmadas', stats.confirmadas],
    ['Canceladas', stats.canceladas],
  ] as const

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-domus-secondary bg-white p-4">
          <p className="text-xs text-domus-textSoft">{label}</p>
          <strong className="mt-1 block text-2xl text-domus-primary">{value}</strong>
        </div>
      ))}
    </section>
  )
}
