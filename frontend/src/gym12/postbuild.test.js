// GYM 12: as checagens e a LAZY do pós-build (scripts/postbuild.mjs) e o index.html do plugin.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkFiles, strayOpengym, readLazy, addToLazy, lazyExtras, MAX_FILES, MAX_BYTES } from './scripts/postbuild.mjs'
import { brandHtml, buildInfo, DESCRIPTION } from './vite-plugin.js'
import { stampSw } from '../../scripts/sw-stamp.mjs'

const file = (rel, text = '', size = text.length) => ({ rel, abs: rel, size, text })
const check = (files, opts = {}) => checkFiles(files, { read: f => f.text, ...opts })

describe('checagens do dist', () => {
  it('dist limpo passa', () => {
    expect(check([file('index.html', '<html>'), file('assets/a.js', 'const x=1')])).toEqual([])
  })
  it('recusa endereço de provedor de IA em qualquer arquivo de texto', () => {
    for (const url of ['https://api.anthropic.com/v1', 'https://api.openai.com/v1', 'generativelanguage.googleapis.com', 'https://openrouter.ai'])
      expect(check([file('assets/x.js', `fetch("${url}")`)])).toHaveLength(1)
    expect(check([file('assets/x.css', 'a{background:url(https://api.openai.com/x)}')])).toHaveLength(1)
    expect(check([file('assets/x.webp', 'api.openai.com')])).toEqual([])   // binário não é lido
  })
  it('recusa opengym.ch solto no JS, aceita os pacotes de tradução e as ocorrências revisadas', () => {
    expect(check([file('assets/s.js', 'window.open(`https://opengym.ch/#download`)')])).toHaveLength(1)
    expect(check([file('assets/de.js', '"Download the APK from opengym.ch":`x`')], { packs: ['assets/de.js'] })).toEqual([])
    expect(check([file('assets/s.js', 'return t.hostname.toLowerCase().replace(/^www\\./,``)!==`opengym.ch`||x')])).toEqual([])
    expect(check([file('assets/s.js', 'var Ll=`opengym.ch`,Rl=`/nfc`,zl=1')])).toEqual([])
    expect(check([file('assets/s.js', 'Ui=`openGym/1.4.4 (gym reminder; +https://opengym.ch)`')])).toEqual([])
    expect(check([file('exercise-media/NOTICE.md', 'see opengym.ch')])).toEqual([])   // só JS conta
    expect(strayOpengym('a opengym.ch b')).toHaveLength(1)
  })
  it('recusa mais de 20.000 arquivos e arquivo acima de 25 MiB', () => {
    const many = Array.from({ length: MAX_FILES + 1 }, (_, i) => file(`m/${i}.webp`, '', 10))
    expect(check(many)[0]).toMatch(/20000/)
    expect(check(many.slice(0, MAX_FILES))).toEqual([])
    expect(check([file('big.mp4', '', MAX_BYTES + 1)])[0]).toMatch(/25 MiB/)
    expect(check([file('ok.mp4', '', MAX_BYTES)])).toEqual([])
  })
})

describe('LAZY do service worker', () => {
  const sw = stampSw("const CACHE = 'x-__BUILD__'\nconst LAZY = '__LAZY__'\n", { stamp: 'abc', lazy: ['./assets/a.js'] })
  it('lê e acrescenta sem repetir', () => {
    expect(readLazy(sw)).toEqual(['./assets/a.js'])
    const { sw: next, added } = addToLazy(sw, ['./assets/pt-BR-1.js', './assets/a.js', './assets/pt-BR-1.js'])
    expect(added).toEqual(['./assets/pt-BR-1.js'])
    expect(readLazy(next)).toEqual(['./assets/a.js', './assets/pt-BR-1.js'])
    expect(addToLazy(next, ['./assets/a.js']).added).toEqual([])
  })
  it('falha num sw.js sem carimbo', () => {
    expect(() => readLazy("const LAZY = '__LAZY__'")).toThrow()
  })
  it('pede os chunks pt-BR e as woff2 que o index.html não cita', () => {
    const files = [file('assets/f.woff2'), file('assets/g.woff2'), file('assets/x.js')]
    expect(lazyExtras(files, { ptBR: ['assets/pt-BR-1.js'] }, '<link href="./assets/g.woff2">'))
      .toEqual(['./assets/pt-BR-1.js', './assets/f.woff2'])
  })
  it('buildInfo: pacotes de tradução e o fecho dos chunks pt-BR', () => {
    const bundle = {
      'assets/pt-BR-1.js': { type: 'chunk', moduleIds: ['/r/frontend/src/locales/pt-BR.js'], imports: ['assets/pt-2.js'] },
      'assets/pt-2.js': { type: 'chunk', moduleIds: ['/r/frontend/src/locales/pt.js'], imports: [] },
      'assets/ui-3.js': { type: 'chunk', moduleIds: ['/r/frontend/src/gym12/locales/pt-BR.ui.js'], imports: [] },
      'assets/de-4.js': { type: 'chunk', moduleIds: ['/r/frontend/src/locales/de.js'], imports: [] },
      'assets/index-5.js': { type: 'chunk', moduleIds: ['/r/frontend/src/main.jsx', '/r/frontend/src/locales/en.js'], imports: [] },
      'assets/a.css': { type: 'asset' },
    }
    expect(buildInfo(bundle)).toEqual({
      packs: ['assets/de-4.js', 'assets/pt-2.js', 'assets/pt-BR-1.js', 'assets/ui-3.js'],
      ptBR: ['assets/pt-2.js', 'assets/pt-BR-1.js'],
    })
  })
})

describe('index.html do GYM 12', () => {
  const html = brandHtml(readFileSync(join(process.cwd(), 'index.html'), 'utf8'))
  it('título, descrição, cor, idioma e vigia em pt-BR', () => {
    expect(html).toContain('<html lang="pt-BR">')
    expect(html).toContain('<title>GYM 12</title>')
    expect(html).toContain(`<meta name="description" content="${DESCRIPTION}">`)
    expect(html).toContain('<meta name="theme-color" content="#050604">')
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="GYM 12">')
    expect(html).toContain('O GYM 12 não conseguiu abrir neste navegador.')
    expect(html).toContain('O GYM 12 está demorando demais para abrir.')
    expect(html).toContain("'Recarregar'")
    expect(html).not.toMatch(/openGym/)
  })
  it('recusa um index.html que mudou', () => {
    expect(() => brandHtml('<html lang="en"><title>x</title>')).toThrow(/index\.html mudou/)
  })
})
