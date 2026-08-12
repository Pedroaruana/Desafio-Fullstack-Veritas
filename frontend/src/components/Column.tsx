import type { Status, Task } from '../types'
import { STATUS_ACCENT } from '../types'
import { TaskCard } from './TaskCard'

interface Props {
  status: Status
  label: string
  tasks: Task[]
  draggingId: string | null
  isDropTarget: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: (id: string) => void
  onAdd: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function Column({
  status,
  label,
  tasks,
  draggingId,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={(e) => {
        const next = e.relatedTarget as Node | null
        if (next && e.currentTarget.contains(next)) return
        onDragLeave()
      }}
      onDrop={(e) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain')
        if (id) onDrop(id)
      }}
      className="flex flex-col min-w-0 flex-1 border transition-colors"
      style={{
        borderColor: isDropTarget ? STATUS_ACCENT[status] : 'var(--color-line)',
        borderStyle: isDropTarget ? 'dashed' : 'solid',
        background: isDropTarget ? 'var(--color-accent-soft)' : 'transparent',
      }}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-base text-(--color-ink)">{label}</h2>
          <span
            className="text-[11px] font-mono text-(--color-ink-soft) border border-(--color-line) rounded-full px-1.5 leading-[1.4]"
          >
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`adicionar tarefa em ${label}`}
          className="text-(--color-ink-soft) hover:text-(--color-accent) text-lg leading-none px-1"
        >
          +
        </button>
      </div>
      <div className="h-[3px]" style={{ background: STATUS_ACCENT[status] }} />

      <div className="flex-1 p-3 space-y-3 min-h-24 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="text-xs text-(--color-ink-soft) text-center py-8 border border-dashed border-(--color-line)">
            sem tarefas aqui
          </p>
        )}
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            index={i}
            dragging={draggingId === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
          />
        ))}
      </div>
    </div>
  )
}
