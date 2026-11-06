// GYM 12: a variante da tela de Licenças, só no build do ambiente de teste
// (scripts/gym12-build-teste.sh: GYM12_AMBIENTE=teste e VITE_TESTE_LICENCA=1). O plugin
// (vite-plugin.js) troca o import de ./Licencas.jsx por este arquivo só nesse build; no de produção
// ele nunca é resolvido e não entra no bundle (o pós-build confere pela faixa abaixo).
//
// O conteúdo da variante será definido pelo time do dono. Por enquanto: a faixa e a mesma tela.
import Licencas from './Licencas.jsx'
import { TESTE_BANNER } from './teste-licenca.js'

export * from './Licencas.jsx'

export default function LicencasTeste() {
  return <>
    <div className="g12-lic-teste" role="note">{TESTE_BANNER}</div>
    <Licencas />
  </>
}
