// GYM 12: o lembrete de backup na raiz de Ajustes, logo abaixo do grupo de "Dados e backup".
// Discreto: uma linha que leva à página de backup e um "Agora não" que cala por 30 dias.
// Regras em backup.js. Não aparece fora do build do GYM 12.
import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { Section, Row } from '../components/ui.jsx'
import { STANDALONE } from './flags.js'
import { backupDue, lastBackupLabel, snoozeBackup } from './backup.js'

export default function BackupReminder({ open }) {
  const workouts = useStore(s => s.S?.workouts)
  const [hidden, setHidden] = useState(false)
  if (!STANDALONE || hidden || !backupDue(workouts)) return null
  return <Section className="gym12-backup">
    <Row icon="folder" iconTint="var(--orange)" title={'Faça o backup dos seus treinos — último backup: ' + lastBackupLabel()}
      accessory="chevron" onClick={open} />
    <Row title="Agora não" onClick={() => { snoozeBackup(); setHidden(true) }} />
  </Section>
}
