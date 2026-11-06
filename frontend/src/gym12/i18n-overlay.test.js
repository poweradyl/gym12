// @vitest-environment happy-dom
// GYM 12: a camada de tradução (i18n-overlay.js) e a ligação dela em lib/i18n.js e i18n-core.js.
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.doUnmock('./locales/pt-BR.ui.js'); vi.doUnmock('./locales/pt-BR.names.js'); vi.resetModules() })

const overlay = async standalone => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import('./i18n-overlay.js')
}

describe('rename', () => {
  it('troca openGym como palavra e deixa endereços e identificadores', async () => {
    const { rename } = await overlay(true)
    expect(rename('Your year in openGym')).toBe('Your year in GYM 12')
    expect(rename('openGym is free')).toBe('GYM 12 is free')
    expect(rename('o openGym, do openGym.')).toBe('o GYM 12, do GYM 12.')
    expect(rename('openGym’s data')).toBe('GYM 12’s data')
    expect(rename('“openGym”')).toBe('“GYM 12”')
    expect(rename('github.com/DuarteSantos8/openGym')).toBe('github.com/DuarteSantos8/openGym')
    expect(rename('see openGym.ch')).toBe('see openGym.ch')
    expect(rename('opengym_plan opengym.ch myopenGym openGym-x')).toBe('opengym_plan opengym.ch myopenGym openGym-x')
    expect(rename(42)).toBe(42)
  })
})

describe('overlayFor', () => {
  it('fora do GYM 12 devolve vazio', async () => {
    const { overlayFor } = await overlay(false)
    const ov = await overlayFor('de', { 'About openGym': 'Über openGym' })
    expect(ov).toEqual({ ui: {}, names: {} })
    expect(await overlayFor('en')).toEqual({ ui: {}, names: {} })
  })
  it('em qualquer idioma renomeia só os valores que citam openGym, nunca as chaves', async () => {
    const { overlayFor } = await overlay(true)
    const ov = await overlayFor('de', { 'About openGym': 'Über openGym', Save: 'Speichern', '{0} sets': { one: '{0} openGym', other: '{0} Sätze' } })
    expect(ov.ui).toEqual({ 'About openGym': 'Über GYM 12', '{0} sets': { one: '{0} GYM 12', other: '{0} Sätze' } })
    expect(ov.names).toEqual({})
  })
  it('o inglês ganha as chaves que citam openGym, tiradas do pacote pt-BR', async () => {
    const { overlayFor } = await overlay(true)
    const { ui } = await overlayFor('en', {})
    const keys = Object.keys(ui)
    expect(keys.length).toBeGreaterThan(20)
    for (const k of keys) {
      expect(k).toMatch(/openGym/)
      expect(ui[k]).toBe(k.replace(/openGym/g, m => m).replace(/(^|[^\w/.@-])openGym(?![\w-]|\.\w)/g, '$1GYM 12'))
      expect(ui[k]).toMatch(/GYM 12/)
    }
  })
  it('pt-BR junta as revisões da camada (ui e nomes) por cima do pacote', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_STANDALONE', '1')
    vi.doMock('./locales/pt-BR.ui.js', () => ({ default: { Save: 'Salvar já', 'Rate openGym': 'Avalie o openGym' } }))
    vi.doMock('./locales/pt-BR.names.js', () => ({ default: { 1000: 'panturrilha teste' } }))
    const { overlayFor } = await import('./i18n-overlay.js')
    const ov = await overlayFor('pt-BR', { Save: 'Salvar', 'About openGym': 'Sobre o openGym' })
    expect(ov.ui).toEqual({ Save: 'Salvar já', 'Rate openGym': 'Avalie o GYM 12', 'About openGym': 'Sobre o GYM 12' })
    expect(ov.names).toEqual({ 1000: 'panturrilha teste' })
  })
  it('merged não copia à toa', async () => {
    const { merged } = await overlay(true)
    const base = { a: 1 }
    expect(merged(base, {})).toBe(base)
    expect(merged(null, {})).toBe(null)
    expect(merged(base, { b: 2 })).toEqual({ a: 1, b: 2 })
    expect(merged(null, { b: 2 })).toEqual({ b: 2 })
  })
})

describe('setLang com a camada', () => {
  const KEY = 'Your year in openGym'
  it('GYM 12: inglês e pt-BR mostram GYM 12; nomes revisados entram na busca', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_STANDALONE', '1')
    vi.doMock('./locales/pt-BR.names.js', () => ({ default: { 1000: 'nome revisado gym12' } }))
    const i18n = await import('../lib/i18n.js')
    await i18n.setLang('en')
    expect(i18n.t(KEY)).toBe('Your year in GYM 12')
    expect(i18n.t('Save')).toBe('Save')
    await i18n.setLang('pt-BR')
    expect(i18n.t(KEY)).toMatch(/GYM 12/)
    expect(i18n.t(KEY)).not.toMatch(/openGym/)
    const ex = { id: '1000', n: 'band calf raise' }
    expect(i18n.exerciseNameFor(ex)).toMatch(/^nome revisado gym12/)
    expect(i18n.exerciseNameSearchText(ex)).toContain('nome revisado gym12')
    await i18n.setLang('de')
    expect(i18n.t(KEY)).not.toMatch(/openGym/)
  })
  it('fora do GYM 12 o inglês segue sem pacote e com o nome original', async () => {
    vi.resetModules()
    const i18n = await import('../lib/i18n.js')
    await i18n.setLang('de')
    await i18n.setLang('en')
    expect(i18n.t(KEY)).toBe(KEY)
  })
})