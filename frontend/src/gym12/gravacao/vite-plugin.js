// GYM 12 · gravação: o plugin do build de gravação (vite.gravacao.config.js), por cima do plugin do
// GYM 12 (que continua fazendo tudo o que faz no build de produção). Só duas coisas mudam:
//  - load: o stub dos dados de exemplo (gym12/stubs/demoSeed.js, que deixa o GYM 12 vazio) passa a
//    reexportar o histórico de exemplo da gravação (./seed.js). O plugin do GYM 12 já troca
//    lib/demoSeed.js pelo stub no resolveId; aqui só o conteúdo do stub muda, neste build;
//  - transform: o gym12/boot.js (o primeiro import do main.jsx) importa antes de tudo o relógio
//    fixo da gravação (./relogio.js), os ganchos do gravador (./ganchos.js, window.__g12gravacao) e
//    o CSS da gravação (./gravacao.css, que tira o "Fotos e vídeos" do resumo do treino).
// O build de produção (vite.gym12.config.js) nunca carrega este arquivo.
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))   // frontend/src/gym12/gravacao
const GYM12 = resolve(HERE, '..')                      // frontend/src/gym12

export const STUB = join(GYM12, 'stubs/demoSeed.js')
export const BOOT = join(GYM12, 'boot.js')
export const STUB_CODE = "// GYM 12 · gravação: o histórico de exemplo da gravação no lugar do stub vazio.\nexport { buildDemoState } from '../gravacao/seed.js'\n"
export const BOOT_IMPORTS = "import './gravacao/relogio.js'\nimport './gravacao/ganchos.js'\nimport './gravacao/gravacao.css'\n"

const clean = id => id.split('?')[0]

export default function gravacao() {
  return {
    name: 'gym12-gravacao',
    enforce: 'pre',
    load(id) { return clean(id) === STUB ? { code: STUB_CODE, map: null } : null },
    transform(code, id) { return clean(id) === BOOT ? { code: BOOT_IMPORTS + code, map: null } : null },
  }
}
