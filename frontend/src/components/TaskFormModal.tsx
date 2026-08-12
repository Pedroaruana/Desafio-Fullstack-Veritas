import { useEffect, useRef, useState } from 'react'
import type { Status, Task, TaskInput } from '../types'
import { COLUMNS } from '../types'

interface Props {
  task: Task | null
  defaultStatus: Status
  submitting: boolean
  onClose: () => void
  onSubmit: (input: TaskInput) => void
}

export function TaskFormModal({ task, defaultStatus, submitting, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus)
  const [touched, setTouched] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const titleError = touched && title.trim() === '' ? 'título é obrigatório' : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (title.trim() === '') return
    onSubmit({ title: title.trim(), description: description.trim(), status })
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-(--color-card) border border-(--color-ink) w-full max-w-md p-5"
        style={{ boxShadow: 'var(--shadow-hard)' }}
      >
        <h2 className="font-serif text-xl mb-4">{task ? 'editar tarefa' : 'nova tarefa'}</h2>

        <label
          className="block text-[11px] font-mono uppercase tracking-wide text-(--color-ink-soft) mb-1"
          htmlFor="task-title"
        >
          título
        </label>
        <input
          id="task-title"
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="ex: revisar proposta do cliente"
          className="w-full bg-(--color-paper) border border-(--color-line) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        />
        {titleError && <p className="text-xs text-(--color-accent) mt-1">{titleError}</p>}

        <label
          className="block text-[11px] font-mono uppercase tracking-wide text-(--color-ink-soft) mb-1 mt-3"
          htmlFor="task-desc"
        >
          descrição (opcional)
        </label>
        <textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="detalhes da tarefa"
          className="w-full bg-(--color-paper) border border-(--color-line) px-3 py-2 text-sm outline-none focus:border-(--color-accent) resize-none"
        />

        <label
          className="block text-[11px] font-mono uppercase tracking-wide text-(--color-ink-soft) mb-1 mt-3"
          htmlFor="task-status"
        >
          coluna
        </label>
        <select
          id="task-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="w-full bg-(--color-paper) border border-(--color-line) px-3 py-2 text-sm outline-none focus:border-(--color-accent)"
        >
          {COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-2 text-(--color-ink-soft) hover:text-(--color-ink)"
          >
            cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-medium px-4 py-2 bg-(--color-accent) text-(--color-card) border border-(--color-ink) disabled:opacity-50"
            style={{ boxShadow: submitting ? 'none' : 'var(--shadow-hard-sm)' }}
          >
            {submitting ? 'salvando...' : task ? 'salvar' : 'criar tarefa'}
          </button>
        </div>
      </form>
    </div>
  )
}
