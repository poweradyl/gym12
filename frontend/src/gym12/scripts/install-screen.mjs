#!/usr/bin/env node
// GYM 12: gera brand/install-screen.webp, a captura do app que a página de instalação mostra dentro
// do celular (install/InstallLanding.jsx). Rodado à mão quando a tela de treino mudar; a saída fica
// no git e o plugin a copia para a raiz do dist.
//
//   GYM12_TOOLS=<pasta com node_modules> node frontend/src/gym12/scripts/install-screen.mjs <url do build>
//
// O Playwright NÃO é dependência do projeto: instale numa pasta temporária e aponte GYM12_TOOLS
// para ela (os navegadores vêm de `npx playwright install chromium`, ou de PLAYWRIGHT_CHROMIUM):
//   mkdir /tmp/g12tools && cd /tmp/g12tools && npm init -y && npm i playwright@1.56
//
// <url do build>: o dist do GYM 12 servido em qualquer servidor estático (com a mídia, para a
// miniatura do exercício), por exemplo http://127.0.0.1:4420/.
//
// O que faz, num perfil de navegador descartável (contexto novo, sem nada gravado em disco):
//  1. abre o app a 390×844, escala 2, tema escuro, pt-BR, sem a página de instalação;
//  2. grava dados FICTÍCIOS só para a foto: a rotina "Treino A — Peito e tríceps" (Supino reto com
//     barra, Supino inclinado com halteres, Crucifixo com halteres, Tríceps na polia) em todos os
//     dias da semana e quatro treinos antigos (para "Da última vez" e o melhor); miniatura pequena do
//     exercício e sem o nome em inglês entre parênteses;
//  3. começa o treino, marca a 1ª série do supino, pula o descanso (ele cobriria as séries) e fotografa;
//  4. recorta para a proporção da tela do celular da página (~0,475; ela usa object-fit: cover),
//     reduz para 440×926 e codifica em WebP no próprio Chromium (canvas), baixando a qualidade até caber em 80 KB.
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const REPO = resolve(HERE, '../../../..')
export const OUT = join(REPO, 'brand/install-screen.webp')
export const W = 440, H = 926, MAX_BYTES = 80 * 1024

/** Os dados fictícios da foto, sobre o estado que o app criou (perfil vazio). */
export function fakeState(S, now = Date.now()) {
  const rid = 'g12foto'
  const routine = { id: rid, name: 'Treino A — Peito e tríceps', emoji: 'barbell', ex: [
    { id: '0025', sets: 4, reps: 8, weight: 0 },   // Supino reto com barra
    { id: '0314', sets: 3, reps: 10, weight: 0 },  // Supino inclinado com halteres
    { id: '0308', sets: 3, reps: 12, weight: 0 },  // Crucifixo com halteres
    { id: '0200', sets: 3, reps: 12, weight: 0 },  // Tríceps na polia
  ] }
  const loads = { '0025': [60, 62.5, 65, 67.5], '0314': [22, 24, 24, 26], '0308': [12, 12, 14, 14], '0200': [20, 22.5, 22.5, 25] }
  const day = 864e5
  const iso = t => new Date(t).toISOString().slice(0, 10)
  const best = {}, exWeights = {}
  const workouts = [21, 14, 7, 2].map((ago, i) => {
    const start = now - ago * day - 3 * 3600e3
    const d = iso(start)
    const prs = []
    const entries = routine.ex.map(cfg => {
      const w = loads[cfg.id][i]
      const sets = Array.from({ length: cfg.sets }, (_, k) => ({ w, r: k === cfg.sets - 1 && i % 2 ? cfg.reps - 1 : cfg.reps, done: true }))
      if (w > (best[cfg.id] || 0)) { if (best[cfg.id]) prs.push(cfg.id); best[cfg.id] = w }
      exWeights[cfg.id] = { w, d }
      return { id: cfg.id, sets, topW: w }
    })
    const vol = entries.reduce((v, e) => v + e.sets.reduce((n, s) => n + s.w * s.r, 0), 0)
    return { id: 'g12w' + i, d, start, end: start + (52 + i * 3) * 60000, routineId: rid, name: routine.name, entries, prs, vol }
  })
  const week = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(d => [d, rid]))
  return { ...S, lang: 'pt-BR', langAuto: false, enParens: { ...(S.enParens || {}), 'pt-BR': false }, gifSize: 'mini', routines: [routine], week, workouts, exWeights, weighIn: false }
}

async function main() {
  const url = process.argv[2]
  const tools = process.env.GYM12_TOOLS
  if (!url || !tools) {
    console.error('Uso: GYM12_TOOLS=<pasta com o playwright> node frontend/src/gym12/scripts/install-screen.mjs <url do build>')
    process.exit(1)
  }
  const { chromium } = createRequire(join(resolve(tools), 'package.json'))('playwright')
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {})
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', colorScheme: 'dark', reducedMotion: 'reduce', serviceWorkers: 'block' })
    await ctx.addInitScript(() => { try { localStorage.setItem('gym12.skipInstall', '1') } catch { /* sem armazenamento */ } })
    const page = await ctx.newPage()
    page.on('pageerror', e => console.error('erro na página:', e.message))
    await page.goto(url)
    await page.waitForTimeout(2000)
    const skip = page.getByRole('button', { name: 'Pular' })
    if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(400) }
    const S = await page.evaluate(() => JSON.parse(localStorage.getItem('gym_state_v1') || '{}'))
    await page.evaluate(s => localStorage.setItem('gym_state_v1', s), JSON.stringify(fakeState(S)))
    await page.reload()
    await page.waitForTimeout(2000)
    if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(400) }
    await page.locator('button:has-text("Começar")').first().click()
    await page.waitForTimeout(800)
    const noWeigh = page.getByRole('button', { name: 'Começar sem se pesar' })
    if (await noWeigh.count()) await noWeigh.click()
    await page.waitForTimeout(1500)
    if (!(await page.getByText('Supino reto com barra').count())) throw new Error('a tela de treino não abriu com o Supino reto com barra')
    // A 1ª série feita: o círculo à direita da linha 1.
    await page.locator('button.chk[role="checkbox"]').first().click()
    await page.waitForTimeout(800)
    // O descanso que começou cobre as linhas de baixo: pulado, a foto mostra as quatro séries.
    const restSkip = page.locator('#timer button:has-text("Pular")')
    if (await restSkip.count()) await restSkip.first().click()
    await page.waitForTimeout(1000)
    const png = await page.screenshot({ type: 'png' })
    // Recorte (proporção 440×926, a da tela do celular da página), redução e WebP no canvas do Chromium.
    const webp = await page.evaluate(async ({ b64, W, H, MAX }) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + b64
      await img.decode()
      const sh = Math.round(img.naturalWidth * H / W)
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const g = c.getContext('2d')
      g.imageSmoothingQuality = 'high'
      g.drawImage(img, 0, 0, img.naturalWidth, sh, 0, 0, W, H)
      for (let q = 0.86; q >= 0.4; q -= 0.06) {
        const blob = await new Promise(r => c.toBlob(r, 'image/webp', q))
        const buf = new Uint8Array(await blob.arrayBuffer())
        if (buf.length <= MAX || q - 0.06 < 0.4) return { q, bytes: Array.from(buf) }
      }
    }, { b64: png.toString('base64'), W, H, MAX: MAX_BYTES })
    const out = Buffer.from(webp.bytes)
    if (out.length > MAX_BYTES) throw new Error(`a captura ficou com ${out.length} bytes (limite ${MAX_BYTES})`)
    writeFileSync(OUT, out)
    console.log(`[gym12] ${OUT}: ${W}×${H}, WebP q=${webp.q.toFixed(2)}, ${out.length} bytes`)
  } finally { await browser.close() }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e); process.exit(1) })
