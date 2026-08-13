import { useEffect, useState } from 'react'
import { ApiError, tasksApi } from './api/tasks'
import { Board } from './components/Board'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ErrorBanner } from './components/ErrorBanner'
import { TaskFormModal } from './components/TaskFormModal'
import type { Status, Task, TaskInput } from './types'

type FormState = { task: Task | null; defaultStatus: Status }

function getMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'algo deu errado, tenta de novo'
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    setLoading(true)
    setError(null)
    try {
      setTasks(await tasksApi.list())
    } catch (err) {
      setError(getMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(input: TaskInput) {
    setSubmitting(true)
    try {
      if (formState?.task) {
        const updated = await tasksApi.update(formState.task.id, input)
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      } else {
        const created = await tasksApi.create(input)
        setTasks((prev) => [...prev, created])
      }
      setFormState(null)
    } catch (err) {
      setError(getMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMove(task: Task, status: Status) {
    const snapshot = tasks
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)))
    try {
      const updated = await tasksApi.update(task.id, {
        title: task.title,
        description: task.description,
        status,
      })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      setTasks(snapshot)
      setError(getMessage(err))
    }
  }

  async function handleReorder(draggedId: string, targetStatus: Status, orderedIds: string[]) {
    const draggedTask = tasks.find((t) => t.id === draggedId)
    if (!draggedTask) return

    const snapshot = tasks
    const crossColumn = draggedTask.status !== targetStatus

    setTasks((prev) => {
      const withStatus = prev.map((t) => (t.id === draggedId ? { ...t, status: targetStatus } : t))
      return withStatus.map((t) => {
        const idx = orderedIds.indexOf(t.id)
        return idx === -1 ? t : { ...t, order: idx }
      })
    })

    try {
      if (crossColumn) {
        await tasksApi.update(draggedId, {
          title: draggedTask.title,
          description: draggedTask.description,
          status: targetStatus,
        })
      }
      setTasks(await tasksApi.reorder(orderedIds))
    } catch (err) {
      setTasks(snapshot)
      setError(getMessage(err))
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      await tasksApi.remove(deleteTarget.id)
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(getMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-6 md:py-10">
      <header className="flex items-end justify-between pb-3 mb-6 border-b-2 border-(--color-ink)">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Kanban</h1>
          <p className="text-[11px] text-(--color-ink-soft) font-mono uppercase tracking-[0.15em] mt-1">
            {tasks.length} {tasks.length === 1 ? 'tarefa aberta' : 'tarefas abertas'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormState({ task: null, defaultStatus: 'todo' })}
          className="text-sm font-medium px-4 py-2 bg-(--color-accent) text-(--color-card) border border-(--color-ink) shadow-(--shadow-hard) hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-[transform,box-shadow]"
        >
          + nova tarefa
        </button>
      </header>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="buscar por título..."
          className="w-full max-w-xs bg-(--color-card) border border-(--color-line) px-3 py-1.5 text-sm outline-none focus:border-(--color-accent)"
        />
      </div>

      {loading ? (
        <div className="flex flex-col md:flex-row gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 h-64 border border-(--color-line) animate-pulse bg-(--color-card)/60"
            />
          ))}
        </div>
      ) : (
        <Board
          tasks={
            search.trim()
              ? tasks.filter((t) => t.title.toLowerCase().includes(search.trim().toLowerCase()))
              : tasks
          }
          onAdd={(status) => setFormState({ task: null, defaultStatus: status })}
          onEdit={(task) => setFormState({ task, defaultStatus: task.status })}
          onDelete={setDeleteTarget}
          onMove={handleMove}
          onReorder={handleReorder}
        />
      )}

      {formState && (
        <TaskFormModal
          task={formState.task}
          defaultStatus={formState.defaultStatus}
          submitting={submitting}
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={deleteTarget.title}
          busy={submitting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default App
