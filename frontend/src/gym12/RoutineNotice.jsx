// GYM 12: o aviso na criação/edição de rotina (views/RoutineEdit.jsx, logo após o cabeçalho).
// Não aparece fora do build do GYM 12.
import Icon from '../components/Icon.jsx'
import { STANDALONE } from './flags.js'

export const ROUTINE_NOTICE = 'O seu treino é prescrito pelo seu profissional de educação física. O GYM 12 guarda e mostra a sua evolução.'

export default function RoutineNotice() {
  if (!STANDALONE) return null
  return <div className="card gym12-notice" role="note"
    style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16, color: 'var(--label-2)' }}>
    <Icon name="info" style={{ flex: 'none', marginTop: 1 }} />
    <p className="small" style={{ margin: 0 }}>{ROUTINE_NOTICE}</p>
  </div>
}
