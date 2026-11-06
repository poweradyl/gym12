// @vitest-environment happy-dom
// GYM 12: o nome dos arquivos de backup ("gym12-backup-…" no standalone, "opengym-backup-…" no
// upstream) e a compatibilidade com os backups antigos "opengym-backup-*" (importação do zip e
// limpeza dos backups automáticos).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ files: new Map() }))

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA', Documents: 'DOCUMENTS', Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
  Filesystem: {
    writeFile: async ({ path, directory, data }) => { h.files.set(directory + '/' + path, data); return { uri: 'file://' + path } },
    readdir: async ({ path, directory }) => {
      const prefix = directory + '/' + (path ? path + '/' : '')
      const names = [...h.files.keys()].filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length))
      return { files: names.map(name => ({ name, type: 'file', size: 1, uri: 'file://' + name })) }
    },
    deleteFile: async ({ path, directory }) => { h.files.delete(directory + '/' + path) },
  },
}))

beforeEach(() => h.files.clear())
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

const load = async (standalone, mod = './backup.js') => {
  vi.resetModules()
  if (standalone) vi.stubEnv('VITE_STANDALONE', '1')
  return import(mod)
}

describe('nome do backup', () => {
  it('GYM 12: gym12-backup-AAAA-MM-DD.json / .zip e gym12-backup.json no zip', async () => {
    const b = await load(true)
    expect(b.backupFileName('2026-11-06')).toBe('gym12-backup-2026-11-06.json')
    expect(b.backupFileName('2026-11-06', '.zip')).toBe('gym12-backup-2026-11-06.zip')
    expect(b.backupFileName('2026-11-06', '-2.json')).toBe('gym12-backup-2026-11-06-2.json')
    expect(b.BACKUP_JSON_NAME).toBe('gym12-backup.json')
    expect(b.BACKUP_JSON_NAMES).toEqual(['gym12-backup.json', 'opengym-backup.json'])
  })
  it('upstream: continua opengym-backup', async () => {
    const b = await load(false)
    expect(b.backupFileName('2026-11-06')).toBe('opengym-backup-2026-11-06.json')
    expect(b.BACKUP_JSON_NAME).toBe('opengym-backup.json')
    expect(b.backupReadme('openGym x')).toBe('openGym x')
  })
  it('a limpeza (lib/mobile.js, igual ao plugin Android) reconhece os dois prefixos, e só os nomes datados', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(import.meta.dirname + '/../lib/mobile.js', 'utf8')
    const re = new RegExp(/const AUTO_BACKUP_NAME = \/(.+)\//.exec(src)[1])
    for (const n of ['gym12-backup-2026-01-02.json', 'gym12-backup-2026-01-02-2.json', 'opengym-backup-2026-01-02.json', 'opengym-backup-2026-01-02-9.json']) expect(re.test(n)).toBe(true)
    for (const n of ['gym12-backup-latest.json', 'opengym-backup-2026-01-02.json.bak', 'xgym12-backup-2026-01-02.json', 'gym12-backup-2026-01-02.zip', 'notes.txt']) expect(re.test(n)).toBe(false)
  })
  it('autoBackupKey: a data sem o prefixo', async () => {
    const { autoBackupKey } = await load(true)
    expect(autoBackupKey('opengym-backup-2026-01-02-2.json')).toBe('2026-01-02-2.json')
    expect(autoBackupKey('gym12-backup-2026-01-02.json')).toBe('2026-01-02.json')
  })
})

describe('backup automático no GYM 12', () => {
  const day = n => { const d = new Date(2026, 0, 1); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
  const inFolder = () => [...h.files.keys()].filter(k => k.startsWith('DOCUMENTS/openGym/')).map(k => k.slice('DOCUMENTS/openGym/'.length)).sort()

  it('grava gym12-backup-<hoje>.json e limpa pela data, misturando os antigos opengym-backup-*', async () => {
    const { writeAutoBackup, AUTO_BACKUP_KEEP } = await load(true, '../lib/mobile.js')
    const { todayISO } = await import('../lib/format.js')
    // 10 antigos do openGym (dias 0–9) e 10 novos do GYM 12 (dias 10–19), mais um arquivo qualquer.
    for (let i = 0; i < 10; i++) h.files.set('DOCUMENTS/openGym/opengym-backup-' + day(i) + '.json', '{}')
    for (let i = 10; i < 20; i++) h.files.set('DOCUMENTS/openGym/gym12-backup-' + day(i) + '.json', '{}')
    h.files.set('DOCUMENTS/openGym/notes.txt', ''); h.files.set('DOCUMENTS/openGym/gym12-backup-latest.json', '')
    await writeAutoBackup({ n: 1 })
    const today = 'gym12-backup-' + todayISO() + '.json'
    expect(JSON.parse(h.files.get('DOCUMENTS/openGym/' + today))).toEqual({ n: 1 })
    const dated = inFolder().filter(n => n !== 'notes.txt' && n !== 'gym12-backup-latest.json')
    expect(dated).toHaveLength(AUTO_BACKUP_KEEP)
    // Ficam os 13 mais novos pela data (os 10 do GYM 12 e os 3 últimos do openGym) + o de hoje.
    const expected = [today, ...[...Array(10)].map((_, i) => 'gym12-backup-' + day(10 + i) + '.json'), ...[7, 8, 9].map(i => 'opengym-backup-' + day(i) + '.json')]
    expect(dated).toEqual(expected.sort())
    expect(inFolder()).toEqual(expect.arrayContaining(['notes.txt', 'gym12-backup-latest.json']))
  })
})

describe('zip de backup', () => {
  it('GYM 12: o zip leva gym12-backup.json e o README diz GYM 12', async () => {
    const { exportBackupZip } = await load(true, '../lib/backup-media.js')
    const { readZip } = await import('../lib/zip.js')
    const out = await exportBackupZip({ workouts: [], routines: [] }, { fetchOne: null })
    const entries = await readZip(new File([out.blob], 'x.zip'))
    expect(entries.map(e => e.name)).toContain('gym12-backup.json')
    expect(entries.map(e => e.name)).not.toContain('opengym-backup.json')
    const readme = await entries.find(e => e.name === 'README.txt').blob.text()
    expect(readme).toContain('gym12-backup.json    your data')
    expect(readme).not.toMatch(/openGym/)
    expect(readme).toContain('GYM 12 -> Settings')
  })
  it('GYM 12: importa o zip novo e o antigo (opengym-backup.json)', async () => {
    const { readBackupFile } = await load(true, '../lib/backup-media.js')
    const { zipStore } = await import('../lib/zip.js')
    const S = { workouts: [{ id: 'w1', d: '2026-11-01', entries: [] }], routines: [] }
    for (const name of ['gym12-backup.json', 'opengym-backup.json']) {
      const zip = await zipStore([{ name, blob: new Blob([JSON.stringify(S)]) }])
      const read = await readBackupFile(new File([zip], 'gym12-backup-2026-11-06.zip'))
      expect(read.state.workouts[0].id).toBe('w1')
    }
  })
  it('upstream: o zip continua com opengym-backup.json', async () => {
    const { exportBackupZip, BACKUP_JSON } = await load(false, '../lib/backup-media.js')
    const { readZip } = await import('../lib/zip.js')
    expect(BACKUP_JSON).toBe('opengym-backup.json')
    const out = await exportBackupZip({ workouts: [], routines: [] }, { fetchOne: null })
    const entries = await readZip(new File([out.blob], 'x.zip'))
    expect(entries.map(e => e.name)).toContain('opengym-backup.json')
    const readme = await entries.find(e => e.name === 'README.txt').blob.text()
    expect(readme).toContain('opengym-backup.json  your data')
  })
})
