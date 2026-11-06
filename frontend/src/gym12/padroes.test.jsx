// @vitest-environment happy-dom
// GYM 12: padrões do perfil novo e da tela (nomes sem o inglês entre parênteses, vírgula decimal
// em pt-BR no campo numérico, "Lima", favicon só com o "12").
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

const standalone = on => { vi.unstubAllEnvs(); vi.resetModules(); if (on) vi.stubEnv('VITE_STANDALONE', '1') }

describe('perfil novo', () => {
  it('GYM 12: o nome em inglês entre parênteses começa desligado em pt-BR', async () => {
    standalone(true)
    const { freshState } = await import('../store/useStore.js')
    expect(freshState().enParens).toEqual({ 'pt-BR': false })
  })
  it('fora do GYM 12: como o upstream (mapa vazio, parênteses ligados)', async () => {
    standalone(false)
    const { freshState } = await import('../store/useStore.js')
    expect(freshState().enParens).toEqual({})
  })
})

describe('NumberField com vírgula decimal', () => {
  const mount = async (on, lang) => {
    standalone(on)
    const i18n = await import('../lib/i18n.js')
    await i18n.setLang(lang)
    const { NumberField } = await import('../components/ui.jsx')
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const seen = []
    const render = v => act(() => root.render(<NumberField value={v} onChange={n => seen.push(n)} />))
    render(67.5)
    const input = host.querySelector('input')
    // o campo é controlado: o valor confirmado volta como prop, como no app
    const type = text => {
      act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
      render(seen.at(-1))
    }
    return { input, type, seen, render, done: () => { act(() => root.unmount()); host.remove() } }
  }
  it('GYM 12 em pt-BR: mostra 67,5 e aceita "70,5" e "70.25"', async () => {
    const f = await mount(true, 'pt-BR')
    expect(f.input.value).toBe('67,5')
    f.type('70,5')
    expect(f.seen.at(-1)).toBe(70.5)
    expect(f.input.value).toBe('70,5')
    f.type('70.25')
    expect(f.seen.at(-1)).toBe(70.25)
    expect(f.input.value).toBe('70,25')
    f.done()
  })
  it('GYM 12 em inglês e fora do GYM 12: ponto, como o upstream', async () => {
    let f = await mount(true, 'en')
    expect(f.input.value).toBe('67.5')
    f.done()
    f = await mount(false, 'pt-BR')
    expect(f.input.value).toBe('67.5')
    f.type('70,5')
    expect(f.seen.at(-1)).toBe(70.5)
    expect(f.input.value).toBe('70.5')
    f.done()
  })
})

describe('marca', () => {
  it('a cor de destaque lime se chama "Lima" em pt-BR', async () => {
    const ui = (await import('./locales/pt-BR.ui.js')).default
    expect(ui.Green).toBe('Lima')
  })
  it('favicon: só o "12" em lime sobre ink-950, sem o "GYM" em bone', () => {
    const svg = readFileSync(join(resolve(process.cwd(), '..'), 'brand/favicon.svg'), 'utf8')
    expect(svg).toContain('fill="#050604"')
    expect(svg).toContain('fill="#c4f439"')
    expect(svg).not.toContain('#f4f1ea')
  })
})
