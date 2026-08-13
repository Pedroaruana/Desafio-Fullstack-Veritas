import { useState } from 'react'
import type { Task } from '../types'
import { STATUS_ACCENT } from '../types'
import { formatRelative } from '../utils/time'

interface Props {
  task: Task
  index: number
  dragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDropBefore: (draggedId: string) => void
  onEdit: () => void
  onDelete: () => void
}

const TILTS = [-0.6, 0.5, -0.3, 0.7, -0.5]

export function TaskCard({
  task,
  index,
  dragging,
  onDragStart,
  onDragEnd,
  onDropBefore,
  onEdit,
  onDelete,
}: Props) {
  const [isDropTarget, setIsDropTarget] = useState(false)
  const tilt = TILTS[index % TILTS.length]

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onDragEnter={(e) => {
        e.stopPropagation()
        setIsDropTarget(true)
      }}
      onDragLeave={(e) => {
        e.stopPropagation()
        setIsDropTarget(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDropTarget(false)
        const id = e.dataTransfer.getData('text/plain')
        if (id && id !== task.id) onDropBefore(id)
      }}
      className="group bg-(--color-card) border border-(--color-ink) p-3 cursor-grab active:cursor-grabbing transition-[transform,opacity,box-shadow] hover:-translate-y-0.5"
      style={{
        borderLeft: `4px solid ${STATUS_ACCENT[task.status]}`,
        borderTop: isDropTarget ? `2px dashed ${STATUS_ACCENT[task.status]}` : undefined,
        opacity: dragging ? 0.35 : 1,
        transform: dragging ? 'none' : `rotate(${tilt}deg)`,
        boxShadow: 'var(--shadow-hard-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-[15px] leading-snug text-(--color-ink) break-words">
          {task.title}
        </h3>
        <div className="hidden group-hover:flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label="editar tarefa"
            className="text-[11px] font-mono uppercase text-(--color-ink-soft) hover:text-(--color-accent)"
          >
            editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="excluir tarefa"
            className="text-[11px] font-mono uppercase text-(--color-ink-soft) hover:text-(--color-accent)"
          >
            excluir
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1.5 text-xs text-(--color-ink-soft) leading-relaxed line-clamp-3">
          {task.description}
        </p>
      )}

      <div className="mt-2 text-[10px] text-(--color-ink-soft) font-mono uppercase tracking-wide">
        {formatRelative(task.updatedAt)}
      </div>
    </div>
  )
}
