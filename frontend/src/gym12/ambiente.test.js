// GYM 12: travas do ambiente de teste (função pura e plugin), troca da variante da tela de Licenças
// e checagens do pós-build ligadas às licenças e à mídia.
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import gym12, { checarAmbiente, licencaTesteLigada, noindexHtml, ROBOTS_META, LICENCAS, LICENCAS_TESTE, TESTE_BANNER, pacotesNoBundle, biblioteca, LICENCA_ARQUIVOS, TERCEIROS } from './vite-plugin.js'
import { checkFiles, checkLicencas, lazyExtras } from './scripts/postbuild.mjs'

const FRONT = resolve(process.cwd())

const PROD_ERR = 'VITE_TESTE_LICENCA só pode ser ligada no build do ambiente de teste (GYM12_AMBIENTE=teste). O build de produção não aceita essa variável.'

describe('travas do ambiente (checarAmbiente)', () => {
  it('produção com a flag: recusa com a mensagem exata', () => {
    expect(checarAmbiente({ VITE_TESTE_LICENCA: '1' })).toBe(PROD_ERR)
    expect(checarAmbiente({ VITE_TESTE_LICENCA: '1', GYM12_AMBIENTE: 'producao' })).toBe(PROD_ERR)
    expect(checarAmbiente({ VITE_TESTE_LICENCA: 'true', GYM12_AMBIENTE: '' })).toBe(PROD_ERR)
  })
  it('teste com a flag: passa; no Cloudflare só no branch teste-licenca', () => {
    expect(checarAmbiente({ VITE_TESTE_LICENCA: '1', GYM12_AMBIENTE: 'teste' })).toBe(null)
    expect(checarAmbiente({ VITE_TESTE_LICENCA: '1', GYM12_AMBIENTE: 'teste', CF_PAGES_BRANCH: 'teste-licenca' })).toBe(null)
    const err = checarAmbiente({ VITE_TESTE_LICENCA: '1', GYM12_AMBIENTE: 'teste', CF_PAGES_BRANCH: 'gym12' })
    expect(err).toMatch(/VITE_TESTE_LICENCA só pode ser ligada no branch teste-licenca/)
    expect(err).toMatch(/gym12/)
    expect(err).toMatch(/O build de produção não aceita essa variável\./)
  })
  it('sem a flag (vazia ou "0"): nada a recusar, em qualquer ambiente', () => {
    for (const env of [{}, { VITE_TESTE_LICENCA: '' }, { VITE_TESTE_LICENCA: '0' }, { GYM12_AMBIENTE: 'teste' }, { CF_PAGES_BRANCH: 'gym12' }])
      expect(checarAmbiente(env)).toBe(null)
    expect(licencaTesteLigada({ VITE_TESTE_LICENCA: '0' })).toBe(false)
  })
  it('noindex do ambiente de teste no index.html', () => {
    expect(noindexHtml('<html><head><title>x</title></head>')).toContain('<head>\n' + ROBOTS_META)
    expect(ROBOTS_META).toBe('<meta name="robots" content="noindex, nofollow">')
    expect(() => noindexHtml('<html>')).toThrow(/head/)
  })
})

describe('plugin: build de produção com a flag e troca da variante', () => {
  const keys = ['VITE_TESTE_LICENCA', 'GYM12_AMBIENTE', 'CF_PAGES_BRANCH']
  let saved
  beforeEach(() => { saved = Object.fromEntries(keys.map(k => [k, process.env[k]])); keys.forEach(k => delete process.env[k]) })
  afterEach(() => { for (const k of keys) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k] } })
  const ctx = { resolve: async () => ({ id: LICENCAS }) }

  it('o build de produção com VITE_TESTE_LICENCA=1 falha no config', () => {
    process.env.VITE_TESTE_LICENCA = '1'
    expect(() => gym12().config({ root: FRONT }, { mode: 'production' })).toThrow(PROD_ERR)
  })
  it('produção: o import de Licencas.jsx fica como está (a variante nunca é resolvida)', async () => {
    const p = gym12()
    const out = p.config({ root: FRONT }, { mode: 'production' })
    expect(JSON.parse(out.define.__GYM12_COMMIT__)).toMatch(/^[0-9a-f]{7,}$|^desconhecido$/)
    expect(await p.resolveId.call(ctx, '../gym12/Licencas.jsx', join(FRONT, 'src/views/Settings.jsx'), {})).toBe(null)
  })
  it('teste: Settings recebe a variante; a variante continua importando a tela normal', async () => {
    process.env.VITE_TESTE_LICENCA = '1'; process.env.GYM12_AMBIENTE = 'teste'
    const p = gym12()
    p.config({ root: FRONT }, { mode: 'production' })
    expect(await p.resolveId.call(ctx, '../gym12/Licencas.jsx', join(FRONT, 'src/views/Settings.jsx'), {})).toBe(LICENCAS_TESTE)
    expect(await p.resolveId.call(ctx, './Licencas.jsx', LICENCAS_TESTE, {})).toBe(null)
  })
})

describe('variante de teste', () => {
  it('a variante de teste traz a faixa e nunca é importada fora dela', () => {
    const v = readFileSync(join(FRONT, 'src/gym12/LicencasTeste.jsx'), 'utf8')
    expect(v).toMatch(/TESTE_BANNER/)
    expect(TESTE_BANNER).toBe('Ambiente de teste — variação da tela de Licenças (conteúdo a definir pelo time)')
    for (const f of ['src/views/Settings.jsx', 'src/views/settings-pages.js', 'src/gym12/SettingsBits.jsx', 'src/gym12/Licencas.jsx'])
      expect(readFileSync(join(FRONT, f), 'utf8'), f).not.toMatch(/LicencasTeste|teste-licenca/)
  })
})

describe('pós-build: licenças e mídia', () => {
  const file = (rel, text = '') => ({ rel, abs: rel, size: text.length, text })
  const check = (files, opts = {}) => checkFiles(files, { read: f => f.text, ...opts })
  it('mídia sem o exercise-media/NOTICE.md derruba o build', () => {
    expect(check([file('exercise-media/still/a.webp')])[0]).toMatch(/NOTICE\.md/)
    expect(check([file('exercise-media/still/a.webp'), file('exercise-media/NOTICE.md', '©')])).toEqual([])
    expect(check([file('index.html')])).toEqual([])   // sem mídia, nada a exigir
  })
  it('a faixa da variante de teste derruba o build de produção, não o de teste', () => {
    const f = [file('assets/x.js', `const a="${TESTE_BANNER}"`)]
    expect(check(f)[0]).toMatch(/variante de teste/)
    expect(check(f, { teste: true })).toEqual([])
  })
  it('exige os textos de licencas/ e os põe na LAZY', () => {
    const all = [...Object.keys(LICENCA_ARQUIVOS), TERCEIROS].map(r => file(r))
    expect(checkLicencas(all)).toEqual([])
    expect(checkLicencas(all.slice(1))[0]).toMatch(/licencas\/LICENSE\.txt/)
    expect(lazyExtras(all, { ptBR: [] }, '')).toEqual(all.map(f => './' + f.rel))
  })
  it('bibliotecas do bundle: pacote mais interno, escopo e licença do package.json', () => {
    const nm = join(FRONT, 'node_modules')
    const bundle = {
      'a.js': { type: 'chunk', moduleIds: [join(nm, 'react/index.js'), join(nm, 'react-router-dom/dist/index.mjs'), '\0vite/preload-helper', join(FRONT, 'src/main.jsx')] },
      'b.js': { type: 'chunk', moduleIds: [join(nm, '@capacitor/core/dist/index.js'), join(nm, 'x/node_modules/react/index.js')] },
      'c.css': { type: 'asset' },
    }
    const p = pacotesNoBundle(bundle)
    expect(Object.keys(p).sort()).toEqual(['@capacitor/core', 'react', 'react-router-dom'])
    expect(p.react).toBe(join(nm, 'react'))
    const r = biblioteca('react', p.react, ['react'])
    expect(r).toMatchObject({ nome: 'react', licenca: 'MIT', direta: true })
    expect(r.copyright).toMatch(/^Copyright/)
    expect(r.texto).toMatch(/Permission is hereby granted/)
  })
})
