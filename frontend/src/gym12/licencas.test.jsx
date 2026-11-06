// @vitest-environment happy-dom
// GYM 12: a tela de Licenças e o bloco da versão em Ajustes → Sobre.
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const REPO = resolve(process.cwd(), '..')

describe('tela de Licenças', () => {
  const textos = { 'licencas/LICENSE.txt': 'GNU AFFERO GENERAL PUBLIC LICENSE\nVersion 3', 'licencas/NOTICE.md': '# Third-party notices\nMuscleMap', 'licencas/terceiros.json': JSON.stringify([{ nome: 'react', versao: '19.0.0', licenca: 'MIT', copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.', texto: 'MIT License' }]) }
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async url => ({ ok: url in textos, status: url in textos ? 200 : 404, text: async () => textos[url], json: async () => JSON.parse(textos[url]) })))
  })
  afterEach(() => vi.unstubAllGlobals())

  const mount = async El => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => root.render(El))
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    return { host, root }
  }

  it('mostra as seções na ordem, a frase exata, o link do código, versão e commit', async () => {
    const { default: Licencas, FRASE_BASE } = await import('./Licencas.jsx')
    const { host, root } = await mount(<Licencas />)
    expect(FRASE_BASE).toBe('GYM 12 é baseado no openGym, de Duarte Santos, licenciado sob a GNU AGPL-3.0, sem nenhuma garantia.')
    const text = host.textContent
    const order = [FRASE_BASE, 'Código-fonte do GYM 12', 'Versão ', 'Você pode copiar, modificar e redistribuir o GYM 12 nos termos da GNU AGPL-3.0.',
      'Licença GNU AGPL-3.0 (texto completo)', 'Avisos de terceiros', 'Animações e imagens dos exercícios', 'NOTICE TO DEVELOPERS', 'Fontes', 'SIL Open Font License 1.1', 'Bibliotecas', 'react 19.0.0']
    let at = -1
    for (const s of order) { const i = text.indexOf(s, at + 1); expect(i, s).toBeGreaterThan(at); at = i }
    expect(text).toMatch(/Versão [\d.]+ · commit \S+/)
    const hrefs = [...host.querySelectorAll('a')].map(a => a.getAttribute('href'))
    expect(hrefs).toContain('https://github.com/poweradyl/gym12')
    expect(hrefs).toContain('https://gymvisual.com/')
    act(() => root.unmount())
  })
  it('abre o texto da AGPL e o NOTICE.md (fechados até tocar)', async () => {
    const { default: Licencas } = await import('./Licencas.jsx')
    const { host, root } = await mount(<Licencas />)
    expect(host.querySelector('pre')).toBe(null)
    const toggle = label => [...host.querySelectorAll('button.g12-lic-toggle')].find(b => b.textContent.includes(label))
    await act(async () => toggle('Licença GNU AGPL-3.0').click())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(host.querySelector('pre').textContent).toMatch(/AFFERO/)
    await act(async () => toggle('Avisos de terceiros').click())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect([...host.querySelectorAll('pre')].map(p => p.textContent).join()).toMatch(/MuscleMap/)
    act(() => root.unmount())
  })
  it('o aviso da mídia é o parágrafo do catalogue/media/NOTICE.md, sem mudar nada', async () => {
    const { avisoMidia } = await import('./Licencas.jsx')
    const src = readFileSync(join(REPO, 'catalogue/media/NOTICE.md'), 'utf8')
    const a = avisoMidia()
    expect(a.startsWith('© Aliaksandr Makatserchyk, Gym visual, gymvisual.com')).toBe(true)
    expect(a).toMatch(/NOTICE TO DEVELOPERS: The exercise animations included in this project are provided strictly for use within the openGym application\./)
    expect(src).toContain(a)
  })
})

describe('Sobre: bloco da versão do GYM 12', () => {
  it('sem openGym, com a atribuição e o "Ver licenças"', async () => {
    const { SobreVersao, MIDIA_CREDITO } = await import('./SettingsBits.jsx')
    const open = vi.fn()
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(<SobreVersao version="1.4.4" license="livre" open={open} />))
    expect(host.textContent).toContain('GYM 12 v1.4.4')
    expect(host.textContent).toContain(MIDIA_CREDITO)
    expect(MIDIA_CREDITO).toBe('Animações dos exercícios © Aliaksandr Makatserchyk, Gym visual, gymvisual.com.')
    expect(host.textContent).not.toMatch(/opengym/i)
    const link = [...host.querySelectorAll('a')].find(a => a.textContent === 'Ver licenças')
    act(() => link.click())
    expect(open).toHaveBeenCalled()
    act(() => root.unmount())
  })
})

