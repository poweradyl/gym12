// GYM 12: as constantes da camada fina. `STANDALONE` só é verdadeiro no build do GYM 12
// (vite.gym12.config.js); no vitest e no build do upstream fica falso, e tudo continua como era.
// O `(import.meta.env || {})` é obrigatório: módulos que importam este arquivo também rodam em Node.
// `__GYM12_STANDALONE__` é definido (true) só por vite.gym12.config.js: vira constante no build, e o
// minificador apaga os ramos do upstream que o GYM 12 esconde (links, textos e URLs mortos no bundle).
/* global __GYM12_STANDALONE__ */
export const STANDALONE = typeof __GYM12_STANDALONE__ === 'boolean' ? __GYM12_STANDALONE__ : (import.meta.env || {}).VITE_STANDALONE === '1'

export const BRAND = {
  name: 'GYM 12',
  site: 'https://gym12.juniorsa.shop',
  host: 'gym12.juniorsa.shop',
  source: 'https://github.com/poweradyl/gym12',
}

// Idioma de quem nunca escolheu um (gym12/boot.js grava no cache de lib/default-lang.js).
export const DEFAULT_LANG = 'pt-BR'
