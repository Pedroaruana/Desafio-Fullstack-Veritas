import { useState } from 'react'
import type { Status, Task } from '../types'
import { COLUMNS } from '../types'
import { Column } from './Column'

interface Props {
  tasks: Task[]
  onAdd: (status: Status) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onMove: (task: Task, status: Status) => void
  onReorder: (draggedId: string, targetStatus: Status, orderedIds: string[]) => void
}

export function Board({ tasks, onAdd, onEdit, onDelete, onMove, onReorder }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<Status | null>(null)

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks
          .filter((t) => t.status === col.status)
          .sort((a, b) => a.order - b.order)

        return (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={columnTasks}
            draggingId={draggingId}
            isDropTarget={dropTarget === col.status}
            onDragStart={setDraggingId}
            onDragEnd={() => {
              setDraggingId(null)
              setDropTarget(null)
            }}
            onDragEnter={() => setDropTarget(col.status)}
            onDragLeave={() => setDropTarget((cur) => (cur === col.status ? null : cur))}
            onDrop={(id) => {
              const task = tasks.find((t) => t.id === id)
              if (task && task.status !== col.status) onMove(task, col.status)
              setDraggingId(null)
              setDropTarget(null)
            }}
            onReorderBefore={(draggedId, beforeId) => {
              const withoutDragged = columnTasks.filter((t) => t.id !== draggedId)
              const insertIndex = withoutDragged.findIndex((t) => t.id === beforeId)
              const orderedIds = withoutDragged.map((t) => t.id)
              orderedIds.splice(insertIndex === -1 ? orderedIds.length : insertIndex, 0, draggedId)
              onReorder(draggedId, col.status, orderedIds)
              setDraggingId(null)
              setDropTarget(null)
            }}
            onAdd={() => onAdd(col.status)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}
