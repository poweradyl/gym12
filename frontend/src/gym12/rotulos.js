// GYM 12: rótulos que o upstream escreve fora do t() e que, em pt-BR, apareciam em inglês.
//  - "1Y" dos botões de período (Estatísticas e Medidas) vira "1A" pela camada pt-BR
//    (./locales/pt-BR.ui.js). A chave vai em variável: a chamada com o texto literal faria o
//    check-source-strings cobrar a chave dos 19 pacotes do upstream.
//  - Os nomes das rotinas dos modelos de divisão (lib/starter.js) são gravados como rotinas do
//    usuário, que não são traduzidas depois: no GYM 12, em pt-BR, já nascem em português.
//  - O selo de recorde do sheets.jsx ("PR" no histórico do exercício e no treino salvo, "{n} PR"
//    na lista de treinos) vira "Recorde" / "1 recorde" / "2 recordes" pela camada pt-BR. As chaves
//    também vão em variável; sem tradução, sai exatamente o texto do upstream.
// Fora do build do GYM 12 (ou em outro idioma) tudo fica como no upstream.
import { STANDALONE } from './flags.js'
import { t, tn, getLang } from '../lib/i18n-core.js'

const ONE_YEAR = '1Y'
/** O rótulo "1 ano" dos botões de período: "1A" em pt-BR no GYM 12, "1Y" no resto. */
export const oneYear = () => t(ONE_YEAR)

// Os nomes de lib/starter.js (PPL, UPPER_LOWER, FULL_BODY, FIVE_BY_FIVE). "5×5 A/B/C" já serve.
export const STARTER_NAMES_PT_BR = {
  'Push Day': 'Empurrar',
  'Pull Day': 'Puxar',
  'Leg Day': 'Pernas',
  'Upper A': 'Superior A',
  'Lower A': 'Inferior A',
  'Upper B': 'Superior B',
  'Lower B': 'Inferior B',
  'Full Body A': 'Corpo inteiro A',
  'Full Body B': 'Corpo inteiro B',
  'Full Body C': 'Corpo inteiro C',
}
/** O nome de uma rotina de modelo, em pt-BR no GYM 12 quando o app está em pt-BR. */
export const starterName = name => (STANDALONE && getLang() === 'pt-BR' && STARTER_NAMES_PT_BR[name]) || name

const PR = 'PR'
const PR_ONE = '{0} PR'
const PR_MANY = '{0} PRs'
/** O selo de recorde: "Recorde" em pt-BR no GYM 12, "PR" no resto. */
export const prBadge = () => t(PR)
/** "{n} PR" da lista de treinos: "1 recorde" / "2 recordes" em pt-BR no GYM 12, "{n} PR" no resto. */
export const prCount = n => (t(PR_MANY) !== PR_MANY ? tn(PR_ONE, PR_MANY, n) : n + ' PR')
