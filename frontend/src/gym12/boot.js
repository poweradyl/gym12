// GYM 12: o primeiro import de main.jsx. Fora do build do GYM 12 não faz nada.
//
// No build do GYM 12, antes de o app ler o armazenamento:
//  - grava `gym_demo_seeded_v1`: o boot demo do upstream (useStore.js) acha que já semeou e cai no
//    perfil vazio de freshState(). O app começa VAZIO, sem dados de exemplo;
//    (no build de gravação, GRAVACAO, a chave NÃO é gravada: o boot demo semeia o histórico de
//    exemplo da gravação, gym12/gravacao/seed.js, que o plugin de gravação põe no lugar do stub);
//  - grava `gym_default_lang` = pt-BR: o cache que lib/default-lang.js consulta para quem nunca
//    escolheu idioma. Quem escolhe outro no seletor fica com ele (só grava se não existir);
//  - guarda o `beforeinstallprompt` e o `appinstalled` para a futura página de instalação;
//  - pede armazenamento persistente (navigator.storage.persist) quando roda instalado e depois do
//    primeiro treino concluído.
//
// Pacotes pt-BR offline (MAPA §9): NÃO são importados aqui. scripts/postbuild.mjs os põe na lista
// LAZY do service worker, que os baixa na instalação. Importá-los estaticamente colocaria ~1 MB de
// texto no bundle de entrada, lido em toda abertura (e também no build do upstream, que usa o
// mesmo main.jsx), só para ter o mesmo resultado offline.
//
// O CSS da marca (./gym12.css, com as fontes) não é importado aqui: o plugin do GYM 12
// (vite-plugin.js) acrescenta o import a este arquivo só no build do GYM 12, para que o build do
// upstream e os testes nunca carreguem as cores, as fontes nem os arquivos woff2.
import { STANDALONE, GRAVACAO, DEFAULT_LANG } from './flags.js'

export const SEEDED_KEY = 'gym_demo_seeded_v1'
export const LANG_KEY = 'gym_default_lang'

const storage = () => { try { return globalThis.localStorage || null } catch { return null } }

/** Grava as chaves de início vazio e pt-BR, só as que ainda não existem. */
export function seedKeys(ls = storage(), { gravacao = GRAVACAO } = {}) {
  if (!ls) return
  try {
    if (!gravacao && ls.getItem(SEEDED_KEY) === null) ls.setItem(SEEDED_KEY, '1')
    if (ls.getItem(LANG_KEY) === null) ls.setItem(LANG_KEY, DEFAULT_LANG)
  } catch { /* armazenamento bloqueado: o app abre como der */ }
}

/* ------------------------------ instalação ------------------------------ */

let installEvent = null
let installed = false
const subs = new Set()
const notify = () => subs.forEach(fn => { try { fn() } catch { /* um ouvinte não derruba os outros */ } })

/** O `beforeinstallprompt` guardado (Chrome/Edge/Android), ou null. */
export const getInstallPrompt = () => installEvent
/** Se o navegador avisou `appinstalled` nesta sessão. */
export const wasInstalled = () => installed
/** Avisa quando o evento de instalação chega, é usado ou o app é instalado. Devolve o "desinscrever". */
export function onInstallChange(fn) { subs.add(fn); return () => subs.delete(fn) }

/** Abre o pedido de instalação do navegador. 'accepted' | 'dismissed' | null (sem evento). */
export async function promptInstall() {
  const e = installEvent
  if (!e) return null
  installEvent = null
  notify()
  try { await e.prompt(); return (await e.userChoice)?.outcome || null } catch { return null }
}

/** Rodando como app instalado (tela inicial), não numa aba. */
export function runningInstalled(win = globalThis) {
  try { return !!(win.matchMedia?.('(display-mode: standalone)').matches || win.navigator?.standalone === true) } catch { return false }
}

/** Pede ao navegador para não apagar os dados sob pressão de espaço. Inofensivo se negar. */
export function askPersist(nav = globalThis.navigator) {
  try {
    const s = nav?.storage
    if (!s?.persist) return Promise.resolve(false)
    return Promise.resolve(s.persisted?.()).then(p => p || s.persist()).catch(() => false)
  } catch { return Promise.resolve(false) }
}

function listen(win) {
  if (!win?.addEventListener) return
  win.addEventListener('beforeinstallprompt', e => { installEvent = e; notify() })
  win.addEventListener('appinstalled', () => { installed = true; installEvent = null; notify(); askPersist() })
}

// Depois do primeiro treino concluído: o store já está carregado (main.jsx o importa), então o
// import dinâmico só pega a mesma instância, sem mudar a ordem dos módulos.
function persistAfterFirstWorkout() {
  import('../store/useStore.js').then(({ useStore }) => {
    let seen = (useStore.getState().S?.workouts || []).length
    const stop = useStore.subscribe(st => {
      const n = (st.S?.workouts || []).length
      if (n > seen) { stop(); askPersist() }
      seen = n
    })
  }).catch(() => {})
}

// A Fraunces do wordmark nas imagens de compartilhamento (lib/card-draw.js): o canvas não espera
// fonte, então ela é pedida já na abertura. Sem ela, o cartão sai com a fonte do sistema.
export function loadBrandFont(doc = globalThis.document) {
  try { return Promise.resolve(doc?.fonts?.load?.('700 40px Fraunces', 'GYM 12')).catch(() => null) } catch { return Promise.resolve(null) }
}

export function bootGym12(win = globalThis) {
  seedKeys()
  loadBrandFont(win.document)
  listen(win)
  if (runningInstalled(win)) askPersist()
  persistAfterFirstWorkout()
}

if (STANDALONE) bootGym12()
