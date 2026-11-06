#!/usr/bin/env node
// GYM 12 · gravação: o gravador das telas do app para o Reel R-001. Grava o build de gravação
// (vite.gravacao.config.js) quadro a quadro, a 30 fps, num navegador sem rede.
//
//   scripts/gym12-gravacao.sh --serve        (outro terminal: build de gravação em 127.0.0.1:4430)
//   GYM12_TOOLS=~/jrsa node frontend/src/gym12/gravacao/gravar.mjs [--so inicio,rotina] [--saida <pasta>] [--url <url>]
//
// O Playwright NÃO é dependência do projeto: GYM12_TOOLS aponta para uma pasta com node_modules/playwright
// (os navegadores vêm de ~/Library/Caches/ms-playwright). Saída padrão:
// ~/migracao-n8n/agencia-reels/reels/R-001/capturas/ (ou GRAVACAO_SAIDA / --saida).
//
// Como grava (determinístico):
//  - celular 390×844, escala 3 (quadros de 1170×2532), isMobile + hasTouch, pt-BR, America/Sao_Paulo,
//    tema escuro, sem service worker; toda requisição que não seja do localhost é bloqueada;
//  - o tempo da página é do Playwright (page.clock), parado: cada quadro avança 1/30 s
//    (runFor de 33 ou 34 ms), e as animações CSS/Web Animations (document.getAnimations) ficam
//    pausadas e posicionadas no mesmo tempo virtual (as que terminam recebem finish(), com os
//    eventos de fim). Nenhum quadro depende do tempo real, então nenhum se perde ou se repete;
//  - os toques são toques de verdade (Input.dispatchTouchEvent pelo page.touchscreen), no centro do
//    elemento; a rolagem é a da página (scrollTo instantâneo por quadro, com easing);
//  - cada quadro sai duas vezes do MESMO estado: normal/ e borrado/ (o CSS BLUR_CSS, só nas mídias
//    dos exercícios: img, video e canvas, ligado só durante a 2ª captura);
//  - capturas/<nome>/{normal,borrado}/frame-00000.png…, capturas/<nome>/previa-borrado.mp4 (ffmpeg)
//    e capturas/manifesto.json (quadros, fps, toques e retângulos em pixels do quadro 1170×2532).
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const FPS = 30
export const VW = 390, VH = 844, DSF = 3
// O relógio da página: instalado e parado às 18:29:58, a abertura do app leva os 2 s até 18:30.
export const RELOGIO = '2026-11-06T18:29:58-03:00'
export const BLUR_CSS = 'img, video, canvas { filter: blur(28px) !important; transition: none !important }'
export const ROTINA_A = 'g12-treino-a'
const LOCAL = new Set(['127.0.0.1', 'localhost', '[::1]'])

/** O tempo virtual (ms) do quadro f: inteiro, sem acumular erro. */
export const tempoDo = f => Math.round(f * 1000 / FPS)
/** Easing suave (ida e volta da rolagem). */
export const suave = x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
/** Retângulo CSS → pixels do quadro (×3, arredondado). */
export const px = r => (r ? [r.x, r.y, r.w, r.h].map(v => Math.round(v * DSF)) : null)

// ------------------------------------------------------------------ na página --

// Instalado antes de o app carregar: o relógio do app fica livre (o page.clock manda), a página de
// instalação não abre e o controle das animações fica pronto.
function initScript() {
  try { localStorage.setItem('gym12.skipInstall', '1') } catch { /* sem armazenamento */ }
  window.__G12_RELOGIO_LIVRE__ = true
  const vistos = new WeakMap()
  let anterior = 0
  window.__g12anim = {
    /** Pausa e posiciona todas as animações no tempo virtual `agora` (ms desde o começo da tomada). */
    sync(agora, primeira) {
      let n = 0
      for (const a of document.getAnimations()) {
        let ini = vistos.get(a)
        if (ini === undefined) {
          const ct = typeof a.currentTime === 'number' ? a.currentTime : 0
          // Na 1ª sincronização, cada animação continua de onde está; depois, uma nova começou
          // durante o último passo (no tempo do quadro anterior).
          ini = primeira ? agora - ct : anterior
          try { a.pause() } catch { /* já parada */ }
          vistos.set(a, ini)
        }
        const rate = a.playbackRate || 1
        const tl = Math.max(0, (agora - ini) * rate)
        const fim = a.effect?.getComputedTiming?.().endTime
        if (Number.isFinite(fim) && tl >= fim) { try { a.finish() } catch { a.currentTime = fim } ; continue }
        a.currentTime = tl
        n++
      }
      anterior = agora
      return n
    },
    /** Liga/desliga o CSS que borra as mídias dos exercícios. */
    blur(on, css) {
      let s = document.getElementById('g12-blur')
      if (on && !s) { s = document.createElement('style'); s.id = 'g12-blur'; s.textContent = css; document.head.appendChild(s) }
      if (!on && s) {
        s.remove()
        // Nenhuma transição de filter nas mídias fica para trás (o app não anima filter nelas).
        for (const a of document.getAnimations()) if (a.transitionProperty === 'filter' && /^(IMG|VIDEO|CANVAS)$/.test(a.effect?.target?.tagName || '')) a.cancel()
      }
    },
  }
}

// ------------------------------------------------------------------- tomada --

class Tomada {
  constructor(page, nome, saida) {
    this.page = page; this.nome = nome; this.dir = join(saida, nome)
    this.f = -1; this.toques = []; this.eventos = []; this.rets = {}; this.alvos = {}
    rmSync(this.dir, { recursive: true, force: true })
    mkdirSync(join(this.dir, 'normal'), { recursive: true })
    mkdirSync(join(this.dir, 'borrado'), { recursive: true })
  }
  /** Retângulos acompanhados quadro a quadro: nome → { desc, fn (texto de função que devolve o elemento) }. */
  acompanhar(nome, desc, fn) { this.alvos[nome] = { desc, fn } }
  async retangulos() {
    const fns = Object.fromEntries(Object.entries(this.alvos).map(([k, v]) => [k, v.fn]))
    return this.page.evaluate(fns => {
      const out = {}
      for (const [k, src] of Object.entries(fns)) {
        let el = null
        try { el = (0, eval)('(' + src + ')')() } catch { el = null }
        if (!el) { out[k] = null; continue }
        const b = el.getBoundingClientRect()
        const vis = b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight
        out[k] = vis ? { x: b.x, y: b.y, w: b.width, h: b.height } : null
      }
      return out
    }, fns)
  }
  /** Avança para o próximo quadro (tempo, animações) e captura as duas versões. */
  async quadro() {
    const p = this.page
    this.f++
    if (this.f > 0) await p.clock.runFor(tempoDo(this.f) - tempoDo(this.f - 1))
    await assentar(p)
    await p.evaluate(([t, primeira]) => window.__g12anim.sync(t, primeira), [tempoDo(this.f), this.f === 0])
    await imagensProntas(p)
    const nome = 'frame-' + String(this.f).padStart(5, '0') + '.png'
    await p.screenshot({ path: join(this.dir, 'normal', nome), type: 'png', animations: 'allow', caret: 'initial' })
    await p.evaluate(css => window.__g12anim.blur(true, css), BLUR_CSS)
    await p.screenshot({ path: join(this.dir, 'borrado', nome), type: 'png', animations: 'allow', caret: 'initial' })
    await p.evaluate(() => window.__g12anim.blur(false))
    const r = await this.retangulos()
    for (const [k, v] of Object.entries(r)) {
      const lista = (this.rets[k] ||= [])
      const ret = px(v)
      const ult = lista[lista.length - 1]
      if (ret && ult && ult.ate === this.f - 1 && ult.ret.join() === ret.join()) ult.ate = this.f
      else if (ret) lista.push({ de: this.f, ate: this.f, ret })
    }
  }
  /** Quadros até o índice `ate` (inclusive), chamando `porQuadro(f)` antes de cada um. */
  async ate(ate, porQuadro) {
    while (this.f < ate) {
      if (porQuadro) await porQuadro(this.f + 1)
      await this.quadro()
    }
  }
  /** Toque de verdade no centro de `loc` (ou no ponto dado), antes do próximo quadro. */
  async tocar(loc, rotulo, ponto) {
    const b = ponto ? null : await loc.boundingBox()
    const x = ponto ? ponto[0] : b.x + b.width / 2
    const y = ponto ? ponto[1] : b.y + b.height / 2
    await this.page.touchscreen.tap(x, y)
    this.toques.push({ quadro: this.f + 1, x: Math.round(x * DSF), y: Math.round(y * DSF), alvo: rotulo })
  }
  evento(tipo, dados) { this.eventos.push({ quadro: this.f + 1, tipo, ...dados }) }
  async rolar(y) { await this.page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y) }
  manifesto(extra = {}) {
    const rets = {}
    for (const [k, v] of Object.entries(this.alvos)) rets[k] = { descricao: v.desc, quadros: this.rets[k] || [] }
    return { quadros: this.f + 1, fps: FPS, duracao_s: +((this.f + 1) / FPS).toFixed(3), largura: VW * DSF, altura: VH * DSF, toques: this.toques, eventos: this.eventos, retangulos: rets, ...extra }
  }
}

/** Deixa o app reagir ao que o último passo disparou: tarefas de MessageChannel (React) e um respiro real. */
async function assentar(page, real = 25) {
  await page.evaluate(() => new Promise(r => { let n = 0; const c = new MessageChannel(); c.port1.onmessage = () => (++n >= 4 ? r() : c.port2.postMessage(0)); c.port2.postMessage(0) }))
  await page.waitForTimeout(real)
}
/** Espera (em tempo real, até ~1,5 s) as imagens visíveis terminarem de carregar. */
async function imagensProntas(page) {
  for (let i = 0; i < 30; i++) {
    const falta = await page.evaluate(() => [...document.images].filter(im => { const b = im.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && b.width > 0 && !(im.complete && (im.naturalWidth > 0 || !im.currentSrc)) }).length)
    if (!falta) return
    await page.waitForTimeout(50)
  }
}
/** Tempo virtual passando fora da gravação (preparação), com o app reagindo. */
async function passar(page, ms, passo = 100) {
  for (let left = ms; left > 0; left -= passo) {
    await page.clock.runFor(Math.min(passo, left))
    await assentar(page, 5)
  }
}
// Na preparação o toque espera o elemento ficar parado (locator.tap: visível, estável, recebendo
// eventos), porque ali as animações ainda correm no tempo real.
async function tocarPrep(page, loc, ms = 600) {
  await loc.tap({ timeout: 15000 })
  await passar(page, ms)
}

// --------------------------------------------------------------- preparação --

async function abrir(browser, url) {
  const ctx = await browser.newContext({
    viewport: { width: VW, height: VH }, deviceScaleFactor: DSF, isMobile: true, hasTouch: true,
    locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', colorScheme: 'dark', reducedMotion: 'no-preference',
    serviceWorkers: 'block',
  })
  const bloqueadas = []
  await ctx.route('**/*', r => {
    const u = new URL(r.request().url())
    if (LOCAL.has(u.hostname) || u.protocol === 'data:' || u.protocol === 'blob:') return r.continue()
    bloqueadas.push(u.href)
    return r.abort('blockedbyclient')
  })
  await ctx.addInitScript(initScript)
  const page = await ctx.newPage()
  const erros = []
  page.on('pageerror', e => erros.push(e.message))
  await page.clock.install({ time: new Date(RELOGIO) })
  await page.clock.pauseAt(new Date(RELOGIO))
  await page.goto(url)
  // A abertura do app (boot, histórico de exemplo, pacotes pt-BR) com o relógio andando aos poucos.
  for (let i = 0; i < 80 && !(await page.locator('#tabbar').count()); i++) await passar(page, 100)
  await passar(page, 2000)
  await page.evaluate(() => document.fonts.ready)
  if (!(await page.locator('#tabbar').count())) throw new Error('o app não abriu')
  return { ctx, page, bloqueadas, erros }
}

const hoje = page => page.locator('.today-row')
const linhaSerie = (page, i) => page.locator('.setrow').nth(i)
const pilula = (page, i) => page.locator(`.wchips .wchip[data-unit-key="${i}"]`)

async function comecarTreino(page) {
  await tocarPrep(page, hoje(page).locator('.tag'), 1500)
  if (!page.url().includes('#/workout')) throw new Error('o treino não abriu')
}

// O treino quase inteiro, como na academia: supino (3 séries a 40), depois os outros quatro
// exercícios, e a última série do supino fica para a gravação "recorde".
async function treinoAteAUltimaSerie(page) {
  await comecarTreino(page)
  await passar(page, 40000, 500)
  for (let s = 0; s < 3; s++) { await tocarPrep(page, linhaSerie(page, s).locator('button.chk'), 400); await passar(page, 150000, 1000) }
  for (let ex = 1; ex <= 4; ex++) {
    await tocarPrep(page, pilula(page, ex), 900)
    const n = await page.locator('.setrow').count()
    for (let s = 0; s < n; s++) { await tocarPrep(page, linhaSerie(page, s).locator('button.chk'), 400); await passar(page, 120000, 1000) }
  }
  await tocarPrep(page, pilula(page, 0), 900)
  const fechar = page.locator('#timer button.skip')
  if (await fechar.count()) await tocarPrep(page, fechar, 600)
  await passar(page, 6000, 200)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await passar(page, 300)
}

// ------------------------------------------------------------------ tomadas --

// Cada tomada: { desc, prep(page), gravar(t) }. As quantidades de quadros ficam entre 2 e 5 s.
export const TOMADAS = {
  inicio: {
    desc: 'Início do GYM 12 parado, uma rolagem leve de 150 px no meio e parado de novo; sem peso corporal.',
    async prep(page) { await page.evaluate(() => window.scrollTo(0, 0)); await passar(page, 500) },
    async gravar(t) {
      t.acompanhar('hoje', 'linha "Hoje · Treino A" com o "Iniciar"', '() => document.querySelector(".today-row")')
      t.acompanhar('wordmark', 'título "GYM 12"', '() => document.querySelector(".g12-wm")')
      const Y = 150, a = 18, b = 66
      await t.ate(89, async f => { if (f >= a && f <= b) await t.rolar(Math.round(Y * suave((f - a) / (b - a)))) })
    },
  },

  rotina: {
    desc: 'Edição da rotina "Treino A" (aviso do profissional de educação física no topo) ganhando os 5 exercícios, um a um; a página rola de leve para o 4º e o 5º aparecerem acima da barra de abas.',
    async prep(page, ctx) {
      await page.evaluate(id => { location.hash = '#/plan/r/' + id }, ROTINA_A)
      await passar(page, 1500)
      // Posições com a rotina cheia (para a rolagem acompanhar o 4º e o 5º) e as miniaturas já carregadas.
      await imagensProntas(page)
      ctx.cheia = await page.evaluate(() => ({
        linhas: [...document.querySelectorAll('[data-routine-row]')].map(e => { const b = e.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY } }),
        abas: document.querySelector('#tabbar').getBoundingClientRect().top,
      }))
      ctx.exs = await page.evaluate(id => window.__g12gravacao.exerciciosDa(id), ROTINA_A)
      await page.evaluate(id => window.__g12gravacao.esvaziar(id), ROTINA_A)
      await passar(page, 800)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await passar(page, 300)
    },
    async gravar(t, ctx) {
      const { page } = t
      t.acompanhar('aviso', 'aviso do profissional de educação física (RoutineNotice)', '() => document.querySelector(".gym12-notice")')
      t.acompanhar('nome_rotina', 'nome da rotina ("Treino A")', '() => document.querySelector(".hdr input")')
      for (let k = 0; k < 5; k++) t.acompanhar('exercicio_' + (k + 1), `${k + 1}º exercício da rotina`, `() => document.querySelector('[data-routine-row][data-ex-index="${k}"] .item')`)
      const ADD = [12, 36, 60, 84, 108]
      const LIMITE = ctx.cheia.abas - 12
      // A rolagem antes do 4º e do 5º: termina no quadro em que ele entra, com ele inteiro à vista.
      const rol = [{ de: ADD[3] - 14, ate: ADD[3] - 1, y0: 0, y1: Math.max(0, Math.ceil(ctx.cheia.linhas[3].bottom - LIMITE)) }]
      rol.push({ de: ADD[4] - 14, ate: ADD[4] - 1, y0: rol[0].y1, y1: Math.max(rol[0].y1, Math.ceil(ctx.cheia.linhas[4].bottom - LIMITE)) })
      const nomes = await page.evaluate(ids => ids.map(id => id), ctx.exs.map(e => e.id))
      await t.ate(149, async f => {
        for (const r of rol) if (f >= r.de && f <= r.ate) await t.rolar(Math.round(r.y0 + (r.y1 - r.y0) * suave((f - r.de + 1) / (r.ate - r.de + 1))))
        const k = ADD.indexOf(f)
        if (k >= 0) {
          await page.evaluate(([id, cfg]) => window.__g12gravacao.acrescentar(id, cfg), [ROTINA_A, ctx.exs[k]])
          t.evento('exercicio', { n: k + 1, id: nomes[k], retangulo: 'exercicio_' + (k + 1) })
        }
      })
    },
  },

  iniciar: {
    desc: 'Início com "Hoje · Treino A · Iniciar"; toque no "Iniciar" e a tela do treino ativo abrindo.',
    async prep(page) { await page.evaluate(() => window.scrollTo(0, 0)); await passar(page, 500) },
    async gravar(t) {
      t.acompanhar('botao_iniciar', 'botão "Iniciar" da linha Hoje', '() => document.querySelector(".today-row .tag")')
      t.acompanhar('linha_hoje', 'linha "Hoje · Treino A"', '() => document.querySelector(".today-row")')
      t.acompanhar('campo_carga', 'campo de carga da 1ª série (treino ativo)', '() => document.querySelector(".setrow .stp.w input")')
      await t.ate(19)
      await t.tocar(t.page.locator('.today-row .tag'), 'botao_iniciar')
      t.evento('toque_iniciar', { retangulo: 'botao_iniciar' })
      await t.ate(104)
    },
  },

  carga: {
    desc: 'Treino ativo no Supino reto com barra: a 1ª série já vem com a carga da última vez, 40 kg × 10 ("Da última vez (semana passada): 40×10, 40×10, 40×9, 40×8"); o relógio do treino correndo.',
    async prep(page) { await comecarTreino(page); await passar(page, 1500) },
    async gravar(t) {
      t.acompanhar('campo_carga', 'campo de carga da 1ª série (valor 40)', '() => document.querySelector(".setrow .stp.w input")')
      t.acompanhar('valor_40', 'o número 40 dentro do campo (a caixa do input; o texto é centralizado)', '() => document.querySelector(".setrow .stp.w .val")')
      t.acompanhar('campo_reps', 'campo de repetições da 1ª série (10)', '() => document.querySelector(".setrow .stp.r input")')
      t.acompanhar('linha_serie_1', 'linha inteira da 1ª série', '() => document.querySelector(".setrow")')
      t.acompanhar('da_ultima_vez', 'texto "Da última vez (semana passada): 40×10, …"', '() => [...document.querySelectorAll("div,span,p")].find(e => /^Da última vez \\(/.test(e.textContent) && !e.querySelector("div"))')
      await t.ate(89)
    },
  },

  descanso: {
    desc: 'Descanso depois da 1ª série do supino contando sozinho de 0:04 até 0:00 (os últimos 3 s à vista), e o app avisando "Pronto" / "Acabou o descanso. Próxima série!".',
    async prep(page) {
      await comecarTreino(page)
      await passar(page, 45000, 500)
      await tocarPrep(page, linhaSerie(page, 0).locator('button.chk'), 500)
      // 90 s de descanso: faltam 4,5 s quando a gravação começa.
      await passar(page, 85000, 1000)
    },
    async gravar(t) {
      t.acompanhar('relogio_descanso', 'relógio do descanso (botão com o tempo que falta)', '() => document.querySelector("#timer .tclock")')
      t.acompanhar('numero_descanso', 'o número do descanso (0:04 … 0:00, depois "Pronto")', '() => document.querySelector("#timer .tclock .t")')
      t.acompanhar('barra_descanso', 'barra do descanso (o progresso corre na borda de cima)', '() => document.querySelector("#timer")')
      let zerou = false
      await t.ate(149, async f => {
        if (!zerou && f > 1 && await t.page.locator('#timer.ready').count()) { zerou = true; t.evento('descanso_zerou', { retangulo: 'relogio_descanso' }) }
      })
    },
  },

  recorde: {
    desc: 'Última série do supino: toque no "+" (40 → 42,5 kg) e no ✓ (42,5 × 10); o app avisa "Esse é o treino todo!", toque em "Terminar treino" e o resumo mostra "Novo recorde: Supino reto com barra" (Recordes 1).',
    async prep(page) { await treinoAteAUltimaSerie(page) },
    async gravar(t) {
      const { page } = t
      t.acompanhar('campo_42_5', 'campo de carga da 4ª série do supino (40 → 42,5)', '() => document.querySelectorAll(".setrow .stp.w input")[3]')
      t.acompanhar('linha_serie_4', 'linha da 4ª série', '() => document.querySelectorAll(".setrow")[3]')
      t.acompanhar('aviso_recorde', 'linha "Novo recorde: Supino reto com barra" do resumo', '() => [...document.querySelectorAll(".center .small.accent.row")].find(e => /recorde/i.test(e.textContent))')
      t.acompanhar('recordes_1', 'quadro "Recordes 1" do resumo', '() => [...document.querySelectorAll(".tile")].find(e => /Recordes/.test(e.textContent))')
      t.acompanhar('trofeu', 'troféu e "Treino concluído!"', '() => [...document.querySelectorAll(".center h3")].find(e => /Treino concluído/.test(e.textContent))?.previousElementSibling')
      await t.ate(11)
      await t.tocar(linhaSerie(page, 3).locator('.stp.w button[aria-label="Aumentar"]'), 'mais_carga')
      t.evento('carga_42_5', { retangulo: 'campo_42_5' })
      await t.ate(41)
      await t.tocar(linhaSerie(page, 3).locator('button.chk'), 'concluir_serie')
      t.evento('serie_registrada', { retangulo: 'linha_serie_4' })
      await t.ate(83)
      await t.tocar(page.locator('.center button').filter({ hasText: /^Terminar treino$/ }), 'terminar_treino')
      t.evento('resumo', { retangulo: 'aviso_recorde' })
      await t.ate(149)
    },
  },

  grafico: {
    desc: 'Estatísticas depois do treino de hoje: o gráfico "Maior carga por treino" do Supino reto com barra subindo de 30 a 42,5 kg e, na mesma rolagem, o mapa muscular da semana (cartão Músculos).',
    async prep(page) {
      await treinoAteAUltimaSerie(page)
      await tocarPrep(page, linhaSerie(page, 3).locator('.stp.w button[aria-label="Aumentar"]'), 400)
      await tocarPrep(page, linhaSerie(page, 3).locator('button.chk'), 1200)
      await tocarPrep(page, page.locator('.center button').filter({ hasText: /^Terminar treino$/ }), 1500)
      await tocarPrep(page, page.locator('.center button').filter({ hasText: /^Boa!$/ }), 1500)
      await tocarPrep(page, page.locator('#tabbar button').filter({ hasText: 'Estatísticas' }), 1500)
      // O exercício do gráfico: Supino reto com barra.
      const card = page.locator('[data-tour="stats-records"]')
      await card.scrollIntoViewIfNeeded()
      await passar(page, 300)
      await tocarPrep(page, card.locator('.ex-pick button').first(), 900)
      await tocarPrep(page, page.locator('.sheet button, .sheet [role=option], .sheet .lrow').filter({ hasText: 'Supino reto com barra' }).first(), 900)
      // O cartão do gráfico logo abaixo do topo da tela.
      await page.evaluate(() => { const c = document.querySelector('[data-tour="stats-records"]'); window.scrollTo({ top: c.getBoundingClientRect().top + scrollY - 102, behavior: 'instant' }) })
      await passar(page, 600)
    },
    async gravar(t) {
      const { page } = t
      t.acompanhar('cartao_grafico', 'cartão "Progresso por exercício" (Supino reto com barra)', '() => document.querySelector("[data-tour=\\"stats-records\\"]")')
      t.acompanhar('grafico', 'área do gráfico (svg)', '() => document.querySelector("[data-tour=\\"stats-records\\"] .chart svg")')
      t.acompanhar('linha', 'a linha do gráfico (polyline da série)', '() => document.querySelector("[data-tour=\\"stats-records\\"] .chart svg polyline")')
      t.acompanhar('mapa_muscular', 'mapa muscular (frente e costas) do cartão Músculos', '() => document.querySelector(".muscles-card .bodymap")')
      t.acompanhar('cartao_musculos', 'cartão "Músculos"', '() => document.querySelector(".muscles-card")')
      const y0 = await page.evaluate(() => scrollY)
      const y1 = await page.evaluate(() => { const c = document.querySelector('.muscles-card'); return Math.round(c.getBoundingClientRect().top + scrollY - 70) })
      const a = 45, b = 96
      await t.ate(149, async f => {
        if (f === a) t.evento('rolagem_para_o_mapa', { de_px: y0 * DSF, para_px: y1 * DSF, retangulo: 'mapa_muscular' })
        if (f >= a && f <= b) await t.rolar(Math.round(y0 + (y1 - y0) * suave((f - a) / (b - a))))
      })
    },
  },
}

// ---------------------------------------------------------------- auditoria --

// O que nunca pode aparecer numa tela gravada (texto do body inteiro, não só o visível).
export const PROIBIDO = [
  /\bdemo\b|demonstra|dados de exemplo/i,
  /peso corporal|pesage|pesar|\bIMC\b|gordura corporal|\bmedidas?\b|circunfer/i,
  /\bfotos?\b/i,
  // O botão de começar o treino diz "Iniciar" (decisão do dono, 06/11): "Começar" sozinho não volta.
  /\bComeçar\b(?! (?:série|o rodízio|nova volta|programa|um plano|por))/,
  // Inglês que já apareceu em telas do upstream ("Reps" fica: é o termo do pacote pt-BR e das academias).
  /\b(?:Start|Finish|Rest|Workout|Sets|Best|Last time|Everything else|Skip|Done|Weight|Today|Exercises|Muscles)\b|\bPR\b/,
]
async function auditar(page) {
  const { texto, midias } = await page.evaluate(() => ({
    texto: document.body.innerText,
    // As mídias à vista (o que o CSS do borrado cobre): só a etiqueta e o caminho, nunca o conteúdo.
    midias: [...document.querySelectorAll('img, video, canvas, svg image, picture, object, embed, iframe')]
      .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.bottom > 0 && b.top < innerHeight })
      .map(e => e.tagName.toLowerCase() + ' ' + (e.currentSrc || e.getAttribute('src') || e.getAttribute('href') || '').replace(location.origin + '/', '')),
  }))
  return { achados: PROIBIDO.map(re => (texto.match(re) || [])[0]).filter(Boolean), texto, midias }
}

function previa(dir) {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'borrado', 'frame-%05d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', join(dir, 'previa-borrado.mp4')], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error('ffmpeg: ' + (r.stderr || r.error))
}

async function main() {
  const args = process.argv.slice(2)
  const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null }
  const tools = process.env.GYM12_TOOLS
  if (!tools) { console.error('Uso: GYM12_TOOLS=<pasta com node_modules/playwright> node frontend/src/gym12/gravacao/gravar.mjs [--so a,b] [--saida pasta] [--url url]'); process.exit(1) }
  const url = opt('--url') || 'http://127.0.0.1:4430/'
  if (!LOCAL.has(new URL(url).hostname)) throw new Error('o gravador só abre o build de gravação em localhost')
  const saida = resolve(opt('--saida') || process.env.GRAVACAO_SAIDA || join(homedir(), 'migracao-n8n/agencia-reels/reels/R-001/capturas'))
  const so = opt('--so') ? opt('--so').split(',') : Object.keys(TOMADAS)
  const { chromium } = createRequire(join(resolve(tools), 'package.json'))('playwright')
  mkdirSync(saida, { recursive: true })
  const arqManifesto = join(saida, 'manifesto.json')
  const manifesto = existsSync(arqManifesto) ? JSON.parse(readFileSync(arqManifesto, 'utf8')) : { gravacoes: {} }
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {})
  try {
    for (const nome of so) {
      const tm = TOMADAS[nome]
      if (!tm) throw new Error('gravação desconhecida: ' + nome)
      const inicio = Date.now()
      const { ctx, page, bloqueadas, erros } = await abrir(browser, url)
      const estado = {}
      await tm.prep(page, estado)
      const t = new Tomada(page, nome, saida)
      const antes = await auditar(page)
      const relogioIni = await page.evaluate(() => new Date().toISOString())
      await tm.gravar(t, estado)
      const depois = await auditar(page)
      await ctx.close()
      previa(t.dir)
      manifesto.gravacoes[nome] = t.manifesto({
        descricao: tm.desc,
        pastas: { normal: `${nome}/normal/`, borrado: `${nome}/borrado/`, previa: `${nome}/previa-borrado.mp4` },
        relogio_do_app_no_quadro_0: relogioIni,
        auditoria: {
          proibidos_no_inicio: antes.achados, proibidos_no_fim: depois.achados,
          midias_a_vista_no_inicio: antes.midias, midias_a_vista_no_fim: depois.midias,
          requisicoes_bloqueadas: bloqueadas, erros_da_pagina: erros,
        },
      })
      manifesto.gerado_em = new Date().toISOString()
      Object.assign(manifesto, { fps: FPS, quadro: { largura: VW * DSF, altura: VH * DSF, viewport: [VW, VH], escala: DSF }, unidades: 'pixels do quadro 1170×2532; retângulo = [x, y, largura, altura]; "quadros" = faixas de quadros (de/ate, inclusive) em que o retângulo vale' })
      writeFileSync(arqManifesto, JSON.stringify(manifesto, null, 1) + '\n')
      console.log(`[gravação] ${nome}: ${t.f + 1} quadros em ${((Date.now() - inicio) / 1000).toFixed(0)} s; proibidos: ${[...antes.achados, ...depois.achados].join(', ') || 'nenhum'}; bloqueadas: ${bloqueadas.length}; erros: ${erros.length}`)
    }
  } finally { await browser.close() }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e); process.exit(1) })
