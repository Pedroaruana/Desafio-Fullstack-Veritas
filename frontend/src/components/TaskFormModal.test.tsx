import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskFormModal } from './TaskFormModal'

describe('TaskFormModal', () => {
  it('bloqueia o envio e mostra erro quando o título está vazio', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <TaskFormModal task={null} defaultStatus="todo" submitting={false} onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    await user.click(screen.getByRole('button', { name: 'criar tarefa' }))

    expect(await screen.findByText('título é obrigatório')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia título e descrição já sem espaço sobrando nas pontas', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <TaskFormModal task={null} defaultStatus="todo" submitting={false} onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    await user.type(screen.getByLabelText('título'), '  revisar contrato  ')
    await user.type(screen.getByLabelText('descrição (opcional)'), '  ver cláusula 4  ')
    await user.click(screen.getByRole('button', { name: 'criar tarefa' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'revisar contrato',
      description: 'ver cláusula 4',
      status: 'todo',
    })
  })
})
