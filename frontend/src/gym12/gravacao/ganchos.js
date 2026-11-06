// GYM 12 · gravação: os ganchos do gravador (./gravar.mjs) na página, em `window.__g12gravacao`. Só
// existem no build de gravação (o plugin de gravação importa este módulo no topo do gym12/boot.js).
// Não importa nada na carga: o store vem por import dinâmico só quando o gravador chama, a mesma
// instância que o app já carregou (como o persistAfterFirstWorkout do gym12/boot.js), então a ordem
// dos módulos do app não muda.
//
// A rotina ganha exercícios pelo mesmo `update` do store que o "+" do seletor usa na edição de rotina
// (views/RoutineEdit.jsx, addExercise): a tela que aparece na gravação é a do app, reagindo à rotina.
const store = () => import('../../store/useStore.js').then(m => m.useStore)

/** Os ganchos, sobre um `getStore` (função que devolve o store do zustand). */
export function ganchos(getStore = store) {
  const rotina = (s, id) => {
    const r = s.routines.find(x => x.id === id)
    if (!r) throw new Error('rotina não encontrada: ' + id)
    return r
  }
  return {
    /** Os exercícios da rotina, como estão salvos: [{ id, sets, reps, weight, … }]. */
    async exerciciosDa(id) { return structuredClone(rotina((await getStore()).getState().S, id).ex) },
    /** Deixa a rotina sem exercícios (o começo da gravação "rotina"). */
    async esvaziar(id) { (await getStore()).getState().update(s => { rotina(s, id).ex = [] }) },
    /** Acrescenta um exercício ao fim da rotina, como o "+" do seletor. */
    async acrescentar(id, cfg) { (await getStore()).getState().update(s => { rotina(s, id).ex.push(structuredClone(cfg)) }) },
  }
}

if (typeof window !== 'undefined') window.__g12gravacao = ganchos()
