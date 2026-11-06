#!/usr/bin/env node
// GYM 12: o pós-build. Roda depois de `vite build --config vite.gym12.config.js` (scripts/gym12-build.sh):
//   node src/gym12/scripts/postbuild.mjs dist
//
// 1. GYM12_MEDIA=1: copia a mídia dos exercícios (scripts/catalogue/stage-media.mjs <dist>).
// 2. Service worker: põe na lista LAZY (já carimbada em dist/sw.js, nunca em public/sw.js) os
//    pacotes pt-BR (interface, instruções, nomes, e o pt.js de que o pt-BR herda) e as fontes
//    woff2 que ainda não estejam no precache. O build do upstream deixa os pacotes de idioma de
//    fora (scripts/sw-stamp.mjs); como o GYM 12 abre em pt-BR, sem eles um app atualizado e aberto
//    sem rede cairia em inglês (MAPA §9).
// 3. Checagens que derrubam o build (código de saída 1):
//    - endereço de provedor de IA em qualquer arquivo;
//    - "opengym.ch" em JavaScript fora dos pacotes de tradução e das ocorrências revisadas abaixo;
//    - mais de 20.000 arquivos, ou um arquivo com mais de 25 MiB (limites do Cloudflare Pages).
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const REPO = resolve(HERE, '../../../..')

export const MAX_FILES = 20000
export const MAX_BYTES = 25 * 1024 * 1024
export const AI_RE = /api\.anthropic\.com|api\.openai\.com|generativelanguage|openrouter/
export const INFO_FILE = '.gym12-build.json'
const BINARY = /\.(?:png|jpe?g|gif|webp|avif|ico|mp4|webm|woff2?|ttf|otf|zip|gz|br)$/i

// "opengym.ch" que pode ficar no JavaScript: nenhuma é link na tela do GYM 12. Cada uma casa com o
// trecho em volta da ocorrência (o código minificado usa crases nas strings).
export const ALLOWED_OPENGYM = [
  { re: /!==`opengym\.ch`/, why: 'leitura de links de rotina e de adesivos NFC do upstream (lib/routine-link.js, lib/nfc-tags.js)' },
  { re: /=`opengym\.ch`,\w+=`\/nfc`/, why: 'TAG_HOST de lib/nfc-tags.js: leitura de adesivos; gravar está desligado no GYM 12' },
  { re: /\(gym reminder; \+https:\/\/opengym\.ch\)/, why: 'User-Agent de lib/gym-places.js: só no app móvel' },
  { re: /The APK from opengym\.ch and the Google Play app/, why: 'rodapé do build F-Droid (Settings.jsx): só no app móvel' },
]

/** Todos os arquivos de `dir`: { rel, abs, size }. `rel` com barras normais. */
export function walk(dir) {
  const out = []
  const go = d => {
    for (const name of readdirSync(d)) {
      const abs = join(d, name)
      const st = statSync(abs)
      if (st.isDirectory()) go(abs)
      else out.push({ rel: relative(dir, abs).split(sep).join('/'), abs, size: st.size })
    }
  }
  go(dir)
  return out
}

/** As ocorrências de "opengym.ch" em `text` que não estão na lista revisada: [{ at, snippet }]. */
export function strayOpengym(text) {
  const out = []
  for (const m of text.matchAll(/opengym\.ch/g)) {
    const snippet = text.slice(Math.max(0, m.index - 80), m.index + 80)
    if (!ALLOWED_OPENGYM.some(a => a.re.test(snippet))) out.push({ at: m.index, snippet })
  }
  return out
}

/**
 * Os problemas de um dist, em pt-BR (vazio = tudo certo). `files` é a lista de walk();
 * `packs` os caminhos relativos ('assets/x.js') dos chunks que só têm pacotes de tradução;
 * `read(file)` lê o texto de um arquivo (injetável nos testes).
 */
export function checkFiles(files, { packs = [], read = f => readFileSync(f.abs, 'utf8') } = {}) {
  const problems = []
  if (files.length > MAX_FILES) problems.push(`São ${files.length} arquivos no dist; o limite é ${MAX_FILES}.`)
  for (const f of files) {
    if (f.size > MAX_BYTES) problems.push(`${f.rel} tem ${(f.size / 1048576).toFixed(1)} MiB; o limite por arquivo é 25 MiB.`)
  }
  const packSet = new Set(packs)
  for (const f of files) {
    if (BINARY.test(f.rel) || f.size > MAX_BYTES) continue
    const text = read(f)
    const ai = text.match(AI_RE)
    if (ai) problems.push(`${f.rel} contém endereço de provedor de IA (${ai[0]}).`)
    if (/\.m?js$/.test(f.rel) && !packSet.has(f.rel)) {
      for (const s of strayOpengym(text)) problems.push(`${f.rel} contém "opengym.ch" fora do permitido: …${s.snippet.replace(/\s+/g, ' ')}…`)
    }
  }
  return problems
}

export const checkDist = (dir, opts = {}) => checkFiles(walk(dir), opts)

// dist/sw.js carimbado: const LAZY = "[\"./assets/…\"]" (scripts/sw-stamp.mjs stampSw).
const LAZY_RE = /const LAZY = ("(?:[^"\\]|\\.)*")/

/** A lista LAZY de um sw.js carimbado. Lança erro se não estiver carimbado. */
export function readLazy(sw) {
  const m = LAZY_RE.exec(sw)
  if (!m) throw new Error('dist/sw.js sem a lista LAZY carimbada')
  const list = JSON.parse(JSON.parse(m[1]))
  if (!Array.isArray(list)) throw new Error('lista LAZY inválida em dist/sw.js')
  return list
}

/** O sw.js com `extra` na LAZY (sem repetir), e o que entrou de fato. */
export function addToLazy(sw, extra) {
  const list = readLazy(sw)
  const added = [...new Set(extra)].filter(u => !list.includes(u))
  if (!added.length) return { sw, added }
  const next = [...list, ...added].sort()
  return { sw: sw.replace(LAZY_RE, () => 'const LAZY = ' + JSON.stringify(JSON.stringify(next))), added }
}

/** O que o pós-build quer no precache: os chunks pt-BR e as fontes woff2, fora o que o index.html já cita. */
export function lazyExtras(files, info, indexHtml = '') {
  const want = [...(info?.ptBR || []), ...files.filter(f => /^assets\/[^/]+\.woff2$/.test(f.rel)).map(f => f.rel)]
  return want.map(f => './' + f).filter(u => !indexHtml.includes(u.slice(2)))
}

function fail(msg) {
  console.error('\n[gym12] Build do GYM 12 recusado:\n' + msg + '\n')
  process.exit(1)
}

export function main(argv = process.argv.slice(2)) {
  const dist = resolve(argv[0] || 'dist')
  if (!existsSync(join(dist, 'index.html'))) fail(`Não achei ${dist}/index.html. Rode o vite build antes.`)

  if (process.env.GYM12_MEDIA === '1') {
    const stage = join(REPO, 'scripts/catalogue/stage-media.mjs')
    const r = spawnSync(process.execPath, [stage, dist], { stdio: 'inherit' })
    if (r.status !== 0) fail('A cópia da mídia dos exercícios (stage-media.mjs) falhou.')
  }

  const infoPath = join(dist, INFO_FILE)
  if (!existsSync(infoPath)) fail(`Faltou ${INFO_FILE}: o build não passou pelo plugin do GYM 12 (use vite.gym12.config.js).`)
  const info = JSON.parse(readFileSync(infoPath, 'utf8'))
  unlinkSync(infoPath)

  const swPath = join(dist, 'sw.js')
  let added = []
  try {
    const res = addToLazy(readFileSync(swPath, 'utf8'), lazyExtras(walk(dist), info, readFileSync(join(dist, 'index.html'), 'utf8')))
    added = res.added
    writeFileSync(swPath, res.sw)
  } catch (e) { fail('Não consegui atualizar a lista LAZY do service worker: ' + e.message) }

  const files = walk(dist)
  const problems = checkFiles(files, { packs: info.packs })
  if (problems.length) fail(problems.map(p => ' - ' + p).join('\n'))
  console.log(`[gym12] pós-build ok: ${files.length} arquivos; ${added.length} acrescentados à LAZY do service worker` + (added.length ? ` (${added.join(', ')})` : '') + '.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
