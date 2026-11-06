// GYM 12: a identidade visual — tela de abertura, ícones, manifest, CSS só no build do GYM 12.
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import gym12, { brandHtml, brandBoot, BRAND_FILES } from './vite-plugin.js'

const FRONT = process.cwd()
const REPO = resolve(FRONT, '..')
const html = brandHtml(readFileSync(join(FRONT, 'index.html'), 'utf8'))

describe('tela de abertura', () => {
  it('ink-950, o wordmark em contorno e o traço lime, sem os halteres do upstream', () => {
    const boot = html.slice(html.indexOf('<div id="boot"'), html.indexOf('<div id="root">'))
    expect(html).toContain('#boot{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#050604')
    expect(boot).toContain('aria-hidden="true"')
    expect(boot).toMatch(/<svg [^>]*viewBox="[^"]+"/)
    expect(boot).toContain('fill="#f4f1ea"')   // GYM em bone
    expect(boot).toContain('fill="#c4f439"')   // 12 em lime
    expect(boot).toContain('<i></i>')
    expect(html).not.toContain('#a3e635')
    expect(html).not.toContain('class="db"')
    expect(boot).not.toMatch(/<text/)          // nada depende de fonte carregada
  })
  it('o vigia de boot continua com os seus estilos', () => {
    expect(html).toContain('#boot.fail button{')
    expect(html).toContain('#boot.out{opacity:0;pointer-events:none}')
  })
  it('recusa um index.html sem a tela de boot do upstream', () => {
    expect(() => brandBoot('<body><div id="root"></div>', '<svg></svg>')).toThrow(/tela de boot/)
  })
})

describe('ícones e manifest', () => {
  it('favicon SVG e PNG 32 no lugar do PNG 180; apple-touch-icon e status bar do iOS', () => {
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="favicon.svg">')
    expect(html).toContain('<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">')
    expect(html).toContain('<link rel="apple-touch-icon" href="icon-180.png">')
    expect(html).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')
  })
  it('todo arquivo de marca existe em brand/', () => {
    for (const f of [...BRAND_FILES, 'icon.svg', 'wordmark.svg']) expect(existsSync(join(REPO, 'brand', f)), f).toBe(true)
  })
  it('o manifest cita 192 e 512 "any" e 512 "maskable", todos em brand/', () => {
    const m = JSON.parse(readFileSync(join(REPO, 'brand/manifest.json'), 'utf8'))
    expect(m.icons.map(i => `${i.src} ${i.sizes} ${i.purpose}`)).toEqual([
      'icon-192.png 192x192 any', 'icon-512.png 512x512 any', 'icon-maskable-512.png 512x512 maskable',
    ])
    for (const i of m.icons) expect(BRAND_FILES).toContain(i.src)
    expect(m.theme_color).toBe('#050604')
    expect(m.background_color).toBe('#050604')
  })
})

describe('CSS da marca', () => {
  it('só o plugin do GYM 12 o importa, e só no boot.js', () => {
    const { transform } = gym12()
    const boot = join(FRONT, 'src/gym12/boot.js')
    expect(transform('export const a = 1', boot).code).toBe("import './gym12.css'\nexport const a = 1")
    expect(transform('x', boot + '?v=1').code).toMatch(/^import '\.\/gym12\.css'/)
    expect(transform('x', join(FRONT, 'src/main.jsx'))).toBe(null)
    expect(readFileSync(boot, 'utf8')).not.toMatch(/^import .*gym12\.css/m)
  })
  it('as fontes citadas existem, com as licenças OFL ao lado, e somam até 350 KB', () => {
    const css = readFileSync(join(FRONT, 'src/gym12/gym12.css'), 'utf8')
    const urls = [...css.matchAll(/url\(\.\/(fonts\/[^)]+\.woff2)\)/g)].map(m => m[1])
    expect(urls.length).toBe(8)
    let total = 0
    for (const u of urls) {
      const p = join(FRONT, 'src/gym12', u)
      expect(existsSync(p), u).toBe(true)
      total += readFileSync(p).length
    }
    expect(total).toBeLessThanOrEqual(350 * 1000)
    for (const f of ['OFL-Fraunces.txt', 'OFL-Geist.txt', 'OFL-JetBrainsMono.txt']) {
      expect(readFileSync(join(FRONT, 'src/gym12/fonts', f), 'utf8')).toMatch(/SIL Open Font License/)
    }
  })
})

describe('marca nas imagens de compartilhamento (lib/card-draw.js)', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules() })
  const fakeCtx = () => {
    const calls = []
    const ctx = { calls, font: '', fillStyle: '', textAlign: 'left', direction: 'ltr',
      fillText: (t, x) => calls.push({ t, x, font: ctx.font, fill: ctx.fillStyle }),
      measureText: t => ({ width: t.length * 20 }),
      save() {}, restore() {}, translate() {}, scale() {}, beginPath() { calls.push({ mark: true }) }, moveTo() {}, arcTo() {}, closePath() {}, fill() {} }
    return ctx
  }
  const colors = { acc: '#c4f439', accText: '#c4f439', label: '#ffffff', label2: '#98989f', light: false }
  it('GYM 12: "GYM" bone + "12" lime em Fraunces quando a fonte carregou, sem os halteres', async () => {
    vi.stubEnv('VITE_STANDALONE', '1')
    vi.stubGlobal('document', { fonts: { check: f => /Fraunces/.test(f) } })
    vi.resetModules()
    const { drawBrand } = await import('../lib/card-draw.js')
    const ctx = fakeCtx()
    drawBrand(ctx, { x: 10, y: 100, width: 900, colors, family: 'sans-serif', size: 40 })
    const [a, b] = ctx.calls.filter(c => c.t)
    expect(ctx.calls.some(c => c.mark)).toBe(false)
    expect(a).toMatchObject({ t: 'GYM ', x: 10, fill: '#f4f1ea', font: '700 40px Fraunces, sans-serif' })
    expect(b).toMatchObject({ t: '12', fill: '#c4f439' })
  })
  it('GYM 12 sem a Fraunces carregada: a fonte do cartão', async () => {
    vi.stubEnv('VITE_STANDALONE', '1')
    vi.stubGlobal('document', { fonts: { check: () => false } })
    vi.resetModules()
    const { drawBrand } = await import('../lib/card-draw.js')
    const ctx = fakeCtx()
    drawBrand(ctx, { x: 10, y: 100, width: 900, colors: { ...colors, light: true, label: '#000000' }, family: 'sans-serif', size: 40 })
    expect(ctx.calls.find(c => c.t === 'GYM ')).toMatchObject({ font: '800 40px sans-serif', fill: '#000000' })
  })
  it('fora do GYM 12: os halteres e "openGym" como antes', async () => {
    vi.resetModules()
    const { drawBrand } = await import('../lib/card-draw.js')
    const ctx = fakeCtx()
    drawBrand(ctx, { x: 10, y: 100, width: 900, colors, family: 'sans-serif', size: 40 })
    expect(ctx.calls.some(c => c.mark)).toBe(true)
    expect(ctx.calls.filter(c => c.t).map(c => c.t).slice(0, 2)).toEqual(['open', 'Gym'])
  })
  it('boot pede a Fraunces na abertura e não quebra sem document.fonts', async () => {
    const { loadBrandFont } = await import('./boot.js')
    const load = vi.fn(() => Promise.resolve([]))
    await loadBrandFont({ fonts: { load } })
    expect(load).toHaveBeenCalledWith('700 40px Fraunces', 'GYM 12')
    await expect(loadBrandFont({})).resolves.toBe(undefined)
    await expect(loadBrandFont({ fonts: { load: () => { throw new Error('x') } } })).resolves.toBe(null)
  })
})
