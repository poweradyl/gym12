// GYM 12: o plugin do Vite que transforma o build demo do openGym no GYM 12. Ativo só em
// vite.gym12.config.js; o vite.config.js original (e o vitest) nunca o carregam.
//
//  - resolveId: troca as telas e módulos de IA, admin, dados de exemplo e mapa por stubs com os
//    mesmos nomes (src/gym12/stubs). A comparação é pelo caminho absoluto resolvido: os imports
//    vêm de pastas diferentes ('./coach-local.js', '../lib/coach-local.js'), então um alias por
//    caminho relativo não funcionaria.
//  - transformIndexHtml: título, metas, cor do tema, idioma e os textos do vigia de boot em pt-BR.
//  - closeBundle: dist/manifest.json a partir de brand/manifest.json e dist/_headers (Cloudflare Pages).
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))   // frontend/src/gym12
const SRC = resolve(HERE, '..')                          // frontend/src
const REPO = resolve(SRC, '../..')                       // raiz do repositório

/** Original absoluto → stub absoluto. */
export const STUBS = {
  [join(SRC, 'views/CoachChat.jsx')]: join(HERE, 'stubs/EmptyView.jsx'),
  [join(SRC, 'views/CoachIntake.jsx')]: join(HERE, 'stubs/EmptyView.jsx'),
  [join(SRC, 'views/CoachSetup.jsx')]: join(HERE, 'stubs/EmptyView.jsx'),
  [join(SRC, 'views/Admin.jsx')]: join(HERE, 'stubs/EmptyView.jsx'),
  [join(SRC, 'lib/coach-local.js')]: join(HERE, 'stubs/coach-local.js'),
  [join(SRC, 'lib/coach-demo.js')]: join(HERE, 'stubs/coach-demo.js'),
  [join(SRC, 'lib/demoSeed.js')]: join(HERE, 'stubs/demoSeed.js'),
  [join(SRC, 'components/GymMap.jsx')]: join(HERE, 'stubs/GymMap.jsx'),
}
// Filtro barato antes de pedir ao Vite para resolver o caminho.
const NAMES = /(?:^|[\\/])(?:CoachChat|CoachIntake|CoachSetup|Admin|coach-local|coach-demo|demoSeed|GymMap)(?:\.jsx?)?$/

export const DESCRIPTION = 'GYM 12 — sua ficha de treino no celular. Grátis, sem anúncio, seus treinos ficam no seu celular.'
export const THEME_COLOR = '#050604'

// Trocas exatas no index.html. Cada uma precisa existir: se o upstream mudar o texto, o build
// falha aqui em vez de publicar o vigia em inglês sem ninguém perceber.
const HTML_SWAPS = [
  ['<html lang="en">', '<html lang="pt-BR">'],
  ["=== 'ar' ? 'ar' : 'en');", "=== 'ar' ? 'ar' : 'pt-BR');"],
  ['<title>openGym</title>', '<title>GYM 12</title>'],
  ['<meta name="description" content="Personal gym &amp; body weight tracker">', `<meta name="description" content="${DESCRIPTION}">`, '<meta name="description" content="Personal gym & body weight tracker">'],
  ['<meta name="theme-color" content="#0c0e12">', `<meta name="theme-color" content="${THEME_COLOR}">`],
  ['<meta name="apple-mobile-web-app-title" content="openGym">', '<meta name="apple-mobile-web-app-title" content="GYM 12">'],
  ["'Reloading often helps. If it keeps happening, please send us this:'", "'Recarregar a página costuma resolver. Se continuar acontecendo, envie isto para nós:'"],
  ["'No error, it just never finished loading.'", "'Nenhum erro: só não terminou de carregar.'"],
  ["r.textContent = 'Reload';", "r.textContent = 'Recarregar';"],
  ["'Could not load ' + (t.src || 'a script')", "'Não foi possível carregar ' + (t.src || 'um script')"],
  ["'openGym could not start on this browser.'", "'O GYM 12 não conseguiu abrir neste navegador.'", null, true],
  ["'openGym is taking too long to start.'", "'O GYM 12 está demorando demais para abrir.'"],
]

/** O index.html do GYM 12. Lança erro se algum trecho esperado não existir mais. */
export function brandHtml(html) {
  let out = html
  for (const [from, to, alt, all] of HTML_SWAPS) {
    const key = out.includes(from) ? from : alt && out.includes(alt) ? alt : null
    if (!key) throw new Error('[gym12] index.html mudou: não achei ' + from)
    out = all ? out.split(key).join(to) : out.replace(key, () => to)
  }
  return out
}

// Cloudflare Pages: o service worker e o HTML sempre revalidados; os arquivos com hash, para sempre.
export const HEADERS = `/sw.js
  Cache-Control: no-cache
/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/manifest.json
  Cache-Control: no-cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`

// Para o pós-build (scripts/postbuild.mjs), em dist/.gym12-build.json (ele lê e apaga):
//   packs  os chunks que só têm pacotes de tradução (para a checagem de "opengym.ch");
//   ptBR   os chunks dos pacotes pt-BR e o que eles importam (pt.js), para a LAZY do service worker.
const PACK_DIR = /[\\/]src[\\/](?:gym12[\\/])?(?:locales|instr|exercise-names|exercise-desc)[\\/]/
const PT_BR = /[\\/]src[\\/](?:locales|instr|exercise-names|exercise-desc)[\\/]pt-BR\.js$/
export function buildInfo(bundle) {
  const chunks = Object.entries(bundle).filter(([, c]) => c.type === 'chunk')
  const ids = c => (c.moduleIds?.length ? c.moduleIds : Object.keys(c.modules || {}))
  const packs = chunks.filter(([, c]) => ids(c).length && ids(c).every(id => PACK_DIR.test(id))).map(([f]) => f)
  const ptBR = new Set()
  const add = f => { if (ptBR.has(f) || !bundle[f]) return; ptBR.add(f); (bundle[f].imports || []).forEach(add) }
  chunks.filter(([, c]) => ids(c).some(id => PT_BR.test(id))).forEach(([f]) => add(f))
  return { packs: packs.sort(), ptBR: [...ptBR].sort() }
}

export default function gym12() {
  let outDir = resolve(SRC, '../dist')
  let info = null
  return {
    name: 'gym12',
    enforce: 'pre',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir) },
    async resolveId(source, importer, options) {
      if (!importer || !NAMES.test(source.split('?')[0])) return null
      const r = await this.resolve(source, importer, { ...options, skipSelf: true })
      const id = r?.id?.split('?')[0]
      return id && STUBS[id] ? STUBS[id] : null
    },
    transformIndexHtml: { order: 'pre', handler: html => brandHtml(html) },
    generateBundle(_, bundle) { info = buildInfo(bundle) },
    closeBundle() {
      if (!existsSync(outDir)) return
      const manifest = JSON.parse(readFileSync(join(REPO, 'brand/manifest.json'), 'utf8'))
      writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
      writeFileSync(join(outDir, '_headers'), HEADERS)
      if (info) writeFileSync(join(outDir, '.gym12-build.json'), JSON.stringify(info, null, 2) + '\n')
    },
  }
}
