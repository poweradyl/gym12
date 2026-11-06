// GYM 12: as linhas de conta de Ajustes no build do GYM 12. Sem servidor não há conta, login nem
// sync, e nada de "demo": só a frase que diz onde os treinos ficam.
import { Section, Row } from '../components/ui.jsx'
import { BRAND } from './flags.js'
import { runningInstalled } from './boot.js'
import { INSTALL_HASH } from './Gate.jsx'

export const ACCOUNT_LINE = 'Seus treinos ficam salvos neste celular.'

/** No lugar do cartão da conta, na raiz de Ajustes. */
export function AccountLine() {
  return <Section><Row icon="lock" iconTint="var(--acc)" title={ACCOUNT_LINE} /></Section>
}

/** A página "Conta" (só chega a ela quem busca por ela). */
export function AccountSection() {
  return <Section><Row icon="lock" iconTint="var(--acc)" title={ACCOUNT_LINE} /></Section>
}

/** A linha "Licenças" em Ajustes → Sobre (abre gym12/Licencas.jsx). */
export function LicencasRow({ open }) {
  return <Section><Row icon="shield" iconTint="var(--grey)" title="Licenças" accessory="chevron" onClick={open} /></Section>
}

export const MIDIA_CREDITO = 'Animações dos exercícios © Aliaksandr Makatserchyk, Gym visual, gymvisual.com.'

/**
 * O bloco da versão no fim de Ajustes → Sobre, no build do GYM 12: a versão, a atribuição da mídia
 * e o caminho para as Licenças. Sem citar o openGym (ele aparece só na tela de Licenças).
 */
export function SobreVersao({ version, license, open }) {
  return <div className="dim small sp-version g12-sobre-versao">
    {BRAND.name} v{version} · {license}<br />
    {MIDIA_CREDITO}{' '}
    <a href="#/settings/licencas" onClick={e => { e.preventDefault(); open() }}>Ver licenças</a>
  </div>
}

/**
 * Ajustes → Sobre, no lugar da "Dica" do upstream (que falava em "dados de visitante"): a linha que
 * abre a página de instalação (#/instalar, gym12/Gate.jsx). Some quando já roda como app instalado.
 */
export function InstallRow({ installed = runningInstalled() }) {
  if (installed) return null
  return <Section><Row icon="download" iconTint="var(--blue)" title="Instalar o GYM 12" accessory="chevron" onClick={() => { location.hash = INSTALL_HASH }} /></Section>
}
