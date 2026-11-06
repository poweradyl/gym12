// GYM 12: a porta de entrada (main.jsx envolve o <App/> com ela). Fora do build do GYM 12 só devolve
// os filhos: não lê nada, não escuta nada, e a página de instalação nem é baixada (import sob demanda).
//
// No build do GYM 12 (docs/gym12/INSTALL.md):
//  - rodando como app instalado (display-mode standalone / navigator.standalone): direto ao app,
//    nunca a página de instalação, nem por #/instalar;
//  - no navegador, a página de instalação aparece na primeira visita e sempre em #/instalar (a linha
//    "Instalar o GYM 12" de Ajustes → Sobre leva até ela). "Usar sem instalar" grava
//    `gym12.skipInstall` e entra no app; nas próximas visitas o navegador vai direto ao app.
//  - Enquanto a página aparece, o <App/> não é montado (o HashRouter dele trocaria #/instalar por
//    #/home). A página chama hideBoot() ao montar, para o vigia do index.html não disparar.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { STANDALONE } from './flags.js'
import { runningInstalled } from './boot.js'

export const SKIP_KEY = 'gym12.skipInstall'
export const INSTALL_HASH = '#/instalar'

const InstallLanding = lazy(() => import('./install/InstallLanding.jsx'))

const storage = () => { try { return globalThis.localStorage || null } catch { return null } }

/** O endereço é o da página de instalação? (#/instalar, com ou sem barra/consulta no fim) */
export const isInstallHash = hash => /^#\/instalar\/?(?:[?#].*)?$/.test(String(hash || ''))

/** A pessoa já escolheu "Usar sem instalar" neste navegador? */
export function wasSkipped(ls = storage()) {
  try { return ls?.getItem(SKIP_KEY) === '1' } catch { return false }
}
/** Grava a escolha "Usar sem instalar". Armazenamento bloqueado: só vale para esta visita. */
export function markSkipped(ls = storage()) {
  try { ls?.setItem(SKIP_KEY, '1') } catch { /* bloqueado: segue sem gravar */ }
}

/** Mostrar a página de instalação? Instalado: nunca. No navegador: em #/instalar, ou se não dispensou. */
export function landingWanted({ installed, skipped, hash }) {
  if (installed) return false
  return isInstallHash(hash) || !skipped
}

/** Para onde vai quem entra no app: o endereço que abriu (um link de rotina, por exemplo), ou o Início. */
export function enterHash(hash) {
  return !hash || hash === '#' || hash === '#/' || isInstallHash(hash) ? '#/home' : hash
}

function Gate({ children }) {
  const [show, setShow] = useState(() => landingWanted({ installed: runningInstalled(), skipped: wasSkipped(), hash: location.hash }))
  // Aberta por #/instalar (não pela primeira visita): voltar no navegador para outro endereço a fecha.
  const byHash = useRef(isInstallHash(location.hash))

  useEffect(() => {
    const onHash = e => {
      let hash = location.hash
      try { if (e?.newURL) hash = new URL(e.newURL).hash } catch { /* fica o location.hash */ }
      if (isInstallHash(hash)) {
        if (runningInstalled()) return
        byHash.current = true
        setShow(true)
      } else if (byHash.current) {
        byHash.current = false
        setShow(false)
      }
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const enter = useCallback(() => {
    markSkipped()
    byHash.current = false
    // replaceState: o "voltar" não reabre a página de instalação, e não dispara hashchange.
    try { history.replaceState(history.state, '', enterHash(location.hash)) } catch { location.hash = enterHash(location.hash) }
    setShow(false)
    try { scrollTo(0, 0) } catch { /* sem janela (testes) */ }
  }, [])

  if (!show) return children
  return <Suspense fallback={null}><InstallLanding onEnter={enter} /></Suspense>
}

export function Gym12Gate({ children }) {
  if (!STANDALONE) return children
  return <Gate>{children}</Gate>
}
