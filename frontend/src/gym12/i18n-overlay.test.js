// @vitest-environment happy-dom
// GYM 12: a camada de tradução (i18n-overlay.js) e a ligação dela em lib/i18n.js e i18n-core.js.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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
    expect(ov.names).toEqual({ 1000: 'Panturrilha teste' })
  })
  it('pt-BR: todo nome do pacote ganha a primeira letra maiúscula, e a revisão ganha do pacote', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_STANDALONE', '1')
    vi.doMock('./locales/pt-BR.names.js', () => ({ default: { 2: 'remada curvada com barra' } }))
    const { overlayFor } = await import('./i18n-overlay.js')
    const ov = await overlayFor('pt-BR', {}, { 1: 'supino com barra', 2: 'remada errada', 3: 'élévation teste', 4: '3/4 abdominal', 5: 'Agachamento no Smith' })
    expect(ov.names).toEqual({ 1: 'Supino com barra', 2: 'Remada curvada com barra', 3: 'Élévation teste', 4: '3/4 abdominal', 5: 'Agachamento no Smith' })
    // os outros idiomas não mudam a caixa
    expect((await overlayFor('es', {}, { 1: 'press de banca' })).names).toEqual({})
  })
})

describe('etiquetas de músculo e equipamento em pt-BR', () => {
  it('ganham só a 1ª letra maiúscula; frases que não são etiqueta não mudam; outros idiomas também não', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_STANDALONE', '1')
    const { overlayFor, tagKeys } = await import('./i18n-overlay.js')
    const keys = await tagKeys()
    for (const k of ['hamstrings', 'body weight', 'full body', 'cardiovascular system', 'already in']) expect(keys.has(k), k).toBe(true)
    const { ui } = await overlayFor('pt-BR', { 'body weight': 'peso corporal', 'full body': 'corpo inteiro', sets: 'séries', 'already in': 'já incluído' })
    expect(ui['body weight']).toBe('Peso corporal')
    expect(ui['full body']).toBe('Corpo inteiro')
    expect(ui.hamstrings).toBe('Posteriores de coxa')   // vem da camada (pt-BR.ui.js)
    expect(ui['already in']).toBe('Já incluído')
    expect(ui.sets).toBeUndefined()
    expect((await overlayFor('es', { 'body weight': 'peso corporal' })).ui['body weight']).toBeUndefined()
  })
  it('o CSS tira o capitalize das etiquetas só em pt-BR', () => {
    const css = readFileSync(join(process.cwd(), 'src/gym12/gym12.css'), 'utf8')
    expect(css).toMatch(/:root:lang\(pt-BR\) \.tag,\s*:root:lang\(pt-BR\) \.ss\.capitalize,\s*:root:lang\(pt-BR\) \.ss \.capitalize,\s*:root:lang\(pt-BR\) \.lib-filters \.chip,\s*:root:lang\(pt-BR\) \.lib-fsheet \.chip \{ text-transform: none \}/)
  })
})

describe('sentenceCase', () => {
  it('só a primeira letra, e só se for minúscula', async () => {
    const { sentenceCase } = await overlay(true)
    expect(sentenceCase('supino inclinado com halteres')).toBe('Supino inclinado com halteres')
    expect(sentenceCase('ágil')).toBe('Ágil')
    expect(sentenceCase('crucifixo na máquina (peck deck)')).toBe('Crucifixo na máquina (peck deck)')
    expect(sentenceCase('agachamento no smith com Kettlebell')).toBe('Agachamento no smith com Kettlebell')
    expect(sentenceCase('45° flexão')).toBe('45° flexão')
    expect(sentenceCase('')).toBe('')
    expect(sentenceCase(null)).toBe(null)
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
    expect(i18n.exerciseNameFor(ex)).toMatch(/^Nome revisado gym12/)
    expect(i18n.exerciseNameSearchText(ex)).toContain('Nome revisado gym12')
    await i18n.setLang('de')
    expect(i18n.t(KEY)).not.toMatch(/openGym/)
  })
  it('GYM 12: nomes pt-BR em sentence case, sem capitalize, e a busca acha sem acento nem caixa', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_STANDALONE', '1')
    const i18n = await import('../lib/i18n.js')
    const { searchExercises } = await import('../lib/exercises.js')
    await i18n.setLang('pt-BR', false)
    const pack = (await import('../exercise-names/pt-BR.js')).default
    const revised = (await import('./locales/pt-BR.names.js')).default
    const id = Object.keys(pack).find(k => !(k in revised) && /^\p{Ll}/u.test(pack[k]) && /[à-ú]/.test(pack[k]))
    const ex = { id, n: 'english title' }
    const shown = i18n.exerciseNameFor(ex)
    expect(shown[0]).toBe(pack[id][0].toLocaleUpperCase('pt-BR'))
    expect(shown.slice(1)).toBe(pack[id].slice(1))
    expect(i18n.exerciseNameClass(ex)).toBe('')
    // a busca normaliza caixa e acento: o nome em minúsculas e sem acento acha o exercício
    const query = pack[id].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    expect(searchExercises([ex], query).map(e => e.id)).toEqual([id])
    // um exercício sem nome no pacote continua com o título em inglês e o capitalize
    expect(i18n.exerciseNameClass({ id: 'zz-sem-nome', n: 'push-up' })).toBe('capitalize')
  })
  it('fora do GYM 12 o pt-BR segue em minúsculas com o capitalize do CSS', async () => {
    vi.resetModules()
    const i18n = await import('../lib/i18n.js')
    await i18n.setLang('pt-BR', false)
    const pack = (await import('../exercise-names/pt-BR.js')).default
    const id = Object.keys(pack).find(k => /^\p{Ll}/u.test(pack[k]))
    expect(i18n.exerciseNameFor({ id, n: 'english title' })).toBe(pack[id])
    expect(i18n.exerciseNameClass({ id, n: 'english title' })).toBe('capitalize')
  })
  it('fora do GYM 12 o inglês segue sem pacote e com o nome original', async () => {
    vi.resetModules()
    const i18n = await import('../lib/i18n.js')
    await i18n.setLang('de')
    await i18n.setLang('en')
    expect(i18n.t(KEY)).toBe(KEY)
  })
})