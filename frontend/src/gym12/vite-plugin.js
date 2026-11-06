// GYM 12: o plugin do Vite que transforma o build demo do openGym no GYM 12. Ativo só em
// vite.gym12.config.js; o vite.config.js original (e o vitest) nunca o carregam.
//
//  - resolveId: troca as telas e módulos de IA, admin, dados de exemplo e mapa por stubs com os
//    mesmos nomes (src/gym12/stubs). A comparação é pelo caminho absoluto resolvido: os imports
//    vêm de pastas diferentes ('./coach-local.js', '../lib/coach-local.js'), então um alias por
//    caminho relativo não funcionaria.
//  - transform: acrescenta `import './gym12.css'` ao gym12/boot.js (cores, fontes e números da marca
//    só neste build; o upstream e o vitest nunca carregam o CSS nem as fontes).
//  - transformIndexHtml: título, metas, cor do tema, idioma, os textos do vigia de boot em pt-BR,
//    os ícones (favicon SVG + PNG 32) e a tela de abertura com o wordmark (brand/wordmark.svg).
//  - closeBundle: dist/manifest.json a partir de brand/manifest.json, os ícones de brand/ na raiz do
//    dist e dist/_headers (Cloudflare Pages).
//  - config: as travas do ambiente (checarAmbiente) e as constantes da tela de Licenças
//    (__GYM12_COMMIT__, o commit deste build).
//  - generateBundle: dist/licencas/ (LICENSE.txt, NOTICE.md, OFL-*.txt e terceiros.json, as
//    bibliotecas que entraram no bundle), lidos pela tela de Licenças (gym12/Licencas.jsx).
//  - Ambiente de teste (GYM12_AMBIENTE=teste): noindex no index.html, no _headers e no robots.txt;
//    com VITE_TESTE_LICENCA=1, a tela de Licenças vira a variante (gym12/LicencasTeste.jsx). Fora
//    desse build a variante nunca é resolvida, então não entra no bundle.
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { loadEnv } from 'vite'

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
// A tela de Licenças e a variante do ambiente de teste.
export const LICENCAS = join(HERE, 'Licencas.jsx')
export const LICENCAS_TESTE = join(HERE, 'LicencasTeste.jsx')
// O boot.js do GYM 12, que recebe o import do CSS da marca (transform).
const BOOT = join(HERE, 'boot.js')
const NAMES = /(?:^|[\\/])(?:CoachChat|CoachIntake|CoachSetup|Admin|coach-local|coach-demo|demoSeed|GymMap|Licencas)(?:\.jsx?)?$/

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
  ['<link rel="icon" type="image/png" href="icon-180.png">', '<link rel="icon" type="image/svg+xml" href="favicon.svg">\n<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">'],
]

// Os arquivos de brand/ (gerados por scripts/brand-assets.mjs) que vão para a raiz do dist. Os
// icon-180/icon-512 do upstream (public/) são sobrescritos.
export const BRAND_FILES = ['icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon.svg', 'favicon-32.png']

// A tela de abertura do GYM 12 no lugar dos halteres do upstream: ink-950, o wordmark ("GYM" bone +
// "12" lime, Fraunces em contorno, sem depender de fonte carregada) e um traço lime fino embaixo.
// Os estilos do vigia (#boot.fail) continuam, com as cores da marca. lib/boot.js tira #boot quando
// o app desenha; sem a animação dos halteres (.db) ele sai na hora, sem esperar a repetição.
const BOOT_START = '<style>\n  #boot{'
const BOOT_END = '<div id="root"></div>'
export function bootScreen(wordmark) {
  const svg = wordmark.trim().replace(/ width="[\d.]+" height="[\d.]+"/, '').replace('<svg ', '<svg role="presentation" focusable="false" ')
  return `<style>
  #boot{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#050604;transition:opacity .22s ease-out}
  #boot.out{opacity:0;pointer-events:none}
  #boot .wm{display:flex;flex-direction:column;align-items:center;gap:18px}
  #boot .wm svg{display:block;width:176px;height:auto}
  #boot .wm i{display:block;width:64px;height:2px;border-radius:1px;background:#c4f439}
  #boot.fail{place-items:center;padding:24px}
  #boot.fail div{max-width:340px;font:15px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#f4f1ea;text-align:center}
  #boot.fail .h{font-size:19px;font-weight:600;margin:0 0 8px}
  #boot.fail code{display:block;margin:14px 0 18px;padding:10px;border-radius:10px;background:#121510;color:#8b8a7e;font-size:12px;text-align:left;word-break:break-word;-webkit-user-select:text;user-select:text}
  #boot.fail button{font:inherit;font-weight:600;color:#050604;background:#c4f439;border:0;border-radius:12px;min-height:44px;padding:0 28px}
</style>
<div id="boot" aria-hidden="true">
  <div class="wm">${svg}<i></i></div>
</div>
`
}

/** O index.html com a tela de abertura do GYM 12. Lança erro se o bloco do upstream mudou. */
export function brandBoot(html, wordmark = readFileSync(join(REPO, 'brand/wordmark.svg'), 'utf8')) {
  const a = html.indexOf(BOOT_START)
  const b = html.indexOf(BOOT_END)
  if (a < 0 || b < a || !html.slice(a, b).includes('<div id="boot" aria-hidden="true">')) throw new Error('[gym12] index.html mudou: não achei a tela de boot (#boot)')
  return html.slice(0, a) + bootScreen(wordmark) + html.slice(b)
}

/** O index.html do GYM 12. Lança erro se algum trecho esperado não existir mais. */
export function brandHtml(html) {
  let out = html
  for (const [from, to, alt, all] of HTML_SWAPS) {
    const key = out.includes(from) ? from : alt && out.includes(alt) ? alt : null
    if (!key) throw new Error('[gym12] index.html mudou: não achei ' + from)
    out = all ? out.split(key).join(to) : out.replace(key, () => to)
  }
  return brandBoot(out)
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

// ------------------------------------------------------------- ambiente de teste --

// O texto da faixa da variante (o pós-build confere que ele não está no build de produção).
export { TESTE_BANNER } from './teste-licenca.js'
/** O branch do Cloudflare Pages em que a variante pode ser publicada. */
export const TESTE_BRANCH = 'teste-licenca'

/** A flag da variante está ligada? (vazio ou "0" = desligada) */
export const licencaTesteLigada = env => !!env.VITE_TESTE_LICENCA && env.VITE_TESTE_LICENCA !== '0'
/** É o build do ambiente de teste? */
export const ambienteTeste = env => env.GYM12_AMBIENTE === 'teste'

/**
 * As travas do ambiente, como função pura: devolve a mensagem de erro (pt-BR) que derruba o build,
 * ou null. A variante da tela de Licenças só existe no build do ambiente de teste, e nunca num
 * branch do Cloudflare Pages que não seja o de teste.
 */
export function checarAmbiente(env) {
  if (!licencaTesteLigada(env)) return null
  if (!ambienteTeste(env)) return 'VITE_TESTE_LICENCA só pode ser ligada no build do ambiente de teste (GYM12_AMBIENTE=teste). O build de produção não aceita essa variável.'
  if (env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== TESTE_BRANCH) return `VITE_TESTE_LICENCA só pode ser ligada no branch ${TESTE_BRANCH} do Cloudflare Pages (este build é do branch ${env.CF_PAGES_BRANCH}). O build de produção não aceita essa variável.`
  return null
}

export const ROBOTS_META = '<meta name="robots" content="noindex, nofollow">'
export const ROBOTS_TXT = 'User-agent: *\nDisallow: /\n'
export const HEADERS_TESTE = '/*\n  X-Robots-Tag: noindex, nofollow\n'

/** O index.html do ambiente de teste: a meta robots logo depois do <head>. */
export function noindexHtml(html) {
  if (!html.includes('<head>')) throw new Error('[gym12] index.html sem <head>: não consegui pôr o noindex')
  return html.replace('<head>', () => '<head>\n' + ROBOTS_META)
}

// ------------------------------------------------------------------- licenças --

/** O commit deste build (hash curto do git; no Cloudflare Pages, CF_PAGES_COMMIT_SHA se faltar o git). */
export function commitDoBuild(env = process.env) {
  try { return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { /* sem git */ }
  return env.CF_PAGES_COMMIT_SHA ? env.CF_PAGES_COMMIT_SHA.slice(0, 9) : 'desconhecido'
}

// Os textos que vão para dist/licencas/, como estão no repositório.
export const LICENCA_ARQUIVOS = {
  'licencas/LICENSE.txt': join(REPO, 'LICENSE'),
  'licencas/NOTICE.md': join(REPO, 'NOTICE.md'),
  'licencas/OFL-Fraunces.txt': join(HERE, 'fonts/OFL-Fraunces.txt'),
  'licencas/OFL-Geist.txt': join(HERE, 'fonts/OFL-Geist.txt'),
  'licencas/OFL-JetBrainsMono.txt': join(HERE, 'fonts/OFL-JetBrainsMono.txt'),
}
export const TERCEIROS = 'licencas/terceiros.json'

const NM = /[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)(?=[\\/])/g
/** As pastas dos pacotes de node_modules que têm módulo no bundle: { nome: pasta }. */
export function pacotesNoBundle(bundle) {
  const out = {}
  for (const c of Object.values(bundle)) {
    if (c.type !== 'chunk') continue
    for (const id of (c.moduleIds?.length ? c.moduleIds : Object.keys(c.modules || {}))) {
      const clean = id.replace(/^\0/, '').split('?')[0]
      const all = [...clean.matchAll(NM)]
      if (!all.length) continue
      const m = all[all.length - 1]           // o pacote mais interno (node_modules aninhado)
      const name = m[1].split(sep).join('/').replace(/\\/g, '/')
      out[name] ||= clean.slice(0, m.index + m[0].length)
    }
  }
  return out
}

const LICENSE_FILE = /^(?:licen[cs]e|copying|notice)(?:[.-].*)?$/i
/** Uma biblioteca para terceiros.json: nome, versão, licença, linha de copyright e o texto da licença. */
export function biblioteca(name, dir, direct = []) {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  const license = typeof pkg.license === 'string' ? pkg.license : pkg.license?.type || (pkg.licenses || []).map(l => l.type || l).join(' OR ') || null
  const file = readdirSync(dir).filter(f => LICENSE_FILE.test(f)).sort((a, b) => a.length - b.length)[0]
  const texto = file ? readFileSync(join(dir, file), 'utf8') : null
  // A linha de copyright do LICENSE ("Copyright (c) 2021 Fulano"), nunca a do modelo da Apache
  // ("Copyright [yyyy] [name of copyright owner]") nem a frase do corpo da licença.
  const copyright = texto?.split(/\r?\n/).map(l => l.trim())
    .find(l => /^(?:copyright\s+(?:\(c\)|©|\d{4})|(?:\(c\)|©)\s*\d{4})/i.test(l) && !/[[{]yyyy[\]}]/i.test(l)) || null
  const pessoa = p => (typeof p === 'string' ? p.replace(/\s*[<(].*$/, '') : p?.name) || null
  const autor = pessoa(pkg.author) || pessoa((pkg.contributors || [])[0])
  return { nome: name, versao: pkg.version, licenca: license, copyright, autor, direta: direct.includes(name), texto }
}

/** terceiros.json: as bibliotecas do bundle, em ordem alfabética. */
export function terceiros(bundle, direct = []) {
  return Object.entries(pacotesNoBundle(bundle)).map(([n, d]) => biblioteca(n, d, direct)).sort((a, b) => a.nome.localeCompare(b.nome))
}

export default function gym12() {
  let outDir = resolve(SRC, '../dist')
  let info = null
  let env = process.env
  return {
    name: 'gym12',
    enforce: 'pre',
    config(config, { mode } = {}) {
      env = { ...loadEnv(mode || 'production', config.root || resolve(SRC, '..'), ''), ...process.env }
      const err = checarAmbiente(env)
      if (err) throw new Error('[gym12] Build recusado: ' + err)
      return { define: { __GYM12_COMMIT__: JSON.stringify(commitDoBuild(env)) } }
    },
    configResolved(config) { outDir = resolve(config.root, config.build.outDir) },
    async resolveId(source, importer, options) {
      if (!importer || !NAMES.test(source.split('?')[0])) return null
      const r = await this.resolve(source, importer, { ...options, skipSelf: true })
      const id = r?.id?.split('?')[0]
      // A variante só no build de teste, e a própria variante continua importando a tela normal.
      if (id === LICENCAS) return licencaTesteLigada(env) && importer.split('?')[0] !== LICENCAS_TESTE ? LICENCAS_TESTE : null
      return id && STUBS[id] ? STUBS[id] : null
    },
    transform(code, id) {
      if (id.split('?')[0] !== BOOT) return null
      return { code: "import './gym12.css'\n" + code, map: null }
    },
    transformIndexHtml: { order: 'pre', handler: html => (ambienteTeste(env) ? noindexHtml(brandHtml(html)) : brandHtml(html)) },
    generateBundle(_, bundle) {
      info = buildInfo(bundle)
      for (const [fileName, src] of Object.entries(LICENCA_ARQUIVOS)) this.emitFile({ type: 'asset', fileName, source: readFileSync(src, 'utf8') })
      const direct = Object.keys(JSON.parse(readFileSync(join(SRC, '../package.json'), 'utf8')).dependencies || {})
      this.emitFile({ type: 'asset', fileName: TERCEIROS, source: JSON.stringify(terceiros(bundle, direct), null, 1) + '\n' })
    },
    closeBundle() {
      if (!existsSync(outDir)) return
      const manifest = JSON.parse(readFileSync(join(REPO, 'brand/manifest.json'), 'utf8'))
      writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
      for (const f of BRAND_FILES) copyFileSync(join(REPO, 'brand', f), join(outDir, f))
      writeFileSync(join(outDir, '_headers'), ambienteTeste(env) ? HEADERS + HEADERS_TESTE : HEADERS)
      if (ambienteTeste(env)) writeFileSync(join(outDir, 'robots.txt'), ROBOTS_TXT)
      if (info) writeFileSync(join(outDir, '.gym12-build.json'), JSON.stringify(info, null, 2) + '\n')
    },
  }
}
