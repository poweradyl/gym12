// GYM 12: a tela "Licenças" (Ajustes → Sobre → Licenças). É o ÚNICO lugar do app que cita o openGym
// (decisão do dono): a base do GYM 12, a AGPL-3.0, o código-fonte deste build, os avisos de
// terceiros, a mídia da Gym visual, as fontes e as bibliotecas do bundle.
//
// Os textos longos são arquivos estáticos em dist/licencas/ (o plugin os emite no build; o pós-build
// os põe na LAZY do service worker, então abrem sem rede depois de instalado). O aviso da mídia vem
// de catalogue/media/NOTICE.md, embutido no bundle, palavra por palavra.
//
// Texto em pt-BR literal (sem t()): o GYM 12 só fala português.
/* global __GYM12_COMMIT__ */
import { useEffect, useState } from 'react'
import { Section } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { BRAND } from './flags.js'
import MIDIA_NOTICE from '../../../catalogue/media/NOTICE.md?raw'

export const FRASE_BASE = 'GYM 12 é baseado no openGym, de Duarte Santos, licenciado sob a GNU AGPL-3.0, sem nenhuma garantia.'
export const FRASE_DIREITOS = 'Você pode copiar, modificar e redistribuir o GYM 12 nos termos da GNU AGPL-3.0.'
export const COMMIT = typeof __GYM12_COMMIT__ === 'string' ? __GYM12_COMMIT__ : 'desconhecido'
/* global __APP_VERSION__ */
export const VERSAO = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0'

/** O aviso da Gym visual, como está em catalogue/media/NOTICE.md: o parágrafo do © (com o NOTICE TO DEVELOPERS). */
export function avisoMidia(notice = MIDIA_NOTICE) {
  return notice.split(/\r?\n\s*\r?\n/).map(p => p.trim()).find(p => p.startsWith('©')) || ''
}

// Os textos de dist/licencas/, buscados uma vez por sessão.
const cache = new Map()
function carregar(url, as = 'text') {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(r => {
      if (!r.ok) throw new Error(String(r.status))
      return as === 'json' ? r.json() : r.text()
    }).catch(e => { cache.delete(url); throw e }))
  }
  return cache.get(url)
}

/** Um link externo com a cara de uma linha de Ajustes. */
function LinkRow({ icon, title, href, sub }) {
  return <a className="lrow tap g12-lic-link" href={href} target="_blank" rel="noopener noreferrer">
    <span className="lrow-i" style={{ '--tint': 'var(--acc)' }}><Icon name={icon} /></span>
    <span className="lrow-m"><span className="lrow-t">{title}</span>{sub && <span className="lrow-s">{sub}</span>}</span>
    <Icon name="chevronRight" className="lrow-c" />
  </a>
}

/** Uma linha que abre (e fecha) um texto completo, em monoespaçada, com rolagem própria. */
export function TextoCompleto({ icon = 'note', title, url, sub, texto: dado = null }) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState(dado)
  const [erro, setErro] = useState(false)
  useEffect(() => {
    if (!aberto || texto != null || !url) return
    let vivo = true
    setErro(false)
    carregar(url).then(t => { if (vivo) setTexto(t) }, () => { if (vivo) setErro(true) })
    return () => { vivo = false }
  }, [aberto, texto, url])
  return <>
    <button type="button" className="lrow tap g12-lic-toggle" aria-expanded={aberto} onClick={() => setAberto(a => !a)}>
      <span className="lrow-i" style={{ '--tint': 'var(--grey)' }}><Icon name={icon} /></span>
      <span className="lrow-m"><span className="lrow-t">{title}</span>{sub && <span className="lrow-s">{sub}</span>}</span>
      <Icon name={aberto ? 'chevronUp' : 'chevronDown'} className="lrow-c" />
    </button>
    {aberto && <div className="g12-lic-full">
      {texto != null ? <pre className="g12-lic-pre" tabIndex={0}>{texto}</pre>
        : erro ? <p className="g12-lic-p">Não foi possível abrir o texto agora. Tente de novo com internet, ou abra <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>.</p>
          : <p className="g12-lic-p">Carregando…</p>}
    </div>}
  </>
}

/** As bibliotecas do bundle (dist/licencas/terceiros.json, gerado no build). */
function Bibliotecas() {
  const [libs, setLibs] = useState(null)
  const [erro, setErro] = useState(false)
  useEffect(() => {
    let vivo = true
    carregar('licencas/terceiros.json', 'json').then(l => { if (vivo) setLibs(l) }, () => { if (vivo) setErro(true) })
    return () => { vivo = false }
  }, [])
  if (erro) return <div className="g12-lic-body"><p className="g12-lic-p">Não foi possível abrir a lista agora. Ela está em <a href="licencas/terceiros.json" target="_blank" rel="noopener noreferrer">licencas/terceiros.json</a>.</p></div>
  if (!libs) return <div className="g12-lic-body"><p className="g12-lic-p">Carregando…</p></div>
  return libs.map(l => <TextoCompleto key={l.nome} icon="grid" title={`${l.nome} ${l.versao}`}
    sub={[l.licenca, l.copyright || (l.autor && 'Autor: ' + l.autor)].filter(Boolean).join(' · ')} texto={l.texto || `Licença: ${l.licenca || 'não informada'}`} />)
}

export default function Licencas() {
  return <div className="g12-lic">
    <Section>
      <div className="g12-lic-body">
        <p className="g12-lic-p g12-lic-lead">{FRASE_BASE}</p>
      </div>
    </Section>

    <Section title="Código-fonte">
      <LinkRow icon="link" title="Código-fonte do GYM 12" href={BRAND.source} sub={BRAND.source.replace(/^https:\/\//, '')} />
      <div className="g12-lic-body">
        <p className="g12-lic-p g12-lic-mono">Versão {VERSAO} · commit {COMMIT}</p>
        <p className="g12-lic-p">{FRASE_DIREITOS}</p>
      </div>
    </Section>

    <Section title="Licença">
      <TextoCompleto icon="shield" title="Licença GNU AGPL-3.0 (texto completo)" url="licencas/LICENSE.txt" />
    </Section>

    <Section title="Avisos de terceiros">
      <TextoCompleto icon="note" title="Avisos de terceiros" sub="NOTICE.md: openGym, MuscleMap, ExerciseDB, lean-qr, jsQR, ML Kit" url="licencas/NOTICE.md" />
    </Section>

    <Section title="Animações e imagens dos exercícios">
      <div className="g12-lic-body">
        <p className="g12-lic-p">{avisoMidia()}</p>
      </div>
      <LinkRow icon="globe" title="gymvisual.com" href="https://gymvisual.com/" />
    </Section>

    <Section title="Fontes">
      <div className="g12-lic-body">
        <p className="g12-lic-p">Fraunces, Geist e JetBrains Mono, sob a SIL Open Font License 1.1.</p>
      </div>
      <TextoCompleto title="Fraunces — SIL Open Font License 1.1" url="licencas/OFL-Fraunces.txt" />
      <TextoCompleto title="Geist — SIL Open Font License 1.1" url="licencas/OFL-Geist.txt" />
      <TextoCompleto title="JetBrains Mono — SIL Open Font License 1.1" url="licencas/OFL-JetBrainsMono.txt" />
    </Section>

    <Section title="Bibliotecas">
      <Bibliotecas />
    </Section>
  </div>
}

