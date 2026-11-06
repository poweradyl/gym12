# GYM 12 — registro de mudanças sobre o openGym

## Base

- Upstream: https://github.com/DuarteSantos8/openGym
- Tag: `v1.4.4`
- Commit: `5f5832db56080837b58342ff50f78631dcc63e07`
- Data: 2026-11-05

## Regras da camada fina

A personalização do GYM 12 fica, sempre que possível, em:

- variáveis de ambiente;
- tokens de tema;
- sobreposições de tradução;
- arquivos de marca em `frontend/src/gym12/` e `brand/`.

Cada arquivo original alterado é listado abaixo com data e motivo.

`LICENSE` e `NOTICE.md` são mantidos — exigência da AGPL e das licenças MIT.

## Arquivos originais alterados

| Data | Arquivo | Motivo |
|------|---------|--------|
| 2026-11-05 | `frontend/src/main.jsx` | `import './gym12/boot.js'` como primeiro import (início vazio, pt-BR, instalação, armazenamento persistente, CSS da marca). |
| 2026-11-05 | `frontend/src/lib/modules.js` | Conjunto `OFF` por env: Coach, Integrações, Relógio, Saúde e Temas sazonais desligados e fora da lista; descrição do preset "Tudo" sem citar o Coach. |
| 2026-11-05 | `frontend/src/lib/modules-copy.js` | Texto do preset "Tudo" sem o Coach no standalone (reaproveita a frase já traduzida de Motivação). |
| 2026-11-05 | `frontend/src/lib/i18n.js` | `setLang` junta a camada de tradução do GYM 12 (`overlayFor`/`merged`): troca openGym → GYM 12 e revisões pt-BR (frases e nomes de exercícios, busca incluída). |
| 2026-11-05 | `frontend/src/lib/i18n-core.js` | `_setLangState` aceita dicionário para o inglês no standalone (para o inglês também dizer GYM 12). |
| 2026-11-05 | `frontend/src/views/Settings.jsx` | Standalone: linha neutra no lugar do cartão/página da conta (sem "demo"), sem Hevy, "Baixe o app Android", "Apoie o openGym" e rodapé de servidor; versão "GYM 12 v…" sem links do GitHub/NOTICE (atribuição da mídia intacta); lembrete de backup; data do último export. |
| 2026-11-05 | `frontend/src/views/settings-pages.js` | Busca de Ajustes sem "Importar do Hevy" e "Baixe o app Android" no standalone. |
| 2026-11-05 | `frontend/src/views/Home.jsx` | Título do Início "GYM 12" no standalone. |
| 2026-11-05 | `frontend/src/views/RoutineEdit.jsx` | Aviso do profissional de educação física (`gym12/RoutineNotice.jsx`) logo após o cabeçalho. |
| 2026-11-05 | `frontend/src/sheets.jsx` | Sem o link "Sugerir correção" (GitHub do upstream) no standalone. |
| 2026-11-05 | `frontend/src/components/Nfc.jsx` | Sem gravação de adesivos NFC no standalone (gravariam links opengym.ch, que o GYM 12 não atende). |
| 2026-11-05 | `frontend/src/lib/routine-link.js` | Link de rotina com o endereço do próprio app (`<origem>/#/r/<payload>`) no standalone. |
| 2026-11-05 | `frontend/src/lib/card-draw.js` | Marca "GYM 12" e site gym12.juniorsa.shop nas imagens de compartilhamento. |
| 2026-11-05 | `frontend/src/lib/print-doc.js` | Marca "GYM 12" e site gym12.juniorsa.shop nos PDFs/impressões. |
| 2026-11-06 | `frontend/src/App.jsx` | `meta theme-color` #050604 (ink-950) no tema escuro do standalone; o claro segue #f2f2f7. |
| 2026-11-06 | `frontend/src/lib/i18n-core.js` | `CASED_NAME_LANGS` inclui pt-BR no standalone: nomes de exercícios em sentence case, sem o `capitalize` do CSS. |
| 2026-11-06 | `frontend/src/lib/i18n.js` | `overlayFor` recebe também o pacote de nomes de exercícios (a camada põe a 1ª letra maiúscula em pt-BR). |
| 2026-11-06 | `frontend/src/store/useStore.js` | `freshState`: perfil novo do standalone com `enParens: { 'pt-BR': false }` (sem o nome em inglês entre parênteses); perfis existentes e o upstream não mudam. |
| 2026-11-06 | `frontend/src/views/Home.jsx` | A linha do título do standalone vira o wordmark: `GYM <b>12</b>` em `.g12-wm` (cores no gym12.css). |
| 2026-11-06 | `frontend/src/components/ui.jsx` | `NumberField` mostra vírgula decimal em pt-BR no standalone ("67,5"); continua aceitando "67,5" e "67.5" (o `commit` do upstream já trocava a vírgula). |
| 2026-11-06 | `frontend/src/lib/card-draw.js` | Wordmark das imagens de compartilhamento: "GYM" em bone (escuro) + "12" no acento, em Fraunces quando a fonte já carregou, sem os halteres do openGym. |

## Arquivos novos

| Data | Arquivo | Motivo |
|------|---------|--------|
| 2026-11-05 | `frontend/vite.gym12.config.js` | Build do GYM 12 sobre o vite.config.js: VITE_DEMO=1, VITE_STANDALONE=1, constante `__GYM12_STANDALONE__` e o plugin. |
| 2026-11-05 | `frontend/src/gym12/flags.js` | `STANDALONE`, `BRAND` e idioma padrão. |
| 2026-11-05 | `frontend/src/gym12/vite-plugin.js` | Stubs de IA/admin/demo/mapa, index.html em pt-BR com a marca, manifest de `brand/`, `_headers` do Cloudflare e dados para o pós-build. |
| 2026-11-05 | `frontend/src/gym12/stubs/EmptyView.jsx` | Stub das telas do Coach e do admin. |
| 2026-11-05 | `frontend/src/gym12/stubs/coach-local.js` | Stub do Coach local (sem endereços de IA). |
| 2026-11-05 | `frontend/src/gym12/stubs/coach-demo.js` | Stub do Coach de demonstração. |
| 2026-11-05 | `frontend/src/gym12/stubs/demoSeed.js` | Stub dos dados de exemplo (o GYM 12 começa vazio). |
| 2026-11-05 | `frontend/src/gym12/stubs/GymMap.jsx` | Stub do mapa (leaflet só no app móvel). |
| 2026-11-05 | `frontend/src/gym12/boot.js` | Início vazio e pt-BR, `beforeinstallprompt`/`appinstalled`, `storage.persist()`, CSS da marca. |
| 2026-11-05 | `frontend/src/gym12/gym12.css` | Estilos da marca (vazio; a tarefa de marca preenche). |
| 2026-11-05 | `frontend/src/gym12/i18n-overlay.js` | Camada de tradução: openGym → GYM 12 em todos os idiomas e revisões pt-BR. |
| 2026-11-05 | `frontend/src/gym12/backup.js` | Regras do lembrete mensal de backup. |
| 2026-11-05 | `frontend/src/gym12/BackupReminder.jsx` | Lembrete de backup na raiz de Ajustes. |
| 2026-11-05 | `frontend/src/gym12/SettingsBits.jsx` | Linha "Seus treinos ficam salvos neste celular." da conta. |
| 2026-11-05 | `frontend/src/gym12/RoutineNotice.jsx` | Aviso na criação de rotina. |
| 2026-11-05 | `frontend/src/gym12/scripts/postbuild.mjs` | Mídia opcional (GYM12_MEDIA=1), pacotes pt-BR na LAZY do service worker e checagens do dist (IA, opengym.ch, limites do Cloudflare). |
| 2026-11-05 | `frontend/src/gym12/modules.test.js` | Testes: módulos desligados. |
| 2026-11-05 | `frontend/src/gym12/i18n-overlay.test.js` | Testes: camada de tradução e setLang. |
| 2026-11-05 | `frontend/src/gym12/boot.test.js` | Testes: boot, idioma efetivo, instalação, persist. |
| 2026-11-05 | `frontend/src/gym12/stubs.test.js` | Testes: stubs com os mesmos exports dos originais. |
| 2026-11-05 | `frontend/src/gym12/postbuild.test.js` | Testes: checagens do pós-build, LAZY e index.html. |
| 2026-11-05 | `frontend/src/gym12/backup.test.js` | Testes: regra do lembrete de backup. |
| 2026-11-05 | `frontend/src/gym12/notice.test.js` | Testes: aviso da rotina e linha da conta. |
| 2026-11-05 | `brand/manifest.json` | Manifest do GYM 12 (ícones ainda os do upstream). |
| 2026-11-05 | `scripts/gym12-build.sh` | Build único do GYM 12 (vite build + pós-build). |
| 2026-11-05 | `docs/gym12/capturas/fase1/` | Capturas da verificação da fase 1. |
| 2026-11-06 | `frontend/src/gym12/gym12.css` | Preenchido: tokens ink/bone/mist no tema escuro, acento lime (#c4f439, texto ink; oliva #4d6600 como texto no claro), contorno ink-700 nos cartões, Geist na interface, Fraunces nos títulos grandes, JetBrains Mono nos números do treino, `--num` da célula de carga para a mono, wordmark do Início, nomes de rotina sem `capitalize` (cartão de hoje, chips do rodízio), resumo recolhido do exercício sem `capitalize` em pt-BR, 1RM estimado e melhor do exercício em mono. Só entra no build do GYM 12 (o plugin o importa). |
| 2026-11-06 | `frontend/src/gym12/fonts/` | woff2 latin + latin-ext (Fontsource 5.3.0): Fraunces romana (wght+opsz) e itálica (wght), Geist (wght), JetBrains Mono (wght) — 314.388 bytes — e as licenças `OFL-*.txt`. |
| 2026-11-06 | `frontend/src/gym12/boot.js` | Não importa mais o CSS (o plugin acrescenta o import só no build do GYM 12); pede a Fraunces na abertura para o canvas (`loadBrandFont`). |
| 2026-11-06 | `frontend/src/gym12/vite-plugin.js` | `transform` com o import do gym12.css no boot.js; favicon SVG + PNG 32; tela de abertura com o wordmark em contorno (`brand/wordmark.svg`) e traço lime; cópia dos ícones de `brand/` para a raiz do dist. |
| 2026-11-06 | `frontend/src/gym12/i18n-overlay.js` | `sentenceCase`: nomes de exercícios pt-BR com a 1ª letra maiúscula (pacote do catálogo + revisões). |
| 2026-11-06 | `frontend/src/gym12/scripts/brand-assets.mjs` | Gera `brand/icon.svg`, ícones PNG, favicon e wordmark (texto em contorno com a Fraunces 700; ferramentas fora do projeto, em `GYM12_TOOLS`). |
| 2026-11-06 | `frontend/src/gym12/locales/pt-BR.ui.js` | "Green" → "Lima" (nome do acento padrão em Ajustes → Aparência). |
| 2026-11-06 | `frontend/src/gym12/padroes.test.jsx` | Testes: `enParens` do perfil novo, vírgula decimal do NumberField, "Lima", favicon. |
| 2026-11-06 | `frontend/src/gym12/brand.test.js` | Testes: tela de abertura, ícones, manifest, CSS só pelo plugin, fontes/licenças/orçamento, marca do canvas. |
| 2026-11-06 | `brand/icon.svg`, `brand/icon-180.png`, `brand/icon-192.png`, `brand/icon-512.png`, `brand/icon-maskable-512.png`, `brand/favicon.svg`, `brand/favicon-32.png`, `brand/wordmark.svg` | Ícones e wordmark do GYM 12 (gerados por brand-assets.mjs); favicon (SVG e 32 px) só com o "12" em lime. |
| 2026-11-06 | `brand/manifest.json` | Ícones 192 e 512 "any" e 512 "maskable" do GYM 12. |
| 2026-11-06 | `docs/gym12/capturas/fase3/` | Capturas da identidade visual (390×844, tema escuro e claro) e das correções. |

## Atualização mensal

Uma vez por mês (ou quando o openGym lançar uma release), rode na raiz do repositório, com a
árvore limpa:

```sh
scripts/sync-upstream.sh              # padrão: merge, testes, build, resumo e prévia
scripts/sync-upstream.sh --dry-run    # só mostra o que faria
scripts/sync-upstream.sh --no-preview # tudo, menos push e prévia
scripts/sync-upstream.sh --abort-on-conflict  # em conflito, desfaz o merge e volta
scripts/sync-upstream.sh --help
```

O que o script faz:

1. Recusa rodar com alterações não commitadas e guarda o branch atual.
2. Busca as tags do `upstream` e acha a release publicada mais nova (`vX.Y.Z`, sem
   `-rc`/`-beta`; confere com o GitHub pelo `gh` quando disponível). Se o `gym12` já estiver
   nela, diz "Nada novo" e sai.
3. Cria o branch `sync/<tag>` a partir do `gym12` e faz `git merge --no-ff` da tag.
4. Roda `npm ci`, os testes (só as 2 falhas conhecidas do `app-icons` são toleradas; qualquer
   falha nova reprova) e `scripts/gym12-build.sh`.
5. Escreve `docs/gym12/sync/RESUMO-<tag>.md` e faz commit dele no `sync/<tag>`: o que chegou
   (CHANGELOG, commits por área, arquivos que o GYM 12 também alterou marcados "conferir",
   chaves novas de tradução pt/pt-BR, exercícios novos), conflitos, testes, build e próximos
   passos. Registros detalhados ficam em `.git/gym12-sync/<tag>/`.
6. Se testes e build passarem, envia `sync/<tag>` ao `origin` e publica uma **prévia** no
   Cloudflare Pages (`--branch sync-<tag com hífens>`, ex.: `sync-v1-4-5`). Se o wrangler não
   estiver logado, para antes e explica (`npx wrangler login`).
7. Volta ao branch original.

**Nunca publica em produção.** O script recusa deploy com `--branch gym12`, `main` ou
`production`, nunca faz merge no `gym12` e nunca envia o `gym12`.

Para aprovar uma prévia: abra o endereço que está no resumo, confira, e rode

```sh
git checkout gym12 && git merge --ff-only sync/<tag> && git push origin gym12
```

A publicação em produção parte do branch `gym12`, depois desse push.

Conflitos (saída 2): o script lista e classifica cada arquivo no resumo e deixa o branch
`sync/<tag>` parado no conflito (a não ser com `--abort-on-conflict`). Regras da camada fina:

- **Camada do GYM 12** (`frontend/src/gym12/`, `brand/`, `scripts/gym12-*`, `docs/gym12/`,
  `frontend/vite.gym12.config.js`): mantenha a nossa versão e adapte ao que mudou no openGym.
- **Arquivo original listado acima**: parta da versão do openGym e reaplique só as nossas
  linhas marcadas; atualize a linha da tabela se o motivo mudou.
- **Outro arquivo**: não deveria ter mudança nossa; fique com a versão do openGym
  (`git checkout --theirs <arquivo>`).

Depois: `git add`, `git commit --no-edit`, testes, build, prévia
(`npx wrangler pages deploy frontend/dist --project-name gym12 --branch sync-<tag>`) e a
aprovação acima. Se um conflito pedir mudar um arquivo original novo, registre-o na tabela.
