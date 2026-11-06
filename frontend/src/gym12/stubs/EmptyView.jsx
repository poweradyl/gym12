// GYM 12: no build do GYM 12 (vite-plugin.js) as telas do Coach de IA e do painel de admin viram
// esta tela vazia. Ninguém chega a elas (os módulos estão desligados e não há servidor), mas o
// arquivo original sai do bundle junto com tudo o que ele importaria.
import { Navigate } from 'react-router-dom'

export default function EmptyView() {
  return <Navigate to="/home" replace />
}
