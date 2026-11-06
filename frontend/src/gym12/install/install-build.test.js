// GYM 12: a captura do celular da página de instalação (brand/install-screen.webp), a cópia para o
// dist (vite-plugin.js) e o precache no service worker (scripts/postbuild.mjs).
import { readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { INSTALL_FILES, BRAND_FILES } from '../vite-plugin.js'
import { lazyExtras } from '../scripts/postbuild.mjs'
import { SCREEN_W, SCREEN_H } from './InstallLanding.jsx'

const REPO = resolve(process.cwd(), '..')

/** Largura e altura de um WebP (VP8 com perda, VP8L sem perda ou VP8X estendido). */
function webpSize(b) {
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null
  const kind = b.toString('ascii', 12, 16)
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]
  if (kind === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1] }
  return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)]
}

describe('a captura do celular (brand/install-screen.webp)', () => {
  const file = join(REPO, 'brand/install-screen.webp')
  it('existe, é WebP do tamanho que a página declara e tem no máximo 80 KB', () => {
    expect(statSync(file).size).toBeLessThanOrEqual(80 * 1024)
    expect(webpSize(readFileSync(file))).toEqual([SCREEN_W, SCREEN_H])
    expect([SCREEN_W, SCREEN_H]).toEqual([440, 926])
  })
  it('o plugin a copia para a raiz do dist, fora da lista dos ícones', () => {
    expect(INSTALL_FILES).toEqual(['install-screen.webp'])
    expect(BRAND_FILES).not.toContain('install-screen.webp')
  })
  it('o pós-build a põe na LAZY do service worker (só ela, de imagem)', () => {
    expect(lazyExtras([{ rel: 'install-screen.webp' }, { rel: 'outra.webp' }, { rel: 'exercise-media/x.webp' }], { ptBR: [] }, '')).toEqual(['./install-screen.webp'])
  })
})
