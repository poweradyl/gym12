// GYM 12: em que ambiente a página de instalação está (docs/gym12/INSTALL.md). Função pura: recebe o
// user agent e o que o navegador diz sobre toque e modo de exibição, e devolve um destes:
//   'installed'   já roda como app instalado (tela de início): a página nunca aparece;
//   'inapp'       navegador de dentro do Instagram, do Facebook ou do Messenger: abrir no navegador;
//   'ios-safari'  iPhone/iPad no Safari: Compartilhar → Adicionar à Tela de Início;
//   'ios-other'   iPhone/iPad em outro navegador (Chrome, Firefox, Edge, Opera, app do Google):
//                 o mesmo passo a passo, com a nota de que a instalação é pelo Safari;
//   'android'     Android fora dos apps acima: o pedido de instalação do navegador ou o menu ⋮;
//   'desktop'     o resto: abrir o link no celular.

// Navegadores embutidos (WebView) do Instagram e da Meta. O "Instagram 300.0.0.0" entra no UA
// tanto no iOS quanto no Android; o Facebook usa FBAN/FBAV/FBIOS (iOS) e FB_IAB/FBAV (Android).
export const INAPP_RE = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger/
// iPhone, iPad e iPod pelo nome. O iPadOS 13+ se apresenta como Mac ("Macintosh"): aí só o toque
// o denuncia (um Mac não tem tela de toque, maxTouchPoints 0).
const IOS_RE = /iPhone|iPad|iPod/
const MAC_RE = /Macintosh/
// Outros navegadores no iPhone: Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS), Opera (OPiOS) e o
// app do Google (GSA). Todos usam o WebKit, mas a instalação documentada é pelo Safari.
export const IOS_OTHER_RE = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//
const ANDROID_RE = /Android/

/**
 * @param {string} ua  navigator.userAgent
 * @param {{ maxTouchPoints?: number, standalone?: boolean, displayModeStandalone?: boolean }} [info]
 * @returns {'installed'|'inapp'|'ios-safari'|'ios-other'|'android'|'desktop'}
 */
export function detectEnv(ua, { maxTouchPoints = 0, standalone = false, displayModeStandalone = false } = {}) {
  if (standalone === true || displayModeStandalone === true) return 'installed'
  const s = String(ua || '')
  if (INAPP_RE.test(s)) return 'inapp'
  if (IOS_RE.test(s) || (MAC_RE.test(s) && Number(maxTouchPoints) > 1)) return IOS_OTHER_RE.test(s) ? 'ios-other' : 'ios-safari'
  if (ANDROID_RE.test(s)) return 'android'
  return 'desktop'
}

/** O ambiente deste navegador (para a página e para o Gate). */
export function currentEnv(win = globalThis) {
  try {
    const nav = win.navigator || {}
    return detectEnv(nav.userAgent, {
      maxTouchPoints: nav.maxTouchPoints,
      standalone: nav.standalone === true,
      displayModeStandalone: !!win.matchMedia?.('(display-mode: standalone)').matches,
    })
  } catch { return 'desktop' }
}
