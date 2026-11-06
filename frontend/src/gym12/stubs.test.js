// @vitest-environment happy-dom
// GYM 12: os stubs que o plugin põe no lugar de IA, admin, demo e mapa exportam exatamente os
// mesmos nomes dos originais (senão um import do app quebraria só no build do GYM 12).
import { describe, expect, it, vi } from 'vitest'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { STUBS } from './vite-plugin.js'

vi.mock('leaflet', () => ({ default: {} }))

const SRC = join(process.cwd(), 'src')
const rel = p => p.slice(SRC.length + 1)

describe('stubs do GYM 12', () => {
  const pairs = Object.entries(STUBS)
  it('cobrem as oito trocas e os arquivos existem', () => {
    expect(pairs.map(([o]) => rel(o)).sort()).toEqual([
      'components/GymMap.jsx', 'lib/coach-demo.js', 'lib/coach-local.js', 'lib/demoSeed.js',
      'views/Admin.jsx', 'views/CoachChat.jsx', 'views/CoachIntake.jsx', 'views/CoachSetup.jsx',
    ])
    for (const [o, s] of pairs) { expect(existsSync(o), o).toBe(true); expect(existsSync(s), s).toBe(true) }
  })
  for (const [orig, stub] of pairs) {
    it(`${rel(orig)}: mesmos exports`, async () => {
      const [a, b] = await Promise.all([import(/* @vite-ignore */ orig), import(/* @vite-ignore */ stub)])
      expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort())
    }, 30000)
  }
  it('demoSeed vazio: o GYM 12 começa sem dados de exemplo', async () => {
    const { buildDemoState } = await import('./stubs/demoSeed.js')
    expect(buildDemoState()).toEqual({})
  })
  it('nenhum stub cita provedor de IA', async () => {
    const { readFileSync } = await import('node:fs')
    for (const s of new Set(Object.values(STUBS))) expect(readFileSync(s, 'utf8')).not.toMatch(/anthropic|openai|generativelanguage|openrouter/)
  })
})