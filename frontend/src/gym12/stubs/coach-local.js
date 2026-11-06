// GYM 12: substitui lib/coach-local.js no build do GYM 12 (vite-plugin.js). O original importa o
// núcleo do Coach (api/coach/core) e os endereços dos provedores de IA; aqui ficam só os mesmos
// nomes, sem efeito. stubs.test.js confere que os nomes batem com os do original.
export const ADAPTERS = {}
export const TIMEOUT_MS = 5 * 60000
export const LOCAL_ENDPOINT_TIMEOUT_MS = 25 * 60000
export const timeoutFor = () => TIMEOUT_MS
export function setNotifier() {}
export const guardedFetch = () => Promise.reject(new Error('unavailable'))
const off = async () => ({ ok: false, error: 'unavailable' })
export async function localStatus() { return { job: null, pending: null, cap: { used: 0, limit: 0 }, lastError: null } }
export const localReview = off
export const localPlan = off
export const localRefine = off
export const localDebrief = off
export const localAsk = off
export const localAdapt = off
export async function localScheduled() { return null }
export function wallClock(now) {
  const p = n => String(n).padStart(2, '0')
  return { date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`, hhmm: `${p(now.getHours())}:${p(now.getMinutes())}`, weekday: now.getDay() }
}
export async function localResolve() { return { ok: true } }
export async function localForget() { return { ok: true } }
export async function localDisclosure() { return null }
export async function localModels() { return [] }
export function _resetLocal() {}
