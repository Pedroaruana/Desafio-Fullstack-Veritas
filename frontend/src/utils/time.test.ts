import { describe, expect, it } from 'vitest'
import { formatRelative } from './time'

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

describe('formatRelative', () => {
  it('mostra "agora" pra algo que acabou de acontecer', () => {
    expect(formatRelative(isoMinutesAgo(0))).toBe('agora')
  })

  it('mostra minutos quando é menos de uma hora', () => {
    expect(formatRelative(isoMinutesAgo(15))).toBe('há 15 min')
  })

  it('mostra horas quando é menos de um dia', () => {
    expect(formatRelative(isoMinutesAgo(3 * 60))).toBe('há 3h')
  })

  it('mostra "ontem" pra exatamente um dia atrás', () => {
    expect(formatRelative(isoMinutesAgo(24 * 60))).toBe('ontem')
  })

  it('mostra dias quando é menos de uma semana', () => {
    expect(formatRelative(isoMinutesAgo(3 * 24 * 60))).toBe('há 3 dias')
  })
})
