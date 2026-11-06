// @vitest-environment happy-dom
// GYM 12: os módulos que o build do GYM 12 desliga (lib/modules.js, conjunto OFF).
import { afterEach, describe, expect, it, vi } from 'vitest'

const OFF = ['coach', 'integrations', 'watch', 'health', 'seasonal']
const load = async standalone => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import('../lib/modules.js')
}
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

describe('módulos no GYM 12', () => {
  it('somem da lista e ficam desligados mesmo que o perfil diga o contrário', async () => {
    const m = await load(true)
    for (const id of OFF) {
      expect(m.MODULE_IDS).not.toContain(id)
      expect(m.isOn({ modules: { [id]: true } }, id)).toBe(false)
      expect(m.isOn({}, id)).toBe(false)
    }
    // o resto continua como antes
    expect(m.isOn({}, 'body')).toBe(true)
    expect(m.isOn({ modules: { body: false } }, 'body')).toBe(false)
    expect(m.presetModules('all').coach).toBeUndefined()
    // o preset "Tudo" não cita o Coach (texto já traduzido do módulo Motivação)
    expect(m.PRESET.all.desc).toBe(m.MODULE.motivation.desc)
    expect(m.PRESETS.map(p => p.desc).join(' ')).not.toMatch(/Coach/)
    const { presetCopy } = await import('../lib/modules-copy.js')
    for (const p of m.PRESETS) expect(presetCopy()[p.id]).toEqual([p.title, p.desc])
  })
  it('fora do GYM 12 nada muda', async () => {
    const m = await load(false)
    for (const id of OFF) {
      expect(m.MODULE_IDS).toContain(id)
      expect(m.isOn({}, id)).toBe(true)
    }
    expect(m.PRESET.all.desc).toBe('Streaks, the Coach, themes, the lot.')
  })
  it('Ajustes não mostra as páginas de Coach, Integrações nem relógio', async () => {
    await load(true)
    const { pageVisible, searchSettings } = await import('../views/settings-pages.js')
    const ctx = { mod: id => (OFF.includes(id) ? false : true), mobile: false, demo: true }
    const { isOn } = await import('../lib/modules.js')
    ctx.mod = id => isOn({}, id)
    for (const p of ['coach', 'zepp', 'apple-health', 'health-connect', 'themes']) expect(pageVisible(p, ctx)).toBe(false)
    const titles = q => searchSettings(q, ctx, s => s).map(h => h.title)
    expect(titles('hevy')).not.toContain('Import from Hevy')
    expect(titles('android')).not.toContain('Get the Android app')
    expect(titles('coach')).toEqual([])
  })
})