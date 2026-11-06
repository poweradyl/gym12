// GYM 12 · gravação: o build "de gravação" do Reel, sobre o build do GYM 12 (vite.gym12.config.js),
// sem mudar o build de produção. Só para gravar as telas do app em localhost; nunca é publicado.
//   npx vite build --config vite.gravacao.config.js        (saída em dist-gravacao/)
//   npx vite preview --config vite.gravacao.config.js      (http://127.0.0.1:4430/)
// ou scripts/gym12-gravacao.sh na raiz (build + mídia dos exercícios + preview).
// O que muda (src/gym12/gravacao/): o histórico de exemplo da gravação no lugar do início vazio,
// sem peso corporal, medidas ou fotos, e o relógio começando em 06/11/2026 18:30.
import { mergeConfig } from 'vite'
import gym12 from './vite.gym12.config.js'
import gravacao from './src/gym12/gravacao/vite-plugin.js'

export default mergeConfig(gym12, {
  plugins: [gravacao()],
  // gym12/flags.js GRAVACAO: o boot do GYM 12 deixa o boot demo semear o histórico (gym12/boot.js).
  define: { __GYM12_GRAVACAO__: 'true' },
  build: { outDir: 'dist-gravacao' },
  preview: { host: '127.0.0.1', port: 4430, strictPort: true },
})
