interface Props {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 bg-(--color-accent-soft) border border-(--color-accent) text-(--color-accent) text-sm px-3 py-2 mb-6">
      <span>
        <span className="font-mono text-[10px] uppercase tracking-widest mr-2">erro</span>
        {message}
      </span>
      <button type="button" onClick={onDismiss} className="shrink-0 font-mono text-xs hover:opacity-70">
        fechar
      </button>
    </div>
  )
}
