// @vitest-environment happy-dom
// GYM 12: o boot (boot.js) e o idioma efetivo de um perfil novo.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => { localStorage.clear() })
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); localStorage.clear() })

const boot = async standalone => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import('./boot.js')
}

describe('boot do GYM 12', () => {
  it('perfil novo: começa vazio (sem semente demo) e em pt-BR', async () => {
    await boot(true)
    expect(localStorage.getItem('gym_demo_seeded_v1')).toBe('1')
    expect(localStorage.getItem('gym_default_lang')).toBe('pt-BR')
  })
  it('não sobrescreve o que já existe', async () => {
    localStorage.setItem('gym_demo_seeded_v1', 'x')
    localStorage.setItem('gym_default_lang', 'es')
    await boot(true)
    expect(localStorage.getItem('gym_demo_seeded_v1')).toBe('x')
    expect(localStorage.getItem('gym_default_lang')).toBe('es')
  })
  it('fora do GYM 12 não grava nada', async () => {
    await boot(false)
    expect(localStorage.getItem('gym_demo_seeded_v1')).toBe(null)
    expect(localStorage.getItem('gym_default_lang')).toBe(null)
  })
  it('idioma efetivo de um perfil que nunca escolheu: pt-BR; quem escolheu fica com o seu', async () => {
    await boot(true)
    const { effectiveLang } = await import('../lib/default-lang.js')
    const { freshState } = await import('../store/useStore.js')
    const S = freshState()
    expect(S.langAuto).toBe(true)
    expect(effectiveLang(S, null, ['en-US'])).toBe('pt-BR')
    expect(effectiveLang({ ...S, lang: 'de', langAuto: false }, null, ['en-US'])).toBe('de')
  })
  it('guarda o beforeinstallprompt e esquece no appinstalled', async () => {
    const b = await boot(true)
    const seen = vi.fn()
    const off = b.onInstallChange(seen)
    const ev = new Event('beforeinstallprompt')
    ev.prompt = vi.fn(async () => {})
    ev.userChoice = Promise.resolve({ outcome: 'accepted' })
    window.dispatchEvent(ev)
    expect(b.getInstallPrompt()).toBe(ev)
    expect(seen).toHaveBeenCalledTimes(1)
    expect(await b.promptInstall()).toBe('accepted')
    expect(ev.prompt).toHaveBeenCalled()
    expect(b.getInstallPrompt()).toBe(null)
    window.dispatchEvent(new Event('beforeinstallprompt'))
    window.dispatchEvent(new Event('appinstalled'))
    expect(b.wasInstalled()).toBe(true)
    expect(b.getInstallPrompt()).toBe(null)
    off()
  })
  it('askPersist pede só quando ainda não é persistente, e aguenta navegador sem a API', async () => {
    const { askPersist } = await boot(false)
    const persist = vi.fn(async () => true)
    expect(await askPersist({ storage: { persisted: async () => false, persist } })).toBe(true)
    expect(persist).toHaveBeenCalledTimes(1)
    const persist2 = vi.fn(async () => true)
    expect(await askPersist({ storage: { persisted: async () => true, persist: persist2 } })).toBe(true)
    expect(persist2).not.toHaveBeenCalled()
    expect(await askPersist({})).toBe(false)
    expect(await askPersist({ storage: { persist: async () => { throw new Error('x') } } })).toBe(false)
  })
  it('runningInstalled lê display-mode e navigator.standalone', async () => {
    const { runningInstalled } = await boot(false)
    expect(runningInstalled({ matchMedia: () => ({ matches: true }) })).toBe(true)
    expect(runningInstalled({ matchMedia: () => ({ matches: false }), navigator: { standalone: true } })).toBe(true)
    expect(runningInstalled({ matchMedia: () => ({ matches: false }), navigator: {} })).toBe(false)
  })
})