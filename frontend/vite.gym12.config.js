// GYM 12: o build do GYM 12 sobre o vite.config.js original, sem editá-lo.
//   npx vite build --config vite.gym12.config.js   (ou scripts/gym12-build.sh na raiz)
// Liga o modo demo do upstream (100% no navegador, sem servidor) e a flag do GYM 12. As variáveis
// entram em process.env antes do Vite ler o ambiente, então nenhum .env é necessário (e nenhum
// deve ter VITE_STANDALONE: o vitest o leria).
import { mergeConfig } from 'vite'
import base from './vite.config.js'
import gym12 from './src/gym12/vite-plugin.js'

process.env.VITE_DEMO = '1'
process.env.VITE_STANDALONE = '1'

// A mesma flag como constante de compilação (src/gym12/flags.js): os ramos escondidos saem do bundle.
export default mergeConfig(base, { plugins: [gym12()], define: { __GYM12_STANDALONE__: 'true' } })
