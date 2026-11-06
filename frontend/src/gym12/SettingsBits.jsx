// GYM 12: as linhas de conta de Ajustes no build do GYM 12. Sem servidor não há conta, login nem
// sync, e nada de "demo": só a frase que diz onde os treinos ficam.
import { Section, Row } from '../components/ui.jsx'

export const ACCOUNT_LINE = 'Seus treinos ficam salvos neste celular.'

/** No lugar do cartão da conta, na raiz de Ajustes. */
export function AccountLine() {
  return <Section><Row icon="lock" iconTint="var(--acc)" title={ACCOUNT_LINE} /></Section>
}

/** A página "Conta" (só chega a ela quem busca por ela). */
export function AccountSection() {
  return <Section><Row icon="lock" iconTint="var(--acc)" title={ACCOUNT_LINE} /></Section>
}
