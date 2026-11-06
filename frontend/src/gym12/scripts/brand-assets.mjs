#!/usr/bin/env node
// GYM 12: gera os ícones e o wordmark da marca em brand/ (rodado uma vez; as saídas ficam no git).
//
//   GYM12_TOOLS=<pasta com node_modules> node frontend/src/gym12/scripts/brand-assets.mjs
//
// As ferramentas NÃO são dependências do projeto: instale numa pasta temporária e aponte
// GYM12_TOOLS para ela:
//   mkdir /tmp/g12tools && cd /tmp/g12tools && npm init -y && \
//     npm i opentype.js@2 @resvg/resvg-js@2 @fontsource/fraunces@5
//
// O texto vira contorno (paths) com a Fraunces 700 estática (@fontsource/fraunces, .woff, que o
// opentype.js lê), então o desenho não depende de fonte instalada e o PNG sai igual em qualquer
// máquina. Saídas (BRAND.md):
//   brand/icon.svg               mestre: fundo ink-950, "GYM" pequeno em bone, "12" grande em lime
//   brand/icon-180.png           apple-touch-icon
//   brand/icon-192.png, icon-512.png            manifest, purpose "any"
//   brand/icon-maskable-512.png  manifest, purpose "maskable": o desenho dentro dos 60% centrais
//   brand/favicon.svg, favicon-32.png   só "12" em lime (a 32 px o "GYM" pequeno vira borrão)
//   brand/wordmark.svg           "GYM" bone + "12" lime numa linha, para a tela de abertura
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const REPO = resolve(HERE, '../../../..')
const OUT = join(REPO, 'brand')

const tools = process.env.GYM12_TOOLS
if (!tools) {
  console.error('Defina GYM12_TOOLS com a pasta onde estão opentype.js, @resvg/resvg-js e @fontsource/fraunces.')
  process.exit(1)
}
const req = createRequire(join(resolve(tools), 'package.json'))
const opentype = req('opentype.js')
const { Resvg } = req('@resvg/resvg-js')
const fontFile = req.resolve('@fontsource/fraunces/files/fraunces-latin-700-normal.woff')
const buf = readFileSync(fontFile)
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

export const INK = '#050604'
export const BONE = '#f4f1ea'
export const LIME = '#c4f439'

const r = n => Math.round(n * 100) / 100

/** O texto como path, com a caixa real do desenho (não a da fonte). */
function glyphs(text, size, letterSpacing = 0) {
  const path = font.getPath(text, 0, 0, size, { kerning: true, letterSpacing })
  const bb = path.getBoundingBox()
  return { path, bb, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 }
}

/** O path `g` posto com o canto de cima à esquerda da caixa em (x, y). */
function place(g, x, y, fill) {
  const p = font.getPath('', 0, 0, 1) // só para ter um Path vazio
  p.commands = g.path.commands.map(c => {
    const m = { ...c }
    for (const k of ['x', 'x1', 'x2']) if (k in m) m[k] = r(m[k] - g.bb.x1 + x)
    for (const k of ['y', 'y1', 'y2']) if (k in m) m[k] = r(m[k] - g.bb.y1 + y)
    return m
  })
  return `<path fill="${fill}" d="${p.toPathData(2)}"/>`
}

/**
 * O ícone num quadrado `size`, com o desenho cabendo em `box` (fração do lado). "12" ocupa a
 * largura do box; "GYM" tem 46% da largura do "12", centrado em cima, com um respiro entre os dois.
 */
export function iconSvg(size = 512, box = 0.64) {
  const twelve = glyphs('12', 1000)
  const gym = glyphs('GYM', 1000, 0.06)
  const W = size * box
  const s12 = W / twelve.w
  const sG = (W * 0.46) / gym.w
  const h12 = twelve.h * s12, hG = gym.h * sG
  const gap = h12 * 0.16
  const total = hG + gap + h12
  const top = (size - total) / 2
  const g12 = glyphs('12', 1000 * s12)
  const gG = glyphs('GYM', 1000 * sG, 0.06)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" fill="${INK}"/>` +
    place(gG, (size - gG.w) / 2, top, BONE) +
    place(g12, (size - g12.w) / 2, top + gG.h + gap, LIME) +
    '</svg>\n'
}

/** O favicon: só "12" em lime sobre ink-950, ocupando `box` da largura, centrado. */
export function faviconSvg(size = 512, box = 0.82) {
  const probe = glyphs('12', 1000)
  const g = glyphs('12', 1000 * (size * box) / probe.w)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" fill="${INK}"/>` +
    place(g, (size - g.w) / 2, (size - g.h) / 2, LIME) +
    '</svg>\n'
}

/** "GYM" bone + "12" lime numa linha, caixa justa (altura 100), para a tela de abertura. */
export function wordmarkSvg() {
  const gym = glyphs('GYM', 100, 0.02)
  const twelve = glyphs('12', 100)
  const space = 100 * 0.24
  // A mesma linha de base: as duas palavras alinhadas pela base, não pela caixa.
  const top = Math.min(gym.bb.y1, twelve.bb.y1)
  const bottom = Math.max(gym.bb.y2, twelve.bb.y2)
  const H = bottom - top
  const W = gym.w + space + twelve.w
  const a = place(gym, 0, gym.bb.y1 - top, BONE)
  const b = place(twelve, gym.w + space, twelve.bb.y1 - top, LIME)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(W)} ${r(H)}" width="${r(W)}" height="${r(H)}">${a}${b}</svg>\n`
}

function png(svg, px) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: px }, background: INK }).render().asPng()
}

function main() {
  mkdirSync(OUT, { recursive: true })
  const icon = iconSvg(512, 0.64)
  const maskable = iconSvg(512, 0.5)
  const write = (name, data) => { writeFileSync(join(OUT, name), data); console.log('brand/' + name, data.length, 'bytes') }
  write('icon.svg', icon)
  const favicon = faviconSvg()
  write('favicon.svg', favicon)
  write('wordmark.svg', wordmarkSvg())
  write('icon-180.png', png(icon, 180))
  write('icon-192.png', png(icon, 192))
  write('icon-512.png', png(icon, 512))
  write('icon-maskable-512.png', png(maskable, 512))
  write('favicon-32.png', png(favicon, 32))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
