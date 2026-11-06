// GYM 12: a página de instalação (docs/gym12/INSTALL.md). Mostrada pelo Gate (gym12/Gate.jsx) a quem
// abre o link no navegador, fora do app instalado. Carregada sob demanda: só o build do GYM 12 a baixa.
//
// Ordem fixa: wordmark, kicker, título, celular com a captura real (install-screen.webp, copiada de
// brand/ para a raiz do dist pelo plugin), a faixa, o cartão de instruções do ambiente
// (install/detect.js), "Usar sem instalar" (sempre) e o rodapé. Sem crédito, sem links externos.
import { useEffect, useRef, useState } from 'react'
import { hideBoot } from '../../lib/boot.js'
import { getInstallPrompt, onInstallChange, promptInstall, wasInstalled } from '../boot.js'
import { currentEnv } from './detect.js'
import './install.css'

export const SCREEN_SRC = 'install-screen.webp'
export const SCREEN_W = 440
export const SCREEN_H = 926
// Quanto esperar pelo `beforeinstallprompt` antes de mostrar o caminho pelo menu ⋮.
export const PROMPT_WAIT_MS = 2500

/** O endereço do app para colar no navegador: sem o #/instalar. */
export function appLink(loc = globalThis.location) {
  try { return loc.origin + loc.pathname } catch { return '' }
}

/** Copia `text`: a API da área de transferência, ou o caminho antigo (WebViews sem a API). */
export async function copyText(text, nav = globalThis.navigator, doc = globalThis.document) {
  try { if (nav?.clipboard?.writeText) { await nav.clipboard.writeText(text); return true } } catch { /* tenta o antigo */ }
  try {
    const ta = doc.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.className = 'g12i-offscreen'
    doc.body.appendChild(ta)
    ta.select()
    const ok = doc.execCommand?.('copy') === true
    ta.remove()
    return ok
  } catch { return false }
}

/* ----------------------------------------------------------------- desenhos -- */

// O ícone Compartilhar do iOS: quadrado aberto em cima com a seta para cima.
const ShareIcon = () => <svg className="g12i-ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M8.5 10H6.5a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5h-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
</svg>

// "Adicionar à Tela de Início": quadrado arredondado com +.
const AddIcon = () => <svg className="g12i-ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
  <path d="M12 8.5v7M8.5 12h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
</svg>

// O menu ⋮ do Chrome no Android.
const KebabIcon = () => <svg className="g12i-ico" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <circle cx="12" cy="5.5" r="1.8" fill="currentColor" /><circle cx="12" cy="12" r="1.8" fill="currentColor" /><circle cx="12" cy="18.5" r="1.8" fill="currentColor" />
</svg>

// Barra do topo de um navegador embutido: × à esquerda, endereço no meio e os ••• destacados em lime
// no canto direito, com a seta apontando para eles. Genérica (Instagram, Facebook, Messenger).
const InAppBar = () => <svg className="g12i-bar" viewBox="0 0 300 92" aria-hidden="true" focusable="false">
  <rect x="1" y="1" width="298" height="52" rx="14" className="g12i-bar-bg" />
  <path d="M22 19l14 14M36 19L22 33" className="g12i-bar-mute" strokeWidth="2.4" strokeLinecap="round" />
  <rect x="60" y="17" width="150" height="18" rx="9" className="g12i-bar-url" />
  <circle cx="262" cy="27" r="19" className="g12i-bar-ring" strokeWidth="2" />
  <circle cx="252" cy="27" r="3.2" className="g12i-bar-dot" /><circle cx="262" cy="27" r="3.2" className="g12i-bar-dot" /><circle cx="272" cy="27" r="3.2" className="g12i-bar-dot" />
  <path d="M206 84c22-2 40-12 50-30" className="g12i-bar-arrow" strokeWidth="2.4" strokeLinecap="round" />
  <path d="M246 58l10-5 2 11" className="g12i-bar-arrow" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
</svg>

/* ------------------------------------------------------------------- partes -- */

function Steps({ items }) {
  return <ol className="g12i-steps">
    {items.map((it, i) => <li key={i}><span className="g12i-n" aria-hidden="true">{i + 1}</span><span className="g12i-step">{it}</span></li>)}
  </ol>
}

function CopyLink() {
  const [state, setState] = useState(null)   // null | 'ok' | 'erro'
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    const ok = await copyText(appLink())
    setState(ok ? 'ok' : 'erro')
    clearTimeout(timer.current)
    if (ok) timer.current = setTimeout(() => setState(null), 2400)
  }
  return <div className="g12i-copy">
    <button type="button" className="g12i-btn g12i-btn-2" onClick={copy}>Copiar link</button>
    <p className="g12i-copy-msg" role="status" aria-live="polite">
      {state === 'ok' ? 'Link copiado' : state === 'erro' ? <>Copie o endereço: <span className="g12i-link">{appLink()}</span></> : null}
    </p>
  </div>
}

const IOS_STEPS = [
  <>Toque em <b>Compartilhar</b> <ShareIcon /></>,
  <>Role e escolha <b>Adicionar à Tela de Início</b> <AddIcon /></>,
  <>Toque em <b>Adicionar</b>. O GYM 12 aparece na sua tela de início.</>,
]
const ANDROID_STEPS = [
  <>Toque em <span className="g12i-key"><KebabIcon /><span className="g12i-offscreen">⋮</span></span> no canto de cima</>,
  <>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b></>,
]

/** O estado do pedido de instalação do Android: 'espera' | 'botao' | 'menu' | 'pronto'. */
export function androidMode({ prompt, waited, dismissed, done }) {
  if (done) return 'pronto'
  if (prompt && !dismissed) return 'botao'
  return waited || dismissed ? 'menu' : 'espera'
}

function Android() {
  const [prompt, setPrompt] = useState(() => !!getInstallPrompt())
  const [done, setDone] = useState(() => wasInstalled())
  const [waited, setWaited] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), PROMPT_WAIT_MS)
    const sync = () => { setPrompt(!!getInstallPrompt()); if (wasInstalled()) setDone(true) }
    const stop = onInstallChange(sync)
    // O evento pode ter chegado entre o primeiro render e este efeito: confere de novo.
    sync()
    return () => { clearTimeout(t); stop() }
  }, [])
  const install = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') setDone(true)
    else setDismissed(true)
  }
  const mode = androidMode({ prompt, waited, dismissed, done })
  if (mode === 'pronto') return <p className="g12i-done" role="status">Pronto! Abra o GYM 12 pela tela de início.</p>
  if (mode === 'botao') return <button type="button" className="g12i-btn g12i-btn-1" onClick={install}>Instalar o GYM 12</button>
  if (mode === 'menu') return <Steps items={ANDROID_STEPS} />
  return <div className="g12i-wait" aria-busy="true"><span className="g12i-offscreen">Preparando a instalação…</span></div>
}

function Instructions({ env }) {
  if (env === 'inapp') return <>
    <InAppBar />
    <p className="g12i-lead">Toque nos <b>•••</b> no canto e escolha <b>Abrir no navegador</b>.</p>
    <CopyLink />
  </>
  if (env === 'ios-safari') return <Steps items={IOS_STEPS} />
  if (env === 'ios-other') return <>
    <p className="g12i-note">No iPhone, a instalação é pelo Safari.</p>
    <Steps items={IOS_STEPS} />
    <CopyLink />
  </>
  if (env === 'android') return <Android />
  return <p className="g12i-lead">Abra este link no celular.</p>
}

/* ------------------------------------------------------------------- página -- */

// A cascata dura 8 blocos × 80 ms + 500 ms; a classe sai um pouco depois, por garantia.
export const ENTER_MS = 1300

/**
 * Animar a entrada? Não com "reduzir movimento", nem com a página escondida (aba em segundo plano,
 * navegador embutido abrindo por trás), em que o relógio das animações pode ficar parado.
 */
export function wantsEntrance(win = globalThis) {
  try {
    if (win.document?.visibilityState && win.document.visibilityState !== 'visible') return false
    return !win.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  } catch { return false }
}

export default function InstallLanding({ onEnter, env: forced }) {
  const [env] = useState(() => forced || currentEnv())
  // A tela de abertura do index.html sai agora: sem isso, o vigia dele diria "demorando demais".
  // A entrada (fade + 16 px em cascata) é só enfeite: a classe que a liga sai depois de ENTER_MS,
  // aconteça a animação ou não, e sem ela todo o conteúdo já está visível.
  const [entering, setEntering] = useState(() => wantsEntrance())
  useEffect(() => {
    hideBoot()
    if (!entering) return
    const t = setTimeout(() => setEntering(false), ENTER_MS)
    return () => clearTimeout(t)
  }, [])
  return <main className={'g12i' + (entering ? ' g12i-enter' : '')} lang="pt-BR" data-env={env}>
    <p className="g12i-wm"><span className="g12i-offscreen">GYM 12</span><span aria-hidden="true">GYM <b>12</b></span></p>
    <p className="g12i-kicker">— APP DE TREINO GRÁTIS</p>
    <h1 className="g12i-title">Sua ficha de treino, <em>evoluída</em></h1>
    <div className="g12i-hero">
      <span className="g12i-ghost" aria-hidden="true">12</span>
      <div className="g12i-phone">
        <img src={SCREEN_SRC} width={SCREEN_W} height={SCREEN_H} alt="O GYM 12 com um treino em andamento: Supino reto com barra, séries e cargas." decoding="async" />
      </div>
    </div>
    <p className="g12i-band"><span>Grátis.</span> <span>Sem anúncio.</span> <span>Seus treinos ficam no seu celular.</span></p>
    <section className="g12i-card" aria-label="Como instalar">
      <Instructions env={env} />
    </section>
    <button type="button" className="g12i-btn g12i-btn-ghost" onClick={onEnter}>Usar sem instalar</button>
    <p className="g12i-foot">Funciona sem internet depois de instalado.</p>
  </main>
}
