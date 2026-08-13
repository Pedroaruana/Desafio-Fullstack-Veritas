export type Status = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  order: number
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description: string
  status: Status
}

export const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: 'A Fazer' },
  { status: 'in_progress', label: 'Em Progresso' },
  { status: 'done', label: 'Concluídas' },
]

export const STATUS_ACCENT: Record<Status, string> = {
  todo: 'var(--color-todo)',
  in_progress: 'var(--color-progress)',
  done: 'var(--color-done)',
}
