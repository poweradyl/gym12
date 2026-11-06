// GYM 12: a camada de tradução por cima dos pacotes do openGym (MAPA §6, opção A). lib/i18n.js
// chama overlayFor(idioma, pacote) em cada setLang e junta o resultado com merged():
//   ui    { chave em inglês: texto }   frases que trocam ou completam o pacote do idioma
//   names { id do exercício: nome }    nomes de exercícios (entram também na busca)
// Fora do build do GYM 12 devolve tudo vazio e o app fica exatamente como o upstream.
//
// Em todos os idiomas "openGym" vira "GYM 12" nos textos (nunca nas chaves). O inglês não tem
// pacote, as chaves são o próprio texto: a lista de chaves vem do pacote pt-BR (os 19 pacotes têm
// as mesmas chaves, scripts/check-source-strings.mjs), carregado sob demanda e precacheado pelo
// pós-build. Em pt-BR entram ainda as revisões de ./locales/pt-BR.ui.js e ./locales/pt-BR.names.js,
// importadas sob demanda (só quem usa pt-BR as baixa; o service worker as precacheia pela LAZY).
import { STANDALONE, BRAND } from './flags.js'

const EMPTY = Object.freeze({ ui: Object.freeze({}), names: Object.freeze({}) })

// "openGym" como palavra: não dentro de outra palavra, nem em endereço (github.com/…/openGym,
// openGym.ch) ou nome de arquivo. Sem lookbehind: o Safari 15 não entende (vite.config.js).
const WORD = /(^|[^\w/.@-])openGym(?![\w-]|\.\w)/g

/** O texto com "openGym" trocado pelo nome do GYM 12. Outros tipos voltam como vieram. */
export const rename = s => (typeof s === 'string' ? s.replace(WORD, (_, pre) => pre + BRAND.name) : s)

// Um valor de pacote: texto, ou objeto de formas de plural ({ one, few, other }).
const renameValue = v => {
  if (typeof v === 'string') return rename(v)
  if (!v || typeof v !== 'object' || Array.isArray(v)) return v
  let changed = false
  const out = {}
  for (const [k, inner] of Object.entries(v)) { out[k] = renameValue(inner); if (out[k] !== inner) changed = true }
  return changed ? out : v
}

/** Só as entradas do pacote que mudam com a troca do nome. */
export function renamedEntries(dict) {
  const out = {}
  for (const [k, v] of Object.entries(dict || {})) {
    const r = renameValue(v)
    if (r !== v) out[k] = r
  }
  return out
}

// As chaves em inglês que citam openGym, tiradas do pacote pt-BR uma vez só.
let enKeys = null
async function englishRenames() {
  if (!enKeys) {
    let pack = {}
    try { pack = (await import('../locales/pt-BR.js')).default || {} } catch { /* offline sem cache: fica sem a troca */ }
    enKeys = {}
    for (const k of Object.keys(pack)) { const r = rename(k); if (r !== k) enKeys[k] = r }
  }
  return enKeys
}

// Nomes de exercícios em pt-BR com a primeira letra maiúscula ("Supino reto com barra"): o pacote
// do catálogo vem todo em minúsculas, e no GYM 12 o pt-BR é um idioma "com caixa própria"
// (CASED_NAME_LANGS em lib/i18n-core.js), sem o `text-transform: capitalize` que poria maiúscula
// em cada palavra. Só a primeira letra muda; o resto (nomes próprios, siglas) fica como está.
const FIRST_LOWER = /^\p{Ll}/u
/** O nome com a primeira letra maiúscula, se ela for uma minúscula. */
export const sentenceCase = s => (typeof s === 'string' ? s.replace(FIRST_LOWER, c => c.toLocaleUpperCase('pt-BR')) : s)
/** { id: nome } do pacote com sentenceCase em cada nome. */
export const sentenceCased = names => {
  const out = {}
  for (const [id, n] of Object.entries(names || {})) out[id] = sentenceCase(n)
  return out
}

/**
 * { ui, names } do GYM 12 para o idioma `lang`, dados os pacotes já carregados: `dict` (frases,
 * vazio no inglês) e `names` (nomes de exercícios, ou null). Fora do build do GYM 12: { ui: {}, names: {} }.
 */
export async function overlayFor(lang, dict = {}, names = null) {
  if (!STANDALONE) return EMPTY
  if (lang === 'en') return { ui: await englishRenames(), names: {} }
  const ui = renamedEntries(dict)
  if (lang === 'pt-BR') {
    const load = async p => { try { return (await p).default || {} } catch { return {} } }
    const [ptBRui, ptBRnames] = await Promise.all([load(import('./locales/pt-BR.ui.js')), load(import('./locales/pt-BR.names.js'))])
    for (const [k, v] of Object.entries(ptBRui)) ui[k] = renameValue(v)
    return { ui, names: sentenceCased({ ...(names || {}), ...ptBRnames }) }
  }
  return { ui, names: {} }
}

/** `base` com `extra` por cima; o próprio `base` quando não há nada a juntar. */
export const merged = (base, extra) => (extra && Object.keys(extra).length ? { ...(base || {}), ...extra } : base)
