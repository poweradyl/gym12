// GYM 12 · gravação: o relógio do build de gravação começa sempre em 06/11/2026, 18:30 (horário de
// Brasília) e anda normalmente a partir daí, para o relógio do app, o "hoje" e as datas do histórico
// ficarem iguais em toda gravação. O plugin de gravação (./vite-plugin.js) importa este módulo antes
// de tudo (no topo do gym12/boot.js, o primeiro import do main.jsx); fora desse build ele não existe.
//
// O gravador (./gravar.mjs) controla o tempo pelo Playwright (page.clock, já na mesma data) e liga
// `window.__G12_RELOGIO_LIVRE__` antes de a página carregar: aí este módulo não mexe em nada.
export const RELOGIO = '2026-11-06T18:30:00-03:00'
export const LIVRE = '__G12_RELOGIO_LIVRE__'

/**
 * Troca o `Date` de `g` por um que começa em `alvo` (ms) agora e anda junto com o relógio de
 * verdade. Devolve false (sem mexer) quando `g[LIVRE]` está ligado ou o relógio já foi fixado.
 */
export function fixarRelogio(g = globalThis, alvo = Date.parse(RELOGIO)) {
  if (!g?.Date || g[LIVRE] || g.Date.g12Fixo) return false
  const Real = g.Date
  const desvio = alvo - Real.now()
  function D(...args) {
    if (!new.target) return new Real(Real.now() + desvio).toString()   // Date() como função
    return args.length ? new Real(...args) : new Real(Real.now() + desvio)
  }
  Object.setPrototypeOf(D, Real)
  D.prototype = Real.prototype
  D.now = () => Real.now() + desvio
  D.g12Fixo = true
  g.Date = D
  return true
}

fixarRelogio()
