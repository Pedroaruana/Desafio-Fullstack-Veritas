import type { Task, TaskInput } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
  } catch {
    throw new ApiError('não deu pra falar com o servidor, confere se o backend tá rodando', 0)
  }

  if (!res.ok) {
    let message = `erro ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // resposta sem corpo json, mantém a mensagem genérica
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const tasksApi = {
  list: () => request<Task[]>('/tasks'),
  create: (input: TaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: TaskInput) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
