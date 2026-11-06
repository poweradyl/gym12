// GYM 12 · gravação: o histórico de exemplo do build de gravação (vite.gravacao.config.js). O plugin
// de gravação (./vite-plugin.js) põe este módulo no lugar do stub de lib/demoSeed.js, que no build de
// produção deixa o GYM 12 vazio. O formato é o do lib/demoSeed.js do upstream (o mesmo
// buildDemoState() que o boot demo do useStore.js chama uma vez, em resetDemo), com o que o Reel
// pede:
//  - três rotinas comuns nas academias do Brasil, com os nomes do catálogo em pt-BR: Treino A
//    (peito e tríceps, a ficha do vídeo), Treino B (costas e bíceps) e Treino C (pernas);
//  - 9 semanas de treino, A no dia da semana de hoje, B três dias depois e C cinco dias depois
//    (com o relógio da gravação, 06/11/2026, sexta: A na sexta, B na segunda, C na quarta), com
//    duas sessões perdidas (B e C, nunca A);
//  - no supino reto com barra a carga sobe de 2,5 em 2,5 kg até 40 kg na última sessão (40 × 10
//    na 1ª série), então 42,5 kg hoje é recorde;
//  - nada de peso corporal, medidas ou fotos: sem pesagens, sem medidas, módulo Corpo e Níveis de
//    força desligados, pesagem antes do treino desligada.
// Determinístico: a mesma data dá sempre o mesmo histórico (sem sorteio).
import { isoOf } from '../../lib/format.js'

const DIA = 864e5

// [id do catálogo, séries, repetições, carga da ficha (0 = a ficha não diz)]. Os nomes ao lado são
// os que o app mostra em pt-BR (pacote do catálogo + gym12/locales/pt-BR.names.js).
export const ROTINAS = [
  { id: 'g12-treino-a', name: 'Treino A', emoji: 'barbell', dia: 0, ex: [
    ['0025', 4, 10, 40],   // Supino reto com barra
    ['0314', 3, 12, 16],   // Supino inclinado com halteres
    ['0596', 3, 12, 0],    // Crucifixo na máquina (voador)
    ['0200', 3, 12, 25],   // Tríceps pulley com corda
    ['0430', 3, 10, 0],    // Tríceps francês em pé com halter
  ] },
  { id: 'g12-treino-b', name: 'Treino B', emoji: 'pullup', dia: 3, ex: [
    ['0150', 4, 10, 50],   // Puxada frontal no cabo
    ['0180', 3, 12, 45],   // Remada baixa no cabo
    ['0027', 3, 10, 40],   // Remada curvada com barra
    ['0031', 3, 10, 25],   // Rosca direta com barra
    ['0313', 3, 12, 12],   // Rosca martelo com halteres
  ] },
  { id: 'g12-treino-c', name: 'Treino C', emoji: 'legs', dia: 5, ex: [
    ['0043', 4, 10, 60],   // Agachamento livre com barra
    ['0739', 4, 12, 150],  // Leg press 45°
    ['0585', 3, 12, 45],   // Cadeira extensora
    ['0586', 3, 12, 35],   // Mesa flexora
    ['0738', 4, 15, 90],   // Panturrilha no leg press 45°
  ] },
]

/** Semanas de histórico (a sessão k = SEMANAS é a mais antiga, k = 1 a da semana passada). */
export const SEMANAS = 9
/** Sessões perdidas: rotina → os k (semanas atrás) em que ela não aconteceu. */
export const PERDIDAS = { 'g12-treino-b': [4], 'g12-treino-c': [2] }

// A carga de cada sessão, da mais antiga (índice 0, k = 9) à mais recente (índice 8, k = 1). No
// Treino A a última sessão é sempre um dia de carga nova (com repetições faltando no fim): a
// progressão linear do app repete a carga hoje, então só o supino a 42,5 kg vira recorde.
export const CARGAS = {
  '0025': [30, 30, 32.5, 32.5, 35, 35, 37.5, 37.5, 40],
  '0314': [10, 10, 12, 12, 12, 14, 14, 14, 16],
  '0596': [35, 35, 40, 40, 40, 45, 45, 45, 50],
  '0200': [17.5, 17.5, 20, 20, 20, 22.5, 22.5, 22.5, 25],
  '0430': [10, 10, 12, 12, 12, 14, 14, 14, 16],
  '0150': [40, 40, 42.5, 42.5, 45, 45, 47.5, 47.5, 50],
  '0180': [35, 35, 37.5, 37.5, 40, 40, 42.5, 42.5, 45],
  '0027': [30, 30, 32.5, 32.5, 35, 35, 37.5, 37.5, 40],
  '0031': [20, 20, 20, 22.5, 22.5, 22.5, 25, 25, 25],
  '0313': [8, 8, 10, 10, 10, 10, 12, 12, 12],
  '0043': [40, 40, 45, 45, 50, 50, 55, 55, 60],
  '0739': [100, 100, 110, 110, 120, 130, 130, 140, 150],
  '0585': [30, 30, 35, 35, 35, 40, 40, 40, 45],
  '0586': [25, 25, 27.5, 27.5, 30, 30, 32.5, 32.5, 35],
  '0738': [60, 60, 70, 70, 80, 80, 80, 90, 90],
}

// O dia em que a carga sobe é o dia em que a última série (e, com 4 séries, a penúltima também)
// fica um pouco abaixo do alvo; na sessão seguinte, com a mesma carga, todas batem o alvo.
const repsDe = (series, reps, subiu) => Array.from({ length: series }, (_, i) =>
  !subiu ? reps : i === series - 1 ? reps - 2 : series > 3 && i === series - 2 ? reps - 1 : reps)

/** A rotina do jeito que o app guarda: { id, name, emoji, ex: [{ id, sets, reps, weight }] }. */
export const rotina = r => ({ id: r.id, name: r.name, emoji: r.emoji, ex: r.ex.map(([id, sets, reps, weight]) => ({ id, sets, reps, weight })) })

export function buildDemoState(now = new Date()) {
  const hoje = new Date(now); hoje.setHours(12, 0, 0, 0)
  const dow = hoje.getDay()
  const routines = ROTINAS.map(rotina)
  const week = Object.fromEntries(ROTINAS.map(r => [(dow + r.dia) % 7, r.id]))

  const sessoes = []
  for (let k = SEMANAS; k >= 1; k--) {
    const i = SEMANAS - k
    for (const r of ROTINAS) {
      if ((PERDIDAS[r.id] || []).includes(k)) continue
      const dia = new Date(hoje.getTime() - k * 7 * DIA + r.dia * DIA)
      if (dia >= hoje) continue
      sessoes.push({ r, i, dia })
    }
  }
  sessoes.sort((a, b) => a.dia - b.dia)

  const workouts = []
  const exWeights = {}
  const best = {}
  sessoes.forEach(({ r, i, dia }, n) => {
    const d = isoOf(dia)
    const prs = []
    const entries = r.ex.map(([id, series, reps]) => {
      const w = CARGAS[id][i]
      const antes = i > 0 ? CARGAS[id][i - 1] : w
      const sets = repsDe(series, reps, w > antes).map(rr => ({ w, r: rr, done: true }))
      if (best[id] && w > best[id]) prs.push(id)
      if (w > (best[id] || 0)) best[id] = w
      exWeights[id] = { w: Math.max(w, exWeights[id]?.w || 0), d }
      return { id, sets, topW: w }
    })
    // 18h e alguma coisa, de 50 a 68 minutos: varia com a sessão, sempre igual para a mesma data.
    const start = new Date(dia); start.setHours(18, 2 + (n * 7) % 24, 0, 0)
    const w = {
      id: 'g12-' + r.id.slice(-1) + '-' + d, d, start: start.getTime(), end: start.getTime() + (50 + (n * 5) % 19) * 60000,
      routineId: r.id, name: r.name, entries, prs,
    }
    w.vol = entries.reduce((v, e) => v + e.sets.reduce((s, x) => s + x.w * x.r, 0), 0)
    workouts.push(w)
  })

  return {
    lang: 'pt-BR', langAuto: false,
    enParens: { 'pt-BR': false },
    gifSize: 'mini',
    routines, week, dayPlan: {},
    workouts, exWeights,
    bodyweight: [], measurements: [], targetW: null,
    // Peso corporal, medidas e fotos fora das telas gravadas.
    modules: { body: false, strength: false },
    weighIn: false, showWeightCard: false,
    // A dica de deslizar a série (Workout.jsx) já foi vista: ela abriria por cima da 1ª série.
    hints: { swipeSets: true },
  }
}
