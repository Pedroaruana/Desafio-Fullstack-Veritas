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
}

export function Board({ tasks, onAdd, onEdit, onDelete, onMove }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<Status | null>(null)

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {COLUMNS.map((col) => (
        <Column
          key={col.status}
          status={col.status}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.status)}
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
          onAdd={() => onAdd(col.status)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
