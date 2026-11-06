// @vitest-environment happy-dom
// GYM 12: os termos em inglês tirados das telas do vídeo (Fase 0): "Superset" → "Bi-set" em todo
// o pt-BR, "1Y" → "1A" nos períodos e os nomes dos modelos de divisão em português.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

const standalone = async on => { vi.unstubAllEnvs(); vi.resetModules(); if (on) vi.stubEnv('VITE_STANDALONE', '1') }
const ptBRui = async () => {
  await standalone(true)
  const { overlayFor } = await import('./i18n-overlay.js')
  const base = (await import('../locales/pt-BR.js')).default
  const { ui } = await overlayFor('pt-BR', base)
  return { ...base, ...ui }
}
const flat = v => (typeof v === 'string' ? [v] : Object.values(v || {}).flatMap(flat))

describe('Bi-set', () => {
  it('nenhuma frase pt-BR do GYM 12 diz "superset" (nem a "supersérie" herdada do pt-PT)', async () => {
    const pack = await ptBRui()
    const left = Object.entries(pack).filter(([, v]) => flat(v).some(s => /super-?s(et|érie)/i.test(s)))
    expect(left).toEqual([])
  })
  it('cada chave com superset tem bi-set, com B maiúsculo só no início da frase', async () => {
    const pack = await ptBRui()
    const keys = Object.keys(pack).filter(k => /superset/i.test(k))
    expect(keys.length).toBeGreaterThanOrEqual(19)
    for (const k of keys) {
      const v = pack[k]
      expect(v, k).toMatch(/bi-set/i)
      // "Bi-set" só no começo; no meio da frase, "bi-set".
      expect(v.replace(/^Bi-set/, ''), k).not.toMatch(/Bi-set/)
    }
    expect(pack.Superset).toBe('Bi-set')
    expect(pack['Superset {0} / {1}']).toBe('Bi-set {0} / {1}')
    expect(pack['Superset with exercise above']).toBe('Bi-set com o exercício acima')
    expect(pack['Superset position {0}']).toBe('Posição no bi-set {0}')
    expect(pack['Superset:']).toBe('Bi-set:')
  })
  it('fora do GYM 12 o pacote pt-BR do upstream fica como estava', async () => {
    await standalone(false)
    const { overlayFor } = await import('./i18n-overlay.js')
    const { ui } = await overlayFor('pt-BR', (await import('../locales/pt-BR.js')).default)
    expect(ui).toEqual({})
  })
})

describe('"1Y" dos períodos', () => {
  it('vira "1A" em pt-BR no GYM 12 e continua "1Y" no inglês', async () => {
    const pack = await ptBRui()
    expect(pack['1Y']).toBe('1A')
    const core = await import('../lib/i18n-core.js')
    const { oneYear } = await import('./rotulos.js')
    core._setLangState('pt-BR', pack, null, null)
    expect(oneYear()).toBe('1A')
    core._setLangState('en', {}, null, null)
    expect(oneYear()).toBe('1Y')
  })
  it('Estatísticas e Medidas usam oneYear() em vez do "1Y" fixo', () => {
    for (const f of ['../views/Stats.jsx', '../views/Measurements.jsx']) {
      const src = readFileSync(join(import.meta.dirname, f), 'utf8')
      expect(src, f).not.toMatch(/label: '1Y'/)
      expect(src, f).toMatch(/label: oneYear\(\)/)
    }
  })
})

describe('modelos de divisão', () => {
  const names = async () => {
    const { buildStarterPlan, starterPlanOptions } = await import('../lib/starter.js')
    return starterPlanOptions().flatMap(({ id }) => buildStarterPlan(id).routines.map(r => r.name))
  }
  it('GYM 12 em pt-BR: as rotinas nascem com nome em português', async () => {
    await standalone(true)
    const core = await import('../lib/i18n-core.js')
    core._setLangState('pt-BR', {}, null, null)
    const all = await names()
    expect(all.slice(0, 3)).toEqual(['Empurrar', 'Puxar', 'Pernas'])
    expect(all).toContain('Superior A')
    expect(all).toContain('Corpo inteiro C')
    for (const n of all) expect(n).not.toMatch(/Day|Upper|Lower|Full Body/)
    expect((await ptBRui())['Push / Pull / Legs']).toBe('Empurrar / Puxar / Pernas')
  })
  it('GYM 12 em outro idioma e o upstream: os nomes do upstream', async () => {
    await standalone(true)
    let core = await import('../lib/i18n-core.js')
    core._setLangState('en', {}, null, null)
    expect((await names()).slice(0, 3)).toEqual(['Push Day', 'Pull Day', 'Leg Day'])
    await standalone(false)
    core = await import('../lib/i18n-core.js')
    core._setLangState('pt-BR', {}, null, null)
    expect((await names()).slice(0, 3)).toEqual(['Push Day', 'Pull Day', 'Leg Day'])
  })
})

// 2026-11-06 (gravação do Reel): "Everything else" do seletor, o selo de recorde e os músculos.
describe('títulos e selos da gravação', () => {
  it('"Everything else" tem a frase do GYM 12 em pt-BR', async () => {
    expect((await ptBRui())['Everything else']).toBe('Os demais exercícios')
  })
  it('selo de recorde: "Recorde" e "{n} recorde(s)" em pt-BR no GYM 12', async () => {
    const pack = await ptBRui()
    const core = await import('../lib/i18n-core.js')
    const { prBadge, prCount } = await import('./rotulos.js')
    core._setLangState('pt-BR', pack, null, null)
    expect(prBadge()).toBe('Recorde')
    expect(prCount(1)).toBe('1 recorde')
    expect(prCount(3)).toBe('3 recordes')
  })
  it('sem tradução (inglês, upstream) o selo continua exatamente "PR" e "{n} PR"', async () => {
    await standalone(false)
    const core = await import('../lib/i18n-core.js')
    const { prBadge, prCount } = await import('./rotulos.js')
    core._setLangState('en', {}, null, null)
    expect(prBadge()).toBe('PR')
    expect(prCount(1)).toBe('1 PR')
    expect(prCount(4)).toBe('4 PR')
    core._setLangState('pt-BR', (await import('../locales/pt-BR.js')).default, null, null)
    expect(prBadge()).toBe('PR')
    expect(prCount(2)).toBe('2 PR')
  })
  it('sheets.jsx usa prBadge()/prCount() no lugar do "PR" fixo', () => {
    const src = readFileSync(join(import.meta.dirname, '../sheets.jsx'), 'utf8')
    expect(src).not.toMatch(/<Icon name="trophy" \/>PR<\/span>/)
    expect(src).not.toMatch(/\{w\.prs\.length\} PR</)
    expect(src.match(/\{prBadge\(\)\}/g)).toHaveLength(2)
    expect(src).toMatch(/\{prCount\(w\.prs\.length\)\}/)
  })
  it('o CSS tira o capitalize dos chips de Explorar músculos em pt-BR', () => {
    const css = readFileSync(join(import.meta.dirname, 'gym12.css'), 'utf8')
    expect(css).toMatch(/:root:lang\(pt-BR\) \.bodymap \+ \.chips \.chip,\s*:root:lang\(pt-BR\) \.search-row ~ \.chips \.chip \{ text-transform: none \}/)
  })
})
