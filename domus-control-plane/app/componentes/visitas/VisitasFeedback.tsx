export function VisitasFeedback({ error, feedback }: { error: string | null; feedback: string | null }) {
  if (!error && !feedback) return null

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        error
          ? 'border-domus-terracota/30 bg-domus-terracota/10 text-domus-terracota'
          : 'border-domus-primarySoft/40 bg-domus-primarySoft/20 text-domus-primary'
      }`}
    >
      {error ?? feedback}
    </div>
  )
}
