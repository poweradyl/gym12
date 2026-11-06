// @vitest-environment happy-dom
// GYM 12: o aviso da rotina e a linha da conta só aparecem no build do GYM 12.
import { createElement, act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); document.body.innerHTML = '' })

const render = async el => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(el) })
  return host
}
const load = async (standalone, path) => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import(path)
}

describe('aviso da rotina', () => {
  it('no GYM 12: o texto exato, num cartão discreto', async () => {
    const { default: RoutineNotice, ROUTINE_NOTICE } = await load(true, './RoutineNotice.jsx')
    expect(ROUTINE_NOTICE).toBe('O seu treino é prescrito pelo seu profissional de educação física. O GYM 12 guarda e mostra a sua evolução.')
    const host = await render(createElement(RoutineNotice))
    expect(host.textContent).toBe(ROUTINE_NOTICE)
    expect(host.querySelector('.card[role="note"] svg[data-icon="info"]')).not.toBe(null)
  })
  it('fora do GYM 12: nada', async () => {
    const { default: RoutineNotice } = await load(false, './RoutineNotice.jsx')
    const host = await render(createElement(RoutineNotice))
    expect(host.innerHTML).toBe('')
  })
})

describe('linha da conta', () => {
  it('diz onde ficam os treinos, sem "demo"', async () => {
    const { AccountLine, ACCOUNT_LINE } = await load(true, './SettingsBits.jsx')
    const host = await render(createElement(AccountLine))
    expect(host.textContent).toBe(ACCOUNT_LINE)
    expect(host.textContent).not.toMatch(/demo/i)
    expect(host.querySelector('button')).toBe(null)
  })
})
