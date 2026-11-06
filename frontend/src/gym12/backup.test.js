// @vitest-environment happy-dom
// GYM 12: a regra do lembrete de backup (backup.js).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const DAY = 864e5
const NOW = new Date(2026, 10, 5, 12).getTime()
const iso = ms => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const w = daysAgo => ({ id: 'w' + daysAgo, d: iso(NOW - daysAgo * DAY) })

beforeEach(() => localStorage.clear())
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); localStorage.clear() })

const load = async standalone => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import('./backup.js')
}

describe('backupDue', () => {
  it('sem treino, nunca', async () => {
    const { backupDue } = await load(true)
    expect(backupDue([], { now: NOW, last: null, snoozedUntil: null })).toBe(false)
    expect(backupDue(undefined, { now: NOW, last: null, snoozedUntil: null })).toBe(false)
  })
  it('nunca exportou: só quando o treino mais antigo tem 7 dias ou mais', async () => {
    const { backupDue } = await load(true)
    expect(backupDue([w(3)], { now: NOW, last: null, snoozedUntil: null })).toBe(false)
    expect(backupDue([w(3), w(8)], { now: NOW, last: null, snoozedUntil: null })).toBe(true)
    expect(backupDue([{ start: NOW - 7 * DAY }], { now: NOW, last: null, snoozedUntil: null })).toBe(true)
  })
  it('já exportou: depois de 30 dias', async () => {
    const { backupDue } = await load(true)
    expect(backupDue([w(90)], { now: NOW, last: NOW - 29 * DAY, snoozedUntil: null })).toBe(false)
    expect(backupDue([w(90)], { now: NOW, last: NOW - 31 * DAY, snoozedUntil: null })).toBe(true)
  })
  it('"Agora não" cala por 30 dias', async () => {
    const { backupDue, snoozeBackup } = await load(true)
    snoozeBackup(NOW)
    expect(backupDue([w(90)], { now: NOW + 29 * DAY, last: null })).toBe(false)
    expect(backupDue([w(90)], { now: NOW + 31 * DAY, last: null })).toBe(true)
  })
  it('markBackup grava a data só no GYM 12, e o rótulo mostra nunca ou a data', async () => {
    let m = await load(false)
    m.markBackup(NOW)
    expect(localStorage.getItem('gym12.lastBackup')).toBe(null)
    expect(m.lastBackupLabel()).toBe('nunca')
    m = await load(true)
    m.markBackup(NOW)
    expect(m.lastBackupAt()).toBe(NOW)
    expect(m.lastBackupLabel()).toMatch(/2026/)
    expect(m.backupDue([w(90)], { now: NOW + DAY })).toBe(false)
  })
})