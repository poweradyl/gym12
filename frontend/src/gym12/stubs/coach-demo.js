// GYM 12: substitui lib/coach-demo.js no build do GYM 12 (vite-plugin.js): o Coach de demonstração
// sai do bundle. Mesmos nomes do original, sem efeito.
const idle = () => ({ job: null, pending: null, cap: { used: 0, limit: 0 }, lastError: null })
const off = async () => ({ ok: false, error: 'unavailable' })
export function demoCohort() { return { ok: false, enabled: false } }
export const demoStatus = idle
export const demoReview = off
export const demoPlan = off
export const demoRefine = off
export const demoDebrief = off
export const demoAsk = off
export const demoAdapt = off
export const demoResolve = () => ({ ok: true })
export const demoDisclosure = () => null
