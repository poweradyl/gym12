// @vitest-environment happy-dom
// GYM 12: a porta de entrada (Gate.jsx), a página de instalação (InstallLanding.jsx), a linha de
// Ajustes → Sobre. A captura do celular e o build: install-build.test.js.
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const FRONT = process.cwd()

const mounted = []
async function mount(el) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => root.render(el))
  // a página é carregada sob demanda (React.lazy): deixa o import e o Suspense resolverem
  for (let i = 0; i < 5; i++) await act(async () => { await new Promise(r => setTimeout(r, 0)) })
  mounted.push({ host, root })
  return host
}
// Espera a página sob demanda (React.lazy) aparecer, ou desistir em ~2 s.
async function settle(host, sel = '.g12i') {
  for (let i = 0; i < 80 && !host.querySelector(sel); i++) await act(async () => { await new Promise(r => setTimeout(r, 25)) })
}
const withNav = props => {
  const nav = Object.create(navigator)
  for (const [k, v] of Object.entries(props)) Object.defineProperty(nav, k, { value: v, configurable: true })
  vi.stubGlobal('navigator', nav)
}
const click = async el => act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
const button = (host, name) => [...host.querySelectorAll('button')].find(b => b.textContent.trim() === name)
const standaloneMedia = on => vi.stubGlobal('matchMedia', q => ({ matches: on && q === '(display-mode: standalone)', media: q, addEventListener() {}, removeEventListener() {} }))

beforeEach(() => { localStorage.clear(); history.replaceState(null, '', '/'); standaloneMedia(false) })
afterEach(() => {
  for (const { host, root } of mounted.splice(0)) { act(() => root.unmount()); host.remove() }
  document.getElementById('boot')?.remove()
  vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetModules()
  localStorage.clear()
})

const loadGate = async standalone => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import('../Gate.jsx')
}

describe('regras do Gate (funções puras)', () => {
  it('#/instalar com ou sem barra/consulta; nada mais', async () => {
    const { isInstallHash } = await loadGate(false)
    for (const h of ['#/instalar', '#/instalar/', '#/instalar?x=1']) expect(isInstallHash(h), h).toBe(true)
    for (const h of ['', '#', '#/home', '#/instalarx', '#/settings/instalar', null, undefined]) expect(isInstallHash(h), String(h)).toBe(false)
  })
  it('instalado nunca vê a página; no navegador: primeira visita ou #/instalar', async () => {
    const { landingWanted } = await loadGate(false)
    expect(landingWanted({ installed: true, skipped: false, hash: '#/instalar' })).toBe(false)
    expect(landingWanted({ installed: false, skipped: false, hash: '' })).toBe(true)
    expect(landingWanted({ installed: false, skipped: true, hash: '#/home' })).toBe(false)
    expect(landingWanted({ installed: false, skipped: true, hash: '#/instalar' })).toBe(true)
  })
  it('entrar no app: o Início, ou o endereço que abriu (link de rotina)', async () => {
    const { enterHash } = await loadGate(false)
    expect(enterHash('')).toBe('#/home')
    expect(enterHash('#/')).toBe('#/home')
    expect(enterHash('#/instalar')).toBe('#/home')
    expect(enterHash('#/r/abc')).toBe('#/r/abc')
  })
  it('gym12.skipInstall com armazenamento bloqueado não quebra', async () => {
    const { wasSkipped, markSkipped, SKIP_KEY } = await loadGate(false)
    const bad = { getItem() { throw new Error('x') }, setItem() { throw new Error('x') } }
    expect(wasSkipped(bad)).toBe(false)
    expect(() => markSkipped(bad)).not.toThrow()
    expect(wasSkipped(null)).toBe(false)
    markSkipped(localStorage)
    expect(localStorage.getItem(SKIP_KEY)).toBe('1')
    expect(wasSkipped(localStorage)).toBe(true)
  })
})

describe('Gym12Gate', () => {
  const App = () => <p id="app">o app</p>

  it('fora do GYM 12: só os filhos, mesmo em #/instalar e sem ter dispensado', async () => {
    history.replaceState(null, '', '/#/instalar')
    const { Gym12Gate } = await loadGate(false)
    const host = await mount(<Gym12Gate><App /></Gym12Gate>)
    expect(host.querySelector('#app')).not.toBe(null)
    expect(host.querySelector('.g12i')).toBe(null)
  })

  it('primeira visita no navegador: a página; "Usar sem instalar" grava a escolha e entra no Início', async () => {
    const { Gym12Gate, SKIP_KEY } = await loadGate(true)
    const boot = document.createElement('div')
    boot.id = 'boot'
    document.body.appendChild(boot)
    const host = await mount(<Gym12Gate><App /></Gym12Gate>)
    await settle(host)
    expect(host.querySelector('.g12i')).not.toBe(null)
    expect(host.querySelector('#app')).toBe(null)
    expect(boot.dataset.leaving).toBe('1')   // hideBoot(): o vigia do index.html não dispara
    await click(button(host, 'Usar sem instalar'))
    expect(localStorage.getItem(SKIP_KEY)).toBe('1')
    expect(location.hash).toBe('#/home')
    expect(host.querySelector('#app')).not.toBe(null)
    expect(host.querySelector('.g12i')).toBe(null)
  })

  it('quem já dispensou vai direto ao app; #/instalar reabre a página, e voltar a fecha', async () => {
    localStorage.setItem('gym12.skipInstall', '1')
    history.replaceState(null, '', '/#/settings/about')
    const { Gym12Gate } = await loadGate(true)
    const host = await mount(<Gym12Gate><App /></Gym12Gate>)
    expect(host.querySelector('#app')).not.toBe(null)
    await act(async () => {
      history.pushState(null, '', '/#/instalar')
      dispatchEvent(new HashChangeEvent('hashchange', { oldURL: location.origin + '/#/settings/about', newURL: location.href }))
    })
    await settle(host)
    expect(host.querySelector('.g12i')).not.toBe(null)
    await act(async () => {
      history.replaceState(null, '', '/#/settings/about')
      dispatchEvent(new HashChangeEvent('hashchange', { newURL: location.href }))
    })
    expect(host.querySelector('#app')).not.toBe(null)
  })

  it('abre direto em #/instalar mesmo depois de dispensar', async () => {
    localStorage.setItem('gym12.skipInstall', '1')
    history.replaceState(null, '', '/#/instalar')
    const { Gym12Gate } = await loadGate(true)
    const host = await mount(<Gym12Gate><App /></Gym12Gate>)
    await settle(host)
    expect(host.querySelector('.g12i')).not.toBe(null)
  })

  it('instalado (display-mode standalone ou navigator.standalone): direto ao app, nem #/instalar abre a página', async () => {
    standaloneMedia(true)
    history.replaceState(null, '', '/#/instalar')
    const { Gym12Gate } = await loadGate(true)
    const host = await mount(<Gym12Gate><App /></Gym12Gate>)
    expect(host.querySelector('#app')).not.toBe(null)
    expect(host.querySelector('.g12i')).toBe(null)
    await act(async () => { dispatchEvent(new HashChangeEvent('hashchange', { newURL: location.origin + '/#/instalar' })) })
    expect(host.querySelector('.g12i')).toBe(null)

    standaloneMedia(false)
    withNav({ standalone: true })
    const again = await loadGate(true)
    const host2 = await mount(<again.Gym12Gate><App /></again.Gym12Gate>)
    expect(host2.querySelector('#app')).not.toBe(null)
  })
})

describe('InstallLanding', () => {
  const load = async () => {
    vi.resetModules()
    vi.stubEnv('VITE_STANDALONE', '1')
    const boot = await import('../boot.js')
    const page = await import('./InstallLanding.jsx')
    return { boot, ...page }
  }
  // O texto do cartão como se lê: um espaço depois do número de cada passo, de cada parágrafo e botão.
  const card = host => {
    const c = host.querySelector('.g12i-card').cloneNode(true)
    c.querySelectorAll('.g12i-n, li, p, button').forEach(el => el.after(' '))
    return c.textContent.replace(/\s+/g, ' ').trim()
  }

  it('a ordem fixa da página, em pt-BR, sem crédito nem links externos', async () => {
    const { default: InstallLanding } = await load()
    const host = await mount(<InstallLanding env="ios-safari" onEnter={() => {}} />)
    const main = host.querySelector('main.g12i')
    expect(main.getAttribute('lang')).toBe('pt-BR')
    expect([...main.children].map(c => c.className.split(' ')[0])).toEqual(['g12i-wm', 'g12i-kicker', 'g12i-title', 'g12i-hero', 'g12i-band', 'g12i-card', 'g12i-btn', 'g12i-foot'])
    expect(main.querySelector('.g12i-kicker').textContent).toBe('— APP DE TREINO GRÁTIS')
    expect(main.querySelector('h1').textContent).toBe('Sua ficha de treino, evoluída')
    expect(main.querySelector('h1 em').textContent).toBe('evoluída')
    expect(main.querySelector('.g12i-band').textContent).toBe('Grátis. Sem anúncio. Seus treinos ficam no seu celular.')
    expect(main.querySelector('.g12i-foot').textContent).toBe('Funciona sem internet depois de instalado.')
    const img = main.querySelector('.g12i-phone img')
    expect(img.getAttribute('src')).toBe('install-screen.webp')
    expect(img.getAttribute('alt')).toMatch(/treino/)
    expect(main.querySelectorAll('a').length).toBe(0)
    expect(main.textContent).not.toMatch(/openGym|WhatsApp|Junior/i)
  })

  it.each([
    ['inapp', 'Toque nos ••• no canto e escolha Abrir no navegador. Copiar link'],
    ['ios-safari', '1 Toque em Compartilhar 2 Role e escolha Adicionar à Tela de Início 3 Toque em Adicionar. O GYM 12 aparece na sua tela de início.'],
    ['ios-other', 'No iPhone, a instalação é pelo Safari. 1 Toque em Compartilhar 2 Role e escolha Adicionar à Tela de Início 3 Toque em Adicionar. O GYM 12 aparece na sua tela de início. Copiar link'],
    ['desktop', 'Abra este link no celular.'],
  ])('%s: o cartão certo e "Usar sem instalar" sempre', async (env, text) => {
    const { default: InstallLanding } = await load()
    const onEnter = vi.fn()
    const host = await mount(<InstallLanding env={env} onEnter={onEnter} />)
    expect(card(host)).toBe(text)
    await click(button(host, 'Usar sem instalar'))
    expect(onEnter).toHaveBeenCalledTimes(1)
  })

  it('in-app: o desenho da barra com os ••• e "Copiar link" com o retorno "Link copiado"', async () => {
    const { default: InstallLanding } = await load()
    const writeText = vi.fn(async () => {})
    withNav({ clipboard: { writeText } })
    const host = await mount(<InstallLanding env="inapp" onEnter={() => {}} />)
    expect(host.querySelectorAll('.g12i-bar .g12i-bar-dot').length).toBe(3)
    await click(button(host, 'Copiar link'))
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(writeText).toHaveBeenCalledWith(location.origin + location.pathname)
    expect(host.querySelector('.g12i-copy-msg').textContent).toBe('Link copiado')
  })

  it('sem a API da área de transferência e sem execCommand: mostra o endereço para copiar à mão', async () => {
    const { default: InstallLanding } = await load()
    withNav({ clipboard: undefined })
    const host = await mount(<InstallLanding env="ios-other" onEnter={() => {}} />)
    await click(button(host, 'Copiar link'))
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(host.querySelector('.g12i-copy-msg').textContent).toMatch(/^(Link copiado|Copie o endereço: .+)$/)
  })

  it('Android com o pedido do navegador: botão "Instalar o GYM 12"; aceito, "Pronto!"', async () => {
    const { default: InstallLanding, boot } = await load()
    const e = new Event('beforeinstallprompt')
    e.prompt = vi.fn(async () => {})
    e.userChoice = Promise.resolve({ outcome: 'accepted' })
    dispatchEvent(e)
    expect(boot.getInstallPrompt()).toBe(e)
    const host = await mount(<InstallLanding env="android" onEnter={() => {}} />)
    const btn = button(host, 'Instalar o GYM 12')
    expect(btn.className).toMatch(/g12i-btn-1/)
    await click(btn)
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(e.prompt).toHaveBeenCalledTimes(1)
    expect(card(host)).toBe('Pronto! Abra o GYM 12 pela tela de início.')
    expect(button(host, 'Usar sem instalar')).toBeTruthy()
  })

  it('Android: o pedido que chega depois da página troca a espera pelo botão; recusado, os passos do ⋮', async () => {
    const { default: InstallLanding } = await load()
    const host = await mount(<InstallLanding env="android" onEnter={() => {}} />)
    expect(host.querySelector('.g12i-wait')).not.toBe(null)
    const e = new Event('beforeinstallprompt')
    e.prompt = vi.fn(async () => {})
    e.userChoice = Promise.resolve({ outcome: 'dismissed' })
    await act(async () => { dispatchEvent(e) })
    await click(button(host, 'Instalar o GYM 12'))
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(card(host)).toBe('1 Toque em ⋮ no canto de cima 2 Escolha Instalar app ou Adicionar à tela inicial')
  })

  it('Android sem o pedido em 2,5 s: os passos do menu ⋮; appinstalled mostra "Pronto!"', async () => {
    vi.useFakeTimers()
    const { default: InstallLanding, PROMPT_WAIT_MS } = await load()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    mounted.push({ host, root })
    await act(async () => root.render(<InstallLanding env="android" onEnter={() => {}} />))
    await act(async () => { await vi.advanceTimersByTimeAsync(PROMPT_WAIT_MS - 100) })
    expect(host.querySelector('.g12i-wait')).not.toBe(null)
    await act(async () => { await vi.advanceTimersByTimeAsync(200) })
    expect(card(host)).toBe('1 Toque em ⋮ no canto de cima 2 Escolha Instalar app ou Adicionar à tela inicial')
    await act(async () => { dispatchEvent(new Event('appinstalled')) })
    expect(card(host)).toBe('Pronto! Abra o GYM 12 pela tela de início.')
  })

  it('iOS Safari: os 3 passos numerados, com os ícones de Compartilhar e de +, visíveis sem animação', async () => {
    const { default: InstallLanding } = await load()
    const host = await mount(<InstallLanding env="ios-safari" onEnter={() => {}} />)
    const items = [...host.querySelectorAll('.g12i-card ol.g12i-steps > li')]
    expect(items.length).toBe(3)
    expect(items.map(li => li.querySelector('.g12i-n').textContent)).toEqual(['1', '2', '3'])
    expect(items.map(li => li.querySelector('.g12i-step').textContent.trim())).toEqual([
      'Toque em Compartilhar',
      'Role e escolha Adicionar à Tela de Início',
      'Toque em Adicionar. O GYM 12 aparece na sua tela de início.',
    ])
    expect(items[0].querySelector('svg.g12i-ico')).not.toBe(null)
    expect(items[1].querySelector('svg.g12i-ico')).not.toBe(null)
    expect(items.every(li => !li.closest('[hidden], [aria-hidden="true"]'))).toBe(true)
  })

  it('a entrada é enfeite: a classe sai depois de ENTER_MS; com "reduzir movimento" ou aba escondida nem entra', async () => {
    vi.useFakeTimers()
    const { default: InstallLanding, ENTER_MS, wantsEntrance } = await load()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    mounted.push({ host, root })
    await act(async () => root.render(<InstallLanding env="ios-safari" onEnter={() => {}} />))
    expect(host.querySelector('main').className).toBe('g12i g12i-enter')
    await act(async () => { await vi.advanceTimersByTimeAsync(ENTER_MS + 10) })
    expect(host.querySelector('main').className).toBe('g12i')
    expect(host.querySelectorAll('.g12i-card li').length).toBe(3)

    const media = reduce => ({ document: { visibilityState: 'visible' }, matchMedia: q => ({ matches: reduce && q === '(prefers-reduced-motion: reduce)' }) })
    expect(wantsEntrance(media(false))).toBe(true)
    expect(wantsEntrance(media(true))).toBe(false)
    expect(wantsEntrance({ document: { visibilityState: 'hidden' }, matchMedia: () => ({ matches: false }) })).toBe(false)
    expect(wantsEntrance({ get document() { throw new Error('x') } })).toBe(false)
  })

  it('androidMode', async () => {
    const { androidMode } = await load()
    expect(androidMode({ prompt: false, waited: false, dismissed: false, done: false })).toBe('espera')
    expect(androidMode({ prompt: true, waited: false, dismissed: false, done: false })).toBe('botao')
    expect(androidMode({ prompt: true, waited: true, dismissed: true, done: false })).toBe('menu')
    expect(androidMode({ prompt: false, waited: true, dismissed: false, done: false })).toBe('menu')
    expect(androidMode({ prompt: true, waited: true, dismissed: false, done: true })).toBe('pronto')
  })

  it('o CSS: entrada fade + 16 px com 80 ms entre blocos, sem movimento com prefers-reduced-motion, alvos de 44 px+', () => {
    const css = readFileSync(join(FRONT, 'src/gym12/install/install.css'), 'utf8')
    expect(css).toMatch(/translateY\(16px\)/)
    expect(css).toMatch(/:nth-child\(2\) \{ animation-delay: 80ms \}/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.g12i-enter > \* \{ animation: none \}/)
    // a animação só existe sob .g12i-enter, e com `backwards`: nunca segura um bloco invisível
    expect(css).toMatch(/\.g12i-enter > \* \{ animation: g12i-in [^}]*backwards \}/)
    expect(css).not.toMatch(/\.g12i > \*\s*\{[^}]*animation/)
    expect(css).not.toMatch(/animation[^;}]*\bboth\b/)
    // fora do keyframe (e da área de cópia, que é fora da tela), nenhuma regra deixa algo transparente
    expect(css.replace(/@keyframes g12i-in \{[^\n]*\n/, '').replace(/textarea\.g12i-offscreen \{[^}]*\}/, '')).not.toMatch(/(?:^|[\s{;])opacity:\s*0\s*[;}]/)
    expect(css).toMatch(/\.g12i-btn \{[^}]*min-height: 48px/)
    expect(css).toMatch(/\.g12i-btn-1 \{[^}]*min-height: 56px/)
    expect(css).not.toMatch(/color-mix/)
  })
})

describe('Ajustes → Sobre', () => {
  it('a linha "Instalar o GYM 12" leva a #/instalar e some no app instalado', async () => {
    vi.resetModules()
    const { InstallRow } = await import('../SettingsBits.jsx')
    const host = await mount(<InstallRow installed={false} />)
    const row = [...host.querySelectorAll('*')].find(el => el.textContent === 'Instalar o GYM 12' && el.closest('[role="button"], button'))
    expect(row).toBeTruthy()
    await click(row.closest('[role="button"], button'))
    expect(location.hash).toBe('#/instalar')
    const host2 = await mount(<InstallRow installed />)
    expect(host2.textContent).toBe('')
  })
  it('no standalone a "Dica" do upstream (dados de visitante) dá lugar à linha', () => {
    const src = readFileSync(join(FRONT, 'src/views/Settings.jsx'), 'utf8')
    expect(src).toMatch(/\{STANDALONE && <InstallRow \/>\}\n\s*\{!STANDALONE && !MOBILE && !standalone\(\) && <Section title=\{t\('Tip'\)\}>/)
  })
})
