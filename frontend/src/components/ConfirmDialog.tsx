interface Props {
  title: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ title, busy, onCancel, onConfirm }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="bg-(--color-card) border border-(--color-ink) w-full max-w-sm p-5"
        style={{ boxShadow: 'var(--shadow-hard)' }}
      >
        <p className="text-sm text-(--color-ink)">
          excluir <span className="font-serif italic">&quot;{title}&quot;</span>? não dá pra
          desfazer.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-3 py-2 text-(--color-ink-soft) hover:text-(--color-ink)"
          >
            cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="text-sm font-medium px-4 py-2 bg-(--color-accent) text-(--color-card) border border-(--color-ink) disabled:opacity-50"
            style={{ boxShadow: busy ? 'none' : 'var(--shadow-hard-sm)' }}
          >
            {busy ? 'excluindo...' : 'excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
