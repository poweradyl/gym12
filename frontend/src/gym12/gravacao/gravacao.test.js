// @vitest-environment happy-dom
// GYM 12 · gravação: o build de gravação do Reel (histórico de exemplo, relógio, plugin, ganchos,
// gravador) e o que ele NÃO pode mudar no build de produção.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const HERE = import.meta.dirname
const read = f => readFileSync(join(HERE, f), 'utf8')
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); localStorage.clear() })

// O relógio da gravação: sexta-feira, 06/11/2026, 18:30 em Brasília.
const HOJE = new Date('2026-11-06T18:30:00-03:00')

describe('histórico de exemplo da gravação (seed.js)', () => {
  const seed = async () => (await import('./seed.js')).buildDemoState(HOJE)

  it('Treino A, B e C, com o Treino A da ficha do vídeo na ordem', async () => {
    const s = await seed()
    expect(s.routines.map(r => r.name)).toEqual(['Treino A', 'Treino B', 'Treino C'])
    expect(s.routines[0].ex).toEqual([
      { id: '0025', sets: 4, reps: 10, weight: 40 },
      { id: '0314', sets: 3, reps: 12, weight: 16 },
      { id: '0596', sets: 3, reps: 12, weight: 0 },
      { id: '0200', sets: 3, reps: 12, weight: 25 },
      { id: '0430', sets: 3, reps: 10, weight: 0 },
    ])
    // Sexta (hoje) é A, segunda B, quarta C.
    expect(s.week).toEqual({ 5: 'g12-treino-a', 1: 'g12-treino-b', 3: 'g12-treino-c' })
  })

  it('os exercícios existem no catálogo e o app os mostra com estes nomes em pt-BR', async () => {
    const { EXDB } = await import('../../lib/exercises-data.js')
    const pack = (await import('../../exercise-names/pt-BR.js')).default
    const rev = (await import('../locales/pt-BR.names.js')).default
    const { sentenceCase } = await import('../i18n-overlay.js')
    const { ROTINAS } = await import('./seed.js')
    const nome = id => sentenceCase(rev[id] || pack[id])
    const ids = new Set(EXDB.map(e => e.id))
    for (const r of ROTINAS) for (const [id] of r.ex) expect(ids.has(id), id).toBe(true)
    expect(ROTINAS[0].ex.map(([id]) => nome(id))).toEqual([
      'Supino reto com barra', 'Supino inclinado com halteres', 'Crucifixo na máquina',
      'Tríceps pulley com corda', 'Tríceps francês em pé com halter',
    ])
    expect(ROTINAS[1].ex.map(([id]) => nome(id))).toEqual([
      'Puxada frontal no cabo', 'Remada baixa no cabo', 'Remada curvada com barra', 'Rosca direta com barra', 'Rosca martelo com halteres',
    ])
    expect(ROTINAS[2].ex.map(([id]) => nome(id))).toEqual([
      'Agachamento livre com barra', 'Leg press 45°', 'Cadeira extensora', 'Mesa flexora', 'Panturrilha no leg press 45°',
    ])
  })

  it('9 semanas de treino, 25 sessões, todas antes de hoje, a primeira em 04/09', async () => {
    const s = await seed()
    expect(s.workouts).toHaveLength(25)
    expect(s.workouts[0].d).toBe('2026-09-04')
    expect(s.workouts.every(w => w.d < '2026-11-06')).toBe(true)
    expect([...s.workouts].sort((a, b) => a.start - b.start).map(w => w.id)).toEqual(s.workouts.map(w => w.id))
    // B não aconteceu em 12/10 e C em 28/10.
    expect(s.workouts.some(w => w.d === '2026-10-12' || w.d === '2026-10-28')).toBe(false)
  })

  it('supino reto: a carga sobe até 40 kg × 10 na última sessão, e 42,5 hoje é recorde', async () => {
    const s = await seed()
    const sup = s.workouts.filter(w => w.entries.some(e => e.id === '0025')).map(w => ({ d: w.d, sets: w.entries.find(e => e.id === '0025').sets }))
    expect(sup.map(x => x.sets[0].w)).toEqual([30, 30, 32.5, 32.5, 35, 35, 37.5, 37.5, 40])
    const ultima = sup[sup.length - 1]
    expect(ultima.d).toBe('2026-10-30')
    expect(ultima.sets.map(x => [x.w, x.r])).toEqual([[40, 10], [40, 10], [40, 9], [40, 8]])
    expect(s.exWeights['0025'].w).toBe(40)
    expect(Math.max(...sup.flatMap(x => x.sets.map(y => y.w)))).toBeLessThan(42.5)
  })

  it('no Treino A a última sessão é de carga nova em todos os exercícios (hoje só o supino vira recorde)', async () => {
    const { CARGAS, ROTINAS } = await import('./seed.js')
    for (const [id] of ROTINAS[0].ex) expect(CARGAS[id][8], id).toBeGreaterThan(CARGAS[id][7])
  })

  it('nada de peso corporal, medidas ou fotos; pt-BR; sem a dica de deslizar', async () => {
    const s = await seed()
    expect(s.bodyweight).toEqual([])
    expect(s.measurements).toEqual([])
    expect(s.targetW).toBe(null)
    expect(s.modules).toEqual({ body: false, strength: false })
    expect(s.weighIn).toBe(false)
    expect(s.showWeightCard).toBe(false)
    expect(s.workouts.every(w => !('bw' in w))).toBe(true)
    expect(s.lang).toBe('pt-BR')
    expect(s.enParens).toEqual({ 'pt-BR': false })
    expect(s.hints).toEqual({ swipeSets: true })
  })

  it('determinístico: a mesma data dá o mesmo histórico', async () => {
    const { buildDemoState } = await import('./seed.js')
    expect(JSON.stringify(buildDemoState(HOJE))).toBe(JSON.stringify(buildDemoState(new Date(HOJE))))
  })
})

describe('relógio da gravação (relogio.js)', () => {
  const carregar = async () => { globalThis.__G12_RELOGIO_LIVRE__ = true; try { return await import('./relogio.js') } finally { delete globalThis.__G12_RELOGIO_LIVRE__ } }

  it('o Date começa em 06/11/2026 18:30 (Brasília) e anda com o relógio de verdade', async () => {
    const { fixarRelogio, RELOGIO } = await carregar()
    expect(RELOGIO).toBe('2026-11-06T18:30:00-03:00')
    const g = { Date }
    expect(fixarRelogio(g)).toBe(true)
    const agora = g.Date.now()
    expect(Math.abs(agora - Date.parse(RELOGIO))).toBeLessThan(1000)
    const d = new g.Date()
    expect(d instanceof Date).toBe(true)
    expect(d instanceof g.Date).toBe(true)
    expect(Math.abs(d.getTime() - Date.parse(RELOGIO))).toBeLessThan(1000)
    expect(new g.Date(2020, 0, 2).getFullYear()).toBe(2020)
    expect(g.Date.parse('2026-01-01T00:00:00Z')).toBe(Date.UTC(2026, 0, 1))
    expect(typeof g.Date()).toBe('string')
    expect(fixarRelogio(g)).toBe(false)   // já fixado
  })

  it('com __G12_RELOGIO_LIVRE__ (o gravador, que usa o page.clock) não mexe em nada', async () => {
    const { fixarRelogio, LIVRE } = await carregar()
    const g = { Date, [LIVRE]: true }
    expect(fixarRelogio(g)).toBe(false)
    expect(g.Date).toBe(Date)
  })

  it('importar o módulo com o relógio livre deixa o Date do processo intacto', async () => {
    const antes = Date
    await carregar()
    expect(Date).toBe(antes)
  })
})

describe('plugin e configuração do build de gravação', () => {
  it('o stub vazio passa a reexportar o histórico da gravação; o boot importa relógio, ganchos e CSS', async () => {
    const { default: gravacao, STUB, BOOT, STUB_CODE, BOOT_IMPORTS } = await import('./vite-plugin.js')
    const p = gravacao()
    expect(p.enforce).toBe('pre')
    expect(STUB.endsWith(join('gym12', 'stubs', 'demoSeed.js'))).toBe(true)
    expect(p.load(STUB).code).toBe(STUB_CODE)
    expect(STUB_CODE).toMatch(/export \{ buildDemoState \} from '\.\.\/gravacao\/seed\.js'/)
    expect(p.load(STUB + '?v=1').code).toBe(STUB_CODE)
    expect(p.load(join(HERE, '..', '..', 'lib', 'demoSeed.js'))).toBe(null)
    const t = p.transform('export const x = 1\n', BOOT)
    expect(t.code).toBe(BOOT_IMPORTS + 'export const x = 1\n')
    expect(BOOT_IMPORTS.split('\n').filter(Boolean)).toEqual(["import './gravacao/relogio.js'", "import './gravacao/ganchos.js'", "import './gravacao/gravacao.css'"])
    expect(p.transform('x', join(HERE, 'seed.js'))).toBe(null)
  })

  it('vite.gravacao.config.js: sobre o do GYM 12, flag própria, saída e porta próprias', () => {
    const src = readFileSync(join(HERE, '../../../vite.gravacao.config.js'), 'utf8')
    expect(src).toMatch(/import gym12 from '\.\/vite\.gym12\.config\.js'/)
    expect(src).toMatch(/plugins: \[gravacao\(\)\]/)
    expect(src).toMatch(/__GYM12_GRAVACAO__: 'true'/)
    expect(src).toMatch(/outDir: 'dist-gravacao'/)
    expect(src).toMatch(/host: '127\.0\.0\.1', port: 4430/)
  })

  it('o build de produção não conhece a gravação', () => {
    const cfg = readFileSync(join(HERE, '../../../vite.gym12.config.js'), 'utf8')
    const plugin = readFileSync(join(HERE, '../vite-plugin.js'), 'utf8')
    expect(cfg).not.toMatch(/gravacao|GRAVACAO/)
    expect(plugin).not.toMatch(/gravacao|GRAVACAO/)
  })

  it('GRAVACAO é falso fora do build de gravação (vitest, produção, upstream)', async () => {
    vi.stubEnv('VITE_STANDALONE', '1')
    const { GRAVACAO, STANDALONE } = await import('../flags.js')
    expect(STANDALONE).toBe(true)
    expect(GRAVACAO).toBe(false)
  })
})

describe('boot do GYM 12 no build de gravação', () => {
  it('não grava gym_demo_seeded_v1 (o boot demo semeia o histórico); o idioma continua pt-BR', async () => {
    const { seedKeys, SEEDED_KEY, LANG_KEY } = await import('../boot.js')
    seedKeys(localStorage, { gravacao: true })
    expect(localStorage.getItem(SEEDED_KEY)).toBe(null)
    expect(localStorage.getItem(LANG_KEY)).toBe('pt-BR')
  })
  it('fora dele continua gravando (o GYM 12 começa vazio)', async () => {
    const { seedKeys, SEEDED_KEY } = await import('../boot.js')
    seedKeys(localStorage)
    expect(localStorage.getItem(SEEDED_KEY)).toBe('1')
  })
})

describe('ganchos do gravador (ganchos.js)', () => {
  it('esvaziar, acrescentar e ler a rotina pelo update do store', async () => {
    const { ganchos } = await import('./ganchos.js')
    let S = { routines: [{ id: 'r', ex: [{ id: '0025', sets: 4, reps: 10, weight: 40 }] }] }
    const store = { getState: () => ({ S, update: fn => { const d = structuredClone(S); fn(d); S = d } }) }
    const g = ganchos(async () => store)
    const ex = await g.exerciciosDa('r')
    await g.esvaziar('r')
    expect(S.routines[0].ex).toEqual([])
    await g.acrescentar('r', ex[0])
    expect(S.routines[0].ex).toEqual([{ id: '0025', sets: 4, reps: 10, weight: 40 }])
    expect(S.routines[0].ex[0]).not.toBe(ex[0])
    await expect(g.esvaziar('x')).rejects.toThrow(/rotina não encontrada/)
  })
  it('window.__g12gravacao existe quando o módulo carrega', async () => {
    await import('./ganchos.js')
    expect(typeof window.__g12gravacao.acrescentar).toBe('function')
  })
})

describe('gravador (gravar.mjs)', () => {
  it('30 fps sem erro acumulado, easing de 0 a 1, retângulos em pixels do quadro', async () => {
    const { tempoDo, suave, px, FPS, VW, VH, DSF } = await import('./gravar.mjs')
    expect(FPS).toBe(30)
    expect([VW * DSF, VH * DSF]).toEqual([1170, 2532])
    expect(tempoDo(0)).toBe(0)
    expect(tempoDo(30)).toBe(1000)
    expect(tempoDo(149)).toBe(4967)
    const passos = Array.from({ length: 150 }, (_, f) => tempoDo(f + 1) - tempoDo(f))
    expect(passos.every(d => d === 33 || d === 34)).toBe(true)
    expect(suave(0)).toBe(0)
    expect(suave(1)).toBe(1)
    for (let i = 1; i <= 20; i++) expect(suave(i / 20)).toBeGreaterThanOrEqual(suave((i - 1) / 20))
    expect(px({ x: 16, y: 10.4, w: 358, h: 40 })).toEqual([48, 31, 1074, 120])
    expect(px(null)).toBe(null)
  })
  it('as sete gravações do plano, cada uma entre 2 e 5 s, e o borrado só nas mídias', async () => {
    const { TOMADAS, BLUR_CSS } = await import('./gravar.mjs')
    expect(Object.keys(TOMADAS)).toEqual(['inicio', 'rotina', 'iniciar', 'carga', 'descanso', 'recorde', 'grafico'])
    expect(BLUR_CSS).toBe('img, video, canvas { filter: blur(28px) !important; transition: none !important }')
    const src = read('gravar.mjs')
    for (const m of src.matchAll(/await t\.ate\((\d+)/g)) expect(Number(m[1]) + 1).toBeLessThanOrEqual(150)
  })
  it('só abre localhost e bloqueia o resto da rede', () => {
    const src = read('gravar.mjs')
    expect(src).toMatch(/const LOCAL = new Set\(\['127\.0\.0\.1', 'localhost', '\[::1\]'\]\)/)
    expect(src).toMatch(/return r\.abort\('blockedbyclient'\)/)
    expect(src).toMatch(/serviceWorkers: 'block'/)
    expect(src).toMatch(/o gravador só abre o build de gravação em localhost/)
  })
})
