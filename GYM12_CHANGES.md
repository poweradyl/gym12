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
| 2026-11-06 | `frontend/src/views/Settings.jsx` | Sobre (standalone): linha "Licenças" e bloco da versão do GYM 12 (`SobreVersao`: "GYM 12 v…", "Animações dos exercícios © Aliaksandr Makatserchyk, Gym visual, gymvisual.com." e "Ver licenças"), sem citar o openGym; página `licencas` (`gym12/Licencas.jsx`) no mapa de páginas. Fora do standalone o bloco do upstream volta a ser o original, sem ramos. |
| 2026-11-06 | `frontend/src/views/settings-pages.js` | Página `licencas` (título "Licenças", filha de `about`) só no standalone; a busca de Ajustes a acha. |
| 2026-11-06 | `.gitignore` | `frontend/dist-teste/` (saída do build do ambiente de teste). |
| 2026-11-06 | `frontend/src/main.jsx` | `<Gym12Gate>` (`gym12/Gate.jsx`) em volta do `<App/>` (import + render, 2 linhas): página de instalação no build do GYM 12; fora dele o Gate só devolve os filhos. |
| 2026-11-06 | `frontend/src/views/Settings.jsx` | Sobre (standalone): a "Dica" do upstream (Safari/Chrome + "dados de visitante") sai e entra a linha "Instalar o GYM 12" (`InstallRow`, abre `#/instalar`, some no app instalado). Fora do standalone a Dica continua igual. |
| 2026-11-06 | `frontend/src/views/Settings.jsx` | Export manual (JSON e ZIP) com o nome de `gym12/backup.js` (`backupFileName`): `gym12-backup-AAAA-MM-DD.json/.zip` no standalone, `opengym-backup-…` no upstream. |
| 2026-11-06 | `frontend/src/lib/mobile.js` | Backup automático e pasta escolhida com o nome de `gym12/backup.js` (`gym12-backup-…` no standalone); a limpeza reconhece `gym12-backup-…` e `opengym-backup-…` (`AUTO_BACKUP_NAME` literal, `(?:opengym|gym12)-backup-…`, igual ao plugin Android — o `android-backup.test.js` do upstream confere os dois) e ordena pela data sem o prefixo (`autoBackupKey`), para os dois nomes conviverem. |
| 2026-11-06 | `frontend/src/lib/backup-media.js` | Zip com fotos e vídeos: o JSON de dentro se chama `gym12-backup.json` no standalone (README com o nome e "GYM 12"); a importação aceita também o `opengym-backup.json` dos zips antigos. |
| 2026-11-06 | `frontend/android/app/src/main/java/ch/duartesantos/opengym/BackupFolderPlugin.java` | `BACKUP_NAME` aceita `gym12-backup-…` além de `opengym-backup-…`, e a limpeza ordena pela data sem o prefixo (`dateKey`), igual ao `lib/mobile.js` (não entra no build web do GYM 12; mantém o plugin coerente com o JS). |
| 2026-11-06 | `frontend/src/views/Stats.jsx` | Botões de período com `oneYear()` (`gym12/rotulos.js`) no lugar do "1Y" fixo: "1A" em pt-BR no GYM 12. |
| 2026-11-06 | `frontend/src/views/Measurements.jsx` | O mesmo `oneYear()` nos botões de período das medidas. |
| 2026-11-06 | `frontend/src/lib/starter.js` | Nomes das rotinas dos modelos de divisão por `starterName()` (`gym12/rotulos.js`): em pt-BR no GYM 12 ("Empurrar", "Puxar", "Pernas", "Superior A", "Corpo inteiro A"…); fora dele, os nomes em inglês do upstream. |
| 2026-11-06 | `frontend/src/sheets.jsx` | Selo de recorde por `prBadge()`/`prCount()` (`gym12/rotulos.js`) no lugar do "PR" e do "{n} PR" fixos (histórico do exercício, treino salvo e lista de treinos): "Recorde", "1 recorde", "2 recordes" em pt-BR no GYM 12; sem tradução, exatamente o texto do upstream. |

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
| 2026-11-06 | `frontend/src/gym12/Licencas.jsx` | Tela "Licenças" (Ajustes → Sobre → Licenças), o único lugar que cita o openGym: frase da base (AGPL-3.0, sem garantia), código-fonte do GYM 12 (`BRAND.source`) com versão e commit do build, direitos da AGPL, texto completo da AGPL, NOTICE.md, aviso da Gym visual palavra por palavra (de `catalogue/media/NOTICE.md`) + gymvisual.com, fontes (OFL 1.1, textos abríveis) e bibliotecas do bundle. Textos longos buscados em `licencas/` (funcionam sem rede: estão na LAZY do service worker). |
| 2026-11-06 | `frontend/src/gym12/LicencasTeste.jsx` | Variante da tela de Licenças do ambiente de teste: faixa "Ambiente de teste — variação da tela de Licenças (conteúdo a definir pelo time)" + a mesma tela. Só entra no build com `GYM12_AMBIENTE=teste` e `VITE_TESTE_LICENCA=1` (o plugin troca o import); o conteúdo final virá do time do dono. |
| 2026-11-06 | `frontend/src/gym12/teste-licenca.js` | O texto da faixa da variante (importado só pela variante e pelo plugin/pós-build). |
| 2026-11-06 | `frontend/src/gym12/SettingsBits.jsx` | `LicencasRow` (linha "Licenças" em Sobre) e `SobreVersao` (bloco da versão do GYM 12, com "Ver licenças"). |
| 2026-11-06 | `frontend/src/gym12/vite-plugin.js` | `config`: travas do ambiente (`checarAmbiente`, função pura: `VITE_TESTE_LICENCA` só com `GYM12_AMBIENTE=teste` e, no Cloudflare Pages, só no branch `teste-licenca`; senão o build falha com a mensagem em pt-BR) e `__GYM12_COMMIT__` (hash curto do git). `resolveId`: troca `Licencas.jsx` pela variante só no build de teste. `generateBundle`: `dist/licencas/` (LICENSE.txt, NOTICE.md, OFL-*.txt e `terceiros.json`, as bibliotecas de node_modules que têm módulo no bundle, com versão, licença, copyright e texto da licença). Ambiente de teste: meta robots noindex, `X-Robots-Tag: noindex, nofollow` em `/*` no `_headers` e `robots.txt` com `Disallow: /`; produção sem mudança. |
| 2026-11-06 | `frontend/src/gym12/scripts/postbuild.mjs` | Recusa mídia sem `exercise-media/NOTICE.md`, falta de algum texto de `licencas/`, e a faixa da variante de teste em qualquer arquivo quando `GYM12_AMBIENTE` não é `teste`; põe `licencas/*` na LAZY do service worker; informa o tamanho total do dist. |
| 2026-11-06 | `scripts/gym12-build.sh` | Mídia dos exercícios por padrão (`GYM12_MEDIA=1`; `GYM12_MEDIA=0` tira); `GYM12_DIST` escolhe a pasta de saída. |
| 2026-11-06 | `scripts/gym12-build-teste.sh` | Build do ambiente de teste em `frontend/dist-teste` (`GYM12_AMBIENTE=teste`, `VITE_TESTE_LICENCA=1`). Publicar só em `--branch teste-licenca`. |
| 2026-11-06 | `frontend/src/gym12/i18n-overlay.js` | `tagKeys`: as etiquetas de músculo, parte do corpo, tipo e equipamento (valores do catálogo, mais "já incluído", "já adicionado", "sem exercícios") em pt-BR com só a 1ª letra maiúscula. |
| 2026-11-06 | `frontend/src/gym12/gym12.css` | Tela de Licenças (texto no tamanho e na cor do corpo, textos completos em mono com rolagem própria), link "Ver licenças" de Sobre, faixa da variante de teste; em pt-BR, etiquetas (.tag), linha "músculo · equipamento" das listas e filtros de Exercícios sem o `capitalize` do upstream (sentence case vindo da camada de tradução). |
| 2026-11-06 | `frontend/src/gym12/ambiente.test.js` | Testes: travas do ambiente (função pura e build de produção com a flag), troca da variante, noindex, checagens do pós-build (NOTICE da mídia, faixa de teste, licencas/), bibliotecas do bundle. |
| 2026-11-06 | `frontend/src/gym12/licencas.test.jsx` | Testes: seções da tela de Licenças na ordem, frase exata, links, versão/commit, AGPL e NOTICE abrindo, aviso da mídia igual ao do catálogo; bloco da versão de Sobre sem openGym. |
| 2026-11-06 | `frontend/src/gym12/i18n-overlay.test.js` | Testes: etiquetas em sentence case só em pt-BR e o CSS sem capitalize. |
| 2026-11-06 | `docs/gym12/capturas/fase5/` | Capturas da verificação (390×844): Sobre, Licenças, AGPL, avisos, exercício com mídia da mesma origem, variante de teste. |
| 2026-11-06 | `frontend/src/gym12/Gate.jsx` | A porta de entrada: no navegador (fora do app instalado) mostra a página de instalação na primeira visita e sempre em `#/instalar`; instalado vai direto ao app (nem `#/instalar` abre a página). "Usar sem instalar" grava `gym12.skipInstall` (localStorage, try/catch) e entra no Início (ou no endereço que abriu, p.ex. um link de rotina), com `replaceState`. Voltar no navegador fecha a página aberta por `#/instalar`. Página carregada sob demanda (`React.lazy`). |
| 2026-11-06 | `frontend/src/gym12/install/detect.js` | `detectEnv(ua, { maxTouchPoints, standalone, displayModeStandalone })` → installed / inapp / ios-safari / ios-other / android / desktop (Instagram, FBAN, FBAV, FB_IAB, FBIOS e Messenger = in-app; iPadOS com UA de Mac + toque = iOS; CriOS, FxiOS, EdgiOS, OPiOS e GSA = ios-other) e `currentEnv()`. |
| 2026-11-06 | `frontend/src/gym12/install/InstallLanding.jsx` | A página de instalação do INSTALL.md: wordmark, kicker, título com "evoluída" em itálico lime, celular com a captura real e o "12" fantasma, faixa, cartão por ambiente (in-app com o desenho da barra e "Copiar link"/"Link copiado"; iOS Safari em 3 passos com os ícones; outro navegador no iPhone com a nota do Safari e "Copiar link"; Android com o pedido do navegador ou os passos do ⋮ depois de 2,5 s ou de uma recusa, e "Pronto!" ao instalar; desktop "Abra este link no celular."), "Usar sem instalar" sempre e o rodapé. Chama `hideBoot()` ao montar. A animação de entrada é só enfeite: a classe `.g12i-enter` entra ao montar (não com "reduzir movimento" nem com a página escondida) e sai depois de 1,3 s (`ENTER_MS`), aconteça a animação ou não. |
| 2026-11-06 | `frontend/src/gym12/install/install.css` | Estilos da página (importados só por ela): 390×844 sem rolagem horizontal, gutter 20 px (16 px abaixo de 375 px), alvos de 48/56 px. Primeira tela: celular em 184×376 (proporção dos ~220×450 do INSTALL.md) e espaços mais curtos, para o começo do cartão de instruções (no Android com o pedido, os dois botões) caber em 390×844; em 360×740 a faixa e o topo do cartão aparecem. Entrada fade + 16 px com 80 ms entre blocos só sob `.g12i-enter` e com `animation-fill-mode: backwards` (nada fica transparente quando a animação não roda ou termina); nenhuma com `prefers-reduced-motion`. Rodapé em mist-400 (o mist-500 dá 3,7:1 a 12 px, abaixo do AA). |
| 2026-11-06 | `frontend/src/gym12/SettingsBits.jsx` | `InstallRow`: a linha "Instalar o GYM 12" de Sobre. |
| 2026-11-06 | `frontend/src/gym12/vite-plugin.js` | `INSTALL_FILES`: copia `brand/install-screen.webp` para a raiz do dist. |
| 2026-11-06 | `frontend/src/gym12/scripts/postbuild.mjs` | Põe `install-screen.webp` na LAZY do service worker (a página de instalação funciona sem rede; o JS/CSS dela já entram como chunks sob demanda e as fontes já estavam lá). |
| 2026-11-06 | `frontend/src/gym12/scripts/install-screen.mjs` | Gera `brand/install-screen.webp` com o Playwright (fora do projeto, em `GYM12_TOOLS`) a partir do build: perfil descartável, dados fictícios ("Treino A — Peito e tríceps", Supino reto com barra com a 1ª série feita), 390×844 escala 2, recorte e WebP 440×926 no canvas do Chromium, até 80 KB. |
| 2026-11-06 | `brand/install-screen.webp` | A captura do celular da página de instalação (440×926, WebP). |
| 2026-11-06 | `frontend/src/gym12/install/detect.test.js` | Testes: detecção com user agents reais (Instagram e Facebook no iOS e no Android, Messenger, Safari e Chrome no iPhone, iPad antigo e iPadOS, Chrome Android, Samsung Internet, desktops). |
| 2026-11-06 | `frontend/src/gym12/install/install.test.jsx` | Testes: regras do Gate, Gate fora/dentro do standalone, instalado, `#/instalar`, voltar, hideBoot, cada cartão, copiar link, pedido do Android (aceito, recusado, sem pedido em 2,5 s, appinstalled), CSS do movimento (só sob `.g12i-enter`, `backwards`, nada transparente), os 3 passos do iOS, a classe de entrada saindo depois de `ENTER_MS` e ausente com "reduzir movimento"/aba escondida, linha de Sobre. |
| 2026-11-06 | `frontend/src/gym12/install/install-build.test.js` | Testes: a captura (WebP 440×926, ≤ 80 KB), a cópia pelo plugin e a LAZY do pós-build. |
| 2026-11-06 | `docs/gym12/capturas/instalacao/` | Capturas de cada caminho da página de instalação (390×844, escala 3; iPhone no WebKit do Playwright, Android/desktop no Chromium), com "reduzir movimento", 360×740 e 430×932, Sobre, app instalado e sem rede. |
| 2026-11-06 | `docs/gym12/capturas/producao/` | Captura do app ao vivo em produção (390×844). |
| 2026-11-06 | `frontend/src/gym12/locales/pt-BR.ui.js` | Fase 0 do vídeo: "Superset" → "Bi-set" em todas as 21 frases pt-BR (inclusive "Supersérie" herdada do pt-PT em dois rótulos de acessibilidade), "1Y" → "1A" e "Push / Pull / Legs" → "Empurrar / Puxar / Pernas". |
| 2026-11-06 | `frontend/src/gym12/backup.js` | Nome dos backups: `BACKUP_PREFIX`/`backupFileName` (`gym12-backup` no standalone), `BACKUP_JSON_NAME(S)`, `autoBackupKey` e `backupReadme`. |
| 2026-11-06 | `frontend/src/gym12/rotulos.js` | `oneYear()` ("1Y" por `t()` com a chave em variável, para não cobrar a chave dos pacotes do upstream) e `starterName()` com a tabela dos nomes dos modelos de divisão em pt-BR. |
| 2026-11-06 | `frontend/src/gym12/backup-nome.test.js` | Testes: nomes `gym12-backup` e `opengym-backup`, limpeza com os dois prefixos misturados, zip novo e antigo na importação, README. |
| 2026-11-06 | `frontend/src/gym12/termos-video.test.js` | Testes: nenhum "superset"/"supersérie" no pt-BR do GYM 12, Bi-set/bi-set, "1A", nomes dos modelos de divisão. |
| 2026-11-06 | `docs/gym12/revisao-pt-BR-interface.md` | Glossário: Superset → bi-set (decisão do dono). |
| 2026-11-06 | `frontend/src/gym12/locales/pt-BR.ui.js` | Gravação do Reel: "Everything else" → "Os demais exercícios" (título do seletor depois de "Seus substitutos"; antes herdava "Todo o resto" do pt-PT), "PR" → "Recorde", "{0} PR"/"{0} PRs" → "{0} recorde"/"{0} recordes". |
| 2026-11-06 | `frontend/src/gym12/rotulos.js` | `prBadge()` e `prCount(n)`: o selo de recorde pela camada de tradução (chaves em variável, como o `oneYear()`). |
| 2026-11-06 | `frontend/src/gym12/gym12.css` | Explorar músculos em pt-BR: chips dos músculos abaixo do mapa e de parte do corpo/equipamento depois da busca sem o `capitalize` do `.chip` ("Posteriores de coxa", não "Posteriores De Coxa"). |
| 2026-11-06 | `frontend/src/gym12/termos-video.test.js` | Testes: "Everything else", selo de recorde em pt-BR e no upstream, `sheets.jsx` sem o "PR" fixo, CSS dos chips de músculo. |

## Deploy

Publicado em 2026-11-06.

- Cloudflare Pages, projeto `gym12`, branch de produção `gym12`.
- URL: https://gym12.juniorsa.shop (domínio próprio; DNS `CNAME gym12 → gym12.pages.dev`,
  proxied) e https://gym12.pages.dev.
- Build e deploy, na raiz do repositório, com a árvore limpa no branch `gym12` e
  `VITE_TESTE_LICENCA`/`GYM12_AMBIENTE` não definidas:

```sh
scripts/gym12-build.sh
export CLOUDFLARE_API_TOKEN=$(tr -d '[:space:]' < ~/.gym12-cloudflare-token)
export CLOUDFLARE_ACCOUNT_ID=303fc1d767b05625df9021548808fc65
npx wrangler@3.114.17 pages deploy frontend/dist --project-name gym12 --branch gym12 \
  --commit-hash $(git rev-parse HEAD) --commit-dirty=false
```

- Wrangler fixado no 3.x: o wrangler 4.15x desvia `pages project create`/`deploy` para o
  Cloudflare Workers, que o token não cobre (e grava `wrangler.jsonc`, `package.json` e
  `.gitignore` no repositório). O token nunca vai para arquivo do repositório nem para log.
- Ambiente de teste cancelado pelo dono em 2026-11-06: o código de `VITE_TESTE_LICENCA`
  (variante de Licenças, `scripts/gym12-build-teste.sh`, travas do plugin) continua no
  repositório, sem uso; nada é publicado no branch `teste-licenca`.
- Web Analytics: ligado pelo painel do Cloudflare (o token não tem permissão para isso).

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
   estiver logado, para antes e explica (`npx wrangler@3.114.17 login`).
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
(`npx wrangler@3.114.17 pages deploy frontend/dist --project-name gym12 --branch sync-<tag>`) e a
aprovação acima. Se um conflito pedir mudar um arquivo original novo, registre-o na tabela.
