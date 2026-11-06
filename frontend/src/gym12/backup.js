// GYM 12: o lembrete mensal de backup (Ajustes, perto de "Dados e backup"). Lógica pura aqui,
// a tela em BackupReminder.jsx. Tudo em localStorage deste aparelho, nunca no estado do app
// (que é o que vai no backup):
//   gym12.lastBackup     ms do último export JSON/ZIP concluído (Settings.jsx doExport/doExportZip)
//   gym12.backupSnooze   ms até quando o "Agora não" cala o lembrete
import { STANDALONE } from './flags.js'

export const LAST_KEY = 'gym12.lastBackup'
export const SNOOZE_KEY = 'gym12.backupSnooze'
const DAY = 864e5
export const REMIND_AFTER_DAYS = 30   // desde o último backup
export const FIRST_AFTER_DAYS = 7     // nunca exportou: o treino mais antigo tem pelo menos isso
export const SNOOZE_DAYS = 30

const ls = () => { try { return globalThis.localStorage || null } catch { return null } }
const readMs = key => { try { const v = Number(ls()?.getItem(key)); return Number.isFinite(v) && v > 0 ? v : null } catch { return null } }
const writeMs = (key, ms) => { try { ls()?.setItem(key, String(ms)) } catch { /* sem armazenamento: o lembrete volta a aparecer */ } }

/** Grava que um backup acabou de sair. No-op fora do build do GYM 12. */
export function markBackup(now = Date.now()) { if (STANDALONE) writeMs(LAST_KEY, now) }
/** "Agora não": 30 dias sem o lembrete. */
export function snoozeBackup(now = Date.now()) { writeMs(SNOOZE_KEY, now + SNOOZE_DAYS * DAY) }
export const lastBackupAt = () => readMs(LAST_KEY)

// "2026-10-01" → ms da meia-noite local; o horário de início quando o treino tem.
const workoutMs = w => {
  if (Number.isFinite(w?.start) && w.start > 0) return w.start
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(w?.d || ''))
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : null
}

/**
 * Se o lembrete aparece: há treino registrado, não está adiado, e
 *  - já houve backup e faz mais de 30 dias; ou
 *  - nunca houve backup e o treino mais antigo tem 7 dias ou mais.
 */
export function backupDue(workouts, { now = Date.now(), last = lastBackupAt(), snoozedUntil = readMs(SNOOZE_KEY) } = {}) {
  const times = (Array.isArray(workouts) ? workouts : []).map(workoutMs).filter(Number.isFinite)
  if (!times.length) return false
  if (snoozedUntil && now < snoozedUntil) return false
  if (last) return now - last > REMIND_AFTER_DAYS * DAY
  return now - Math.min(...times) >= FIRST_AFTER_DAYS * DAY
}

/** "12 de out. de 2026" ou "nunca". */
export function lastBackupLabel(last = lastBackupAt()) {
  if (!last) return 'nunca'
  try { return new Date(last).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return 'nunca' }
}
