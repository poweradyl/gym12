# GYM 12 · Mapa do openGym v1.4.4 para a camada fina

Base: branch `gym12` sobre a tag `v1.4.4` (commit `5f5832db5`). Caminhos relativos à raiz do repo;
`fe/` = `frontend/`. Números de linha conferidos em 05/11/2026 contra o código desta branch.
Mapa só de leitura: nada foi alterado além deste arquivo.

Ideia central, que se repete nos 12 tópicos: o build **demo** do upstream (`VITE_DEMO=1`, o que roda
no GitHub Pages) já é um app 100% no navegador, sem servidor. O GYM 12 reaproveita esse modo e
corrige só o que é "demo" (dados de exemplo e textos) e o que é marca/IA.

---

## 1. Modo demo/convidado → `VITE_STANDALONE=1`

**Como funciona hoje**

- `fe/src/lib/demo.js:12-14`: `DEMO = import.meta.env.VITE_DEMO === '1'`, `DEMO_SEEDED = 'gym_demo_seeded_v1'`,
  `REPO` (link gitlab). Constante de build: o Vite substitui e o código demo some dos outros builds.
- Armazenamento (igual em demo, convidado e logado):
  - estado inteiro do app: **localStorage** `gym_state_v1` (`fe/src/store/useStore.js:35`, `persist` em `:645`,
    `loadState` em `:350`). Zustand, um único store (`useStore.js`).
  - fotos/vídeos de exercícios próprios e fotos de progresso: **IndexedDB** (`fe/src/lib/media-store.js`
    → `media-store-idb.js`; memória se o IDB estiver bloqueado).
  - outras chaves: `gym_guest` (convidado, `useStore.js:1636-1642`), `gym_default_lang`
    (`fe/src/lib/default-lang.js:46`), `gym_demo_seeded_v1`, `gym_owner`, `gym_sync`...
- Boot (`useStore.js:2024`): no ramo `if (DEMO)` (`:2100-2108`) semeia uma vez via `resetDemo()`
  (`:2015-2021`, import dinâmico de `fe/src/lib/demoSeed.js`), chama `setGuest(true)` e `finishBoot()`.
  **Não** chama `/api/config` nem `/api/me` (o ramo normal começa em `:2109`, `loadConfig` em `:2119`).
- Onde o cliente decide servidor × local: não existe um "modo local" no `api.js`. A regra é
  "convidado não fala com servidor": `fe/src/lib/api.js:59-73` (`api()`), único ponto de rede da API;
  `pushState` sai cedo sem `user` (`useStore.js:1741-1742`); media-sync idem (`fe/src/lib/media-sync.js:102,309,354`);
  push do timer só com `user` (`fe/src/store/useUI.js:45-46`). Em demo/convidado nenhum `/api/*` é chamado
  depois do boot demo.
- Textos/selos de demo visíveis:
  - `fe/src/views/Login.jsx:86-97` ("Live demo…", "Start the demo", "Self-host it…"). Inalcançável no demo
    (boot sempre põe convidado), mas existe.
  - `fe/src/views/Settings.jsx:1204` título da seção ("Demo"), `:1211-1217` linhas "You’re in the demo",
    "Reset demo data", "Self-host openGym" (abre `REPO`); `:1288` cartão da conta na raiz ("Demo /
    Example data, only in this browser.").
  - IA demo: `fe/src/lib/coach-demo.js:116,214,237` (só aparece com o módulo Coach ligado).
- Tudo que o `DEMO` já desliga (sem servidor): `ServerSync.jsx:299`, `SyncBanner.jsx:47`,
  `Settings.jsx:144` (passkeys), `:943`, `:1029` (status de conexão), `:1192` (sync), `:1247` (apagar conta),
  `:1252`, `:1300` (coach do admin), `ctx.demo` em `:465` → `settings-pages.js:63,79` (Zepp, linhas "signed in"),
  `Integrations.jsx:118-125` + `fe/src/lib/integrations.js:111-112,117,129` (Hevy/webhook/MCP), `Modules.jsx:38`.

**Recursos completos no modo local?** Sim. Rotinas, registro de treino, timer de descanso, PRs, 1RM,
gráficos/Stats, histórico, medidas, fotos, programas, importação de outros apps e backup rodam todos
no cliente (o demo público prova). Limites sem servidor: sem sync entre aparelhos; sem notificação de
fim de descanso com a tela bloqueada (push do servidor, `useUI.js:45`); sem lembretes diários
(página Reminders só com `user || mobile`, `settings-pages.js:58`).

**Backup** (Ajustes → Dados e backup, página `data` em `Settings.jsx:1075-1110`): exportar JSON
(`doExport`, `:324`), ZIP com fotos/vídeos (`doExportZip`, `:339`), relatório PDF, CSV (`:1083`),
importar backup (`doImport`, `:359`, input `:1106`), importar de outro app (`:1094-1097`),
"Import from Hevy" (`:1098-1100`, chama `api.hevyapp.com`), "Reset everything" (`:1104`, local).
Store: `importBackup` em `useStore.js:1577`.

**Plano `VITE_STANDALONE=1` (sem tocar em `demo.js` nem no boot)**

1. Build com `VITE_DEMO=1 VITE_STANDALONE=1` (no comando, ou no topo de `fe/vite.gym12.config.js`,
   ver §11). `DEMO=true` liga todo o "sem servidor" acima de graça.
2. Começar VAZIO: `fe/src/gym12/boot.js` (importado primeiro em `main.jsx`) faz
   `localStorage.setItem('gym_demo_seeded_v1','1')` se ainda não existir. O boot demo então pula o
   `resetDemo()` e cai em `freshState()` (`useStore.js:330-338`, perfil vazio). Alternativa explícita:
   1 linha em `useStore.js:2102` (`if (!STANDALONE && !localStorage.getItem(DEMO_SEEDED))`).
   O stub de `demoSeed.js` (§3) tira os dados de exemplo do bundle.
3. Textos demo: só `Settings.jsx` precisa mudar (ramo `STANDALONE` antes do `DEMO` em `:1204`, `:1211`, `:1288`).
4. Flag única nova: `fe/src/gym12/flags.js` → `export const STANDALONE = (import.meta.env || {}).VITE_STANDALONE === '1'`.
   **Não** exportar nada novo de `demo.js`: 14 testes fazem `vi.mock('../lib/demo.js', () => ({ DEMO… }))`
   e um export a mais consumido por `Plan.jsx`/`Login.jsx`/`coach-api.js` quebraria esses mocks.

---

## 2. Recursos que dependem de servidor (esconder no standalone)

| Recurso | Arquivos | Entrada na UI | Com `DEMO`+convidado |
|---|---|---|---|
| Login passkey/senha | `views/Login.jsx`, `components/Passkeys.jsx` (`usePasskeys`, `PasskeysRow`, `DeviceLinkRow`, `PairSheet`, `openDeviceLinkRedeem`), `components/PasswordAuth.jsx`, `LostAccess.jsx`, `DeleteAccount.jsx` | `App.jsx:333` (`!authed ? <Login/>`), `Settings.jsx:1218-1245` (conta) | Login nunca aparece; linhas trocadas pelo ramo demo |
| Link de aparelho (QR) | `lib/device-link.js`, `App.jsx:203-209`, `useStore.js:2113-2114` | ao abrir `?link=` | só no ramo não-demo do boot |
| Sync | `components/ServerSync.jsx`, `SyncBanner.jsx`, `lib/sync-merge.js`, `useStore.js:1741+` (push/pull) | `Settings.jsx:1192`, banner | escondido |
| Admin | `views/Admin.jsx` (+`AdminCoach.jsx`), rota `App.jsx:360`, linhas `Settings.jsx:1194,1218`, `:1300` | exige `user.admin` | inalcançável |
| Push (timer/lembrete) | `lib/push.js`, `public/sw.js:205-243`, `Settings.jsx:1434-1610` (`NotificationsCard`, `PushCard`) | página `reminders` | página oculta (`settings-pages.js:58`) |
| Webhooks | `views/Integrations.jsx`, `lib/integrations.js:46-49,116-127` | Ajustes → Integrações | cartão "Needs your server"; some com módulo `integrations` off |
| MCP | `lib/integrations.js:56-59,128-130`, `Integrations.jsx:29,146-147` (link GitHub) | idem | idem |
| Zepp OS (relay) | `lib/watch-relay.js`, `views/ZeppSettings.jsx`, `App.jsx:443` | página `zepp` | oculta (`settings-pages.js:63`); relay não chama rede sem `user` (`watch-relay.js:93`) |
| Apple Watch / Wear OS / Garmin | `lib/watch-sync.js`, `garmin-snapshot.js`, `views/WatchSettings.jsx` | só app móvel | não existe na web |
| Apple Health / Health Connect | `lib/health-*.js`, páginas `apple-health`, `health-connect` | só app móvel | web mostra "Not available on this device" |
| Strava | não existe (só palavra de busca em `settings-pages.js:27,42`) | | |
| Lembrete de academia + mapa | `views/GymReminder.jsx`, `components/GymMap.jsx` (leaflet + tiles OSM), `lib/gym-places.js` (Nominatim, Photon) | páginas `gym*` | só `ctx.mobile` (`settings-pages.js:65`) |
| Check-in da academia | `views/CheckIn.jsx` (rota `/checkin`), QR/código local, NFC | Home | **local**, pode ficar; NFC grava URLs `opengym.ch` (`lib/nfc-tags.js:21`) |
| Compartilhar rotina | `components/RoutineShare.jsx`, `lib/routine-link.js:24,158` | `RoutineEdit.jsx:593`, `sheets.jsx:3241` | sem servidor, mas o link é `https://opengym.ch/r#…` (site do upstream) |
| Hevy | `lib/import-hevy.js:38` (`api.hevyapp.com`) | `Settings.jsx:1098`, cartão Integrações | cartão oculto em demo; linha de Dados continua |
| Checagem de atualização | `lib/update.js:15-17,59,105` (GitHub API) | `Settings.jsx:213-234` | só `MOBILE` (`:221`): a web nunca chama |
| "Get the Android app" | `Settings.jsx:1128-1130` (opengym.ch) | Sobre | aparece: esconder |

Menus/rotas a conferir no standalone: rotas `App.jsx:335-361`; raiz de Ajustes
`settings-pages.js:48` (`ROOT_GROUPS`) filtrada por `pageVisible` (`:55-70`); páginas `account`, `about`,
`integrations`, `modules` em `Settings.jsx`. Com `DEMO` + módulos forçados (§3) sobram, para esconder
à mão: linha Hevy (`Settings.jsx:1098-1100`), "Get the Android app" (`:1127-1130`), "Support openGym"
(`:1155-1167`), link "Suggest a fix" do GitHub (`fe/src/sheets.jsx:1367-1370`, opcional).

---

## 3. IA (AI Coach) e MCP

**Superfícies**

- Rotas `/coach`, `/coach/intake`, `/coach/proposal`, `/coach/setup`: `App.jsx:356-359` (atrás de `isOn(S,'coach')`);
  views lazy `App.jsx:78,80,81` (`CoachChat.jsx`, `CoachIntake.jsx`, `CoachSetup.jsx`); `noTabs` `App.jsx:294`.
- Botão "Coach" no Plano: `fe/src/views/Plan.jsx:152,181`. No treino ("Ask the Coach"): `Workout.jsx:53,497,1075`
  + `components/WorkoutCoachSheet.jsx`. Gate comum: `fe/src/lib/use-coach-gate.js:14-21`,
  `fe/src/lib/coach.js:66-68` (`coachAvailable`; **demo=true devolve true**).
- Ajustes: página `coach` (`settings-pages.js:24,59`, só móvel), busca `:94`, linha admin `Settings.jsx:1300,1329-1330`,
  `forgetCoach` no reset (`Settings.jsx:47,454`). Módulos: `fe/src/lib/modules.js:43-44`. Integrações: cartões
  `coach`/`mcp` (`integrations.js:51-59`, categoria `ai` `:15`).
- Chaves de API (BYOK, só app móvel): `lib/coach-secrets.js`, `lib/coach-device.js`, `CoachSetup.jsx:19-22`.
- Chamadas a provedores: `fe/src/lib/coach-local.js` importa `api/coach/core/{pipeline,providers,adapters/*}`
  (`coach-local.js:20-29`); URLs em `api/coach/core/providers.js:16,23,30` (Anthropic, OpenAI, Gemini).
  Usado só se `MOBILE && coachLocal.mode==='byok'` (`fe/src/lib/coach-api.js:35-39`). Na web o coach é o do
  servidor (`/api/coach/*`, `coach-api.js:85-157`). `AdminCoach.jsx` cita `openrouter.ai`/ollama.
- Consentimento: `components/CoachConsentSheet.jsx`, `lib/coach-consent.js`. CSS: `fe/src/coach.css` (importado em `main.jsx:11`, inofensivo).
- MCP no frontend: apenas texto/links (`integrations.js:56-59`, `Integrations.jsx:29,146-147`, `modules.js:46`).
  `mcp/` é pacote separado (`mcp/package.json`, `opengym-mcp`), sem nenhum import no frontend e fora do build web.

**O que o build web atual leva** (conferido em `fe/dist`): chunks lazy `coach-local-*.js` (596 KB),
`providers-*.js` (contém as 3 URLs de IA), `CoachChat`, `CoachIntake`, `CoachSetup`, `coach-demo`, `Admin`,
`demoSeed`, `leaflet*`. Todos estão na lista `LAZY` do service worker, ou seja, **são baixados na instalação**
mesmo que nunca rodem.

**Remoção mínima**

1. UI (runtime): forçar módulos off em `fe/src/lib/modules.js` (3 linhas, sem export novo):
   `const OFF = new Set((import.meta.env || {}).VITE_STANDALONE === '1' ? ['coach','integrations','watch','health'] : [])`;
   `MODULES = [...].filter(m => !OFF.has(m.id))` (`:24`); 1ª linha de `isOn` (`:71`): `if (OFF.has(id)) return false`.
   Some rota, botão do Plano, gate do treino, cartões de Integrações (`CARD_MODULE`, `integrations.js:137`),
   página/linha de Ajustes e a opção em Módulos. O `(import.meta.env || {})` é obrigatório: `history.js`
   importa `modules.js` e é carregado em Node por `api/`/`mcp/`.
2. Build (tree-shake): plugin `resolveId` em `fe/src/gym12/vite-plugin.js`, ativo só em `vite.gym12.config.js`,
   que troca por stubs: `views/CoachChat.jsx`, `CoachIntake.jsx`, `CoachSetup.jsx`, `Admin.jsx` (leva `AdminCoach`),
   `lib/coach-local.js` (exportar os mesmos nomes como no-op: `setNotifier`, `localStatus`, `localReview`…
   ver `coach-local.js:37-273`), `lib/coach-demo.js`, `lib/demoSeed.js` (`buildDemoState = () => ({})`) e,
   opcional, `components/GymMap.jsx` (leaflet). Alias por caminho relativo não funciona bem (os imports vêm
   de pastas diferentes): resolver com `this.resolve(...)` e comparar o caminho absoluto.
3. Verificação pós-build: `grep -rlE "api\.(anthropic|openai)\.com|generativelanguage|openrouter" dist` deve ser vazio.

---

## 4. Marca

**HTML/PWA (fontes estáticas, sem vite-plugin-pwa)**

- `fe/index.html`: `<title>openGym</title>` `:64`, `meta description` `:65`, `theme-color #0c0e12` `:66`,
  `apple-mobile-web-app-title` `:70`, manifest `:74`, ícones `:75-76`, script de idioma pré-pintura `:10-15`,
  vigia de boot com textos "openGym could not start…/is taking too long" `:22-62`, tela de boot (halteres
  lima `#a3e635` sobre `#0c0e12`) `:83-122`.
- Manifest: arquivo estático `fe/public/manifest.json` (name/short_name `openGym`, cores `#0c0e12`, ícones
  `icon-180.png`/`icon-512.png` maskable).
- Service worker: arquivo próprio `fe/public/sw.js` (cache `opengym-rt-__BUILD__` `:7`, título padrão de push
  `'openGym'` `:214`), carimbado por `fe/scripts/sw-stamp.mjs` via plugin `swStamp` em `fe/vite.config.js:67-81`.
- Ícones web: `fe/public/icon-180.png`, `icon-512.png`. `fe/public/app-icons/*.png` e
  `fe/scripts/app-icons.mjs` (+ `fe/resources/icon.svg`, `resources/icons/*.svg`, `lib/app-icon-variants.js`)
  são os ícones alternativos/sazonais **do app móvel** (linha só com `MOBILE`, `Settings.jsx:465`).
  `scripts/app-icons.test.mjs` é a base dos 2 testes já falhando: não mexer.
- Splash nativo: só Capacitor (`fe/capacitor.config.json`, `android/`, `ios/`): fora do escopo web.

**Texto na UI** (todas via `t()` salvo indicação): 105 chaves do pt-BR contêm "openGym" (chave ou valor).
Literais fora do `t()`:
- `Settings.jsx:1180-1185` bloco de versão: "openGym v…", "free & open source (AGPL v3)", link do código
  `github.com/DuarteSantos8/openGym`, atribuição da mídia (texto exigido **literalmente**, licença §8c) e link
  `NOTICE.md`; `Settings.jsx:1333` "openGym v" na raiz.
- `Login.jsx:81` (h1). `fe/src/lib/print-doc.js:154` (marca no PDF) e `:160` ("Made with openGym · opengym.ch").
- Imagens de compartilhamento: `fe/src/lib/card-draw.js:11` (`SITE='opengym.ch'`) e `drawBrand` `:73-91`
  ("open"+"Gym"), usado por `recap-card.js:53`, `workout-card.js:389`, `wrapped-cards.js:372`.
- Nomes de arquivo/títulos: `sheets.jsx:3322`, `Recap.jsx:56`, `Wrapped.jsx:175` (`opengym-….png`).
- Dados (NÃO trocar, são formato): `import-csv.js:140,632`, `plan-share.js:265,296` (`opengym_plan`),
  `fit-export.js:340`, `mobile.js:345` (pasta de backup do app móvel).

**Doações, avaliação e links**: `Settings.jsx:1150-1167` (Buy me a coffee, Ko-fi, GitHub Sponsors; App Store só
iOS `:1156`, Play só `play` `:1158`). Sobre: "Get the Android app" `:1128-1130`; dica de instalar `:1172-1177`.
GitHub: `Settings.jsx:1182,1185`, `sheets.jsx:1369`, `Integrations.jsx:29-30`, `demo.js:14` (gitlab).
Discord: nenhum link na UI. Site: `opengym.ch` em `routine-link.js`, `nfc-tags.js`, `card-draw.js`, `print-doc.js`,
`gym-places.js:26` (User-Agent, só móvel).

**Licenças**: não existe tela de licenças no app. O que há: o bloco de versão em Sobre (`Settings.jsx:1180-1186`)
com links externos para o código e `NOTICE.md`. `scripts/catalogue/stage-media.mjs:40` copia
`catalogue/media/NOTICE.md` para `dist/exercise-media/NOTICE.md`.

> **Risco jurídico (ler antes de publicar)**: `NOTICE.md:47-63` e `catalogue/media/NOTICE.md`: a mídia
> (Gym visual) não é AGPL. "A non-commercial fork of openGym may keep the unmodified 180 px media together
> with this notice. A commercial fork… needs its own licence." GYM 12 só pode servir a mídia se for não
> comercial, sem alterar os arquivos, com o NOTICE junto e a atribuição literal. AGPL §13: o link "Código-fonte"
> tem de apontar para o código **do GYM 12**, não do upstream. Manter `LICENSE` e `NOTICE.md`.

**Ganchos mínimos de marca**
- HTML/manifest/ícones: zero edição. `transformIndexHtml` no plugin do GYM 12 troca título, metas, cores e
  textos do vigia; `closeBundle`/pós-build sobrescreve `dist/manifest.json`, `dist/icon-180.png`,
  `dist/icon-512.png` a partir de `brand/`. (Editar `index.html` quebraria `boot-watchdog.test.js`,
  `viewport-zoom.test.js`, `csp.test.js`.)
- Textos `t()`: transformação `openGym → GYM 12` nos valores da camada de tradução (§6).
- Literais: `Settings.jsx` (2 pontos), `card-draw.js` (2 linhas), `print-doc.js` (2 linhas), lendo de `gym12/flags.js`.

---

## 5. Tema, cores, fontes, números

- Tokens CSS em `fe/src/index.css`: `:root` escuro (padrão) `:20-112` (`--bg`, `--surface*`, `--label*`,
  paleta iOS `:47-49`, `--acc` `:52-60`, escala tipográfica `:70+`); claro `:root[data-theme="light"]` `:115+`;
  acentos `:root[data-accent="…"]` `:144-151` e tintas no claro `:155-174`; alto contraste `:176-200`;
  `color-scheme` `:205-206`. CSS extra: `admin.css`, `coach.css`, `views/FocusView.css`, `seasonal/*.css`.
- Acentos: presets em `fe/src/lib/format.js:189-192` (`ACCENT_NAMES`, `ACCENTS`, `ACCENT_INK`); padrão `lime`
  (`fe/src/lib/accent.js:19`); cor própria e contraste `accent.js:100-227` (`THEMES` com `--bg`/`--surface`
  copiados à mão `:100-103`); aplicado em `applyAccent` (`:217`). Seletor: `AccentSwatches` (`Settings.jsx:1611`,
  usado em `:960`).
- Claro/escuro: `S.theme` `'dark'|'light'|'system'`; padrão `DEF.theme: 'dark'` (`useStore.js:93`);
  `resolveTheme`/`applyPrefs` em `App.jsx:111-123` (põe `data-theme`, `data-accent` e `meta theme-color`
  `#f2f2f7`/`#000000` em `:121`); escuta do sistema `:169-175`. Controle: `Settings.jsx:944-954`.
  Sazonal pode substituir o acento (`lib/seasonal.js`, `App.jsx:164`).
- Fontes: só pilha do sistema (`index.css:214`), nenhuma webfont, nenhum Google Fonts. Mono só em `.acct-id`
  (`:529`). `font-variant-numeric: tabular-nums` já é global no `body` (`:219`) e em 36 regras.
- Onde os números aparecem: células de série `.stp .val` (`Workout.jsx:399-405,631-634,653-657,672-675`; stepper
  genérico `components/ui.jsx:193-198`; CSS `index.css:1091,1396-1437`); timer de descanso `#timer .t`
  (`RestTimer.jsx:124,142,169`; CSS `:1847`); tempo na tab bar `#tabbar button.start .tab-time` (`:645`);
  cabeçalho do treino `.whdr-mid .sub` (`:1182`), volume `.wvol` (`:1206`); Stats `.stat-v` (`:2216`),
  `.kpis .tile` (`:3227-3232`); anilhas `.plateline .moves` (`:1699`); `Elapsed.jsx` é um `<span>` sem classe.
- **Gancho**: `fe/src/gym12/gym12.css` importado por `gym12/boot.js` com seletores `:root:root…` (especificidade
  maior, independe da ordem de carga) para tokens/acento, e uma regra
  `.stp .val, .stp .num, #timer .t, .tab-time, .whdr-mid .sub, .wvol, .stat-v, .kpis .tile {font-family: var(--g12-mono)}`.
  Fonte mono: preferir pilha do sistema (`ui-monospace, SFMono-Regular, Menlo, Consolas`) ou woff2 embutida
  como data-URI (fontes por URL não entram no precache do SW, §9). Tema padrão diferente para perfil novo:
  1 linha em `freshState` (`useStore.js:330-338`). Regras de teste que valem para `src/gym12/`:
  `color-mix-fallback.test.js` varre todo `.css` em `src/` (color-mix exige fallback `@supports not`).

---

## 6. i18n

- Carga: `fe/src/lib/i18n.js:20-23` (`import.meta.glob` de `../locales/*.js`, `../instr/*.js`,
  `../exercise-names/*.js`, `../exercise-desc/*.js`); `setLang` `:55-81` carrega 3 pacotes em paralelo
  (`:71-75`) e chama `_setLangState` (`:76`). Estado em `fe/src/lib/i18n-core.js` (`LANGS` `:6-11`, `t()`,
  `exerciseNameFor` `:216`, `exerciseNameSearchText` `:262`, `_setLangState` `:270-283`; **inglês força
  dict vazio** em `:275`). Chaves = string em inglês.
- pt-BR: `fe/src/locales/pt-BR.js` = `{ ...pt, ...PT_BR_OVERRIDES }` (última linha). Contagem:
  **3.615 chaves visíveis em pt-BR = 2.317 sobrescritas próprias + 1.298 herdadas do pt** (0 chaves só do BR).
  2.961 literais `t()` distintos usados em `src/` (todos presentes, `check-source-strings.mjs`).
- Idioma padrão: perfil novo recebe `lang` de `detectedLang()` (`useStore.js:318-324`: só RTL, senão `'en'`)
  e `langAuto: true` (`:330-334`). O idioma efetivo é `effectiveLang` (`default-lang.js:59-69`, chamado em
  `App.jsx:178-180`): `config.default_lang` do servidor → cache `gym_default_lang` → `navigator.languages`.
  **Pegadinha**: sem servidor `config` fica `null`; sem cache, `effectiveLang` devolve `'en'` e ignora o
  navegador. O seletor (`Settings.jsx:850-857`) grava `lang` e `langAuto=false`.
- **Forçar pt-BR mantendo o seletor (zero edição)**: em `gym12/boot.js`, se `gym_default_lang` não existir,
  `localStorage.setItem('gym_default_lang','pt-BR')`. Todo perfil "nunca escolheu" abre em pt-BR; quem escolhe
  outro idioma fica com ele. Opcional: `document.documentElement.lang='pt-BR'` (o script de `index.html:10-15`
  põe `en` antes da pintura).
- **Camada de tradução GYM 12** (`fe/src/gym12/locales/pt-BR.js`, `{ ui: {chave:texto}, names: {id:nome} }`):
  - Opção A (recomendada, 3 linhas em `i18n.js:71-76`): `const ov = await overlayFor(l)` e passar
    `{...dict, ...ov.ui}` e `{...exerciseNames, ...ov.names}` ao `_setLangState`. `overlayFor` (em
    `gym12/i18n-overlay.js`) devolve `{}` fora do standalone e aplica `openGym→GYM 12` nos valores.
    Nomes sobrescritos entram também na busca (`exerciseNameSearchText`). Para rebatizar o inglês: 1 linha
    em `i18n-core.js:275` aceitando `newDict` para `en`.
  - Opção B (zero edição): `gym12/boot.js` importa estaticamente `../locales/pt-BR.js` e
    `../exercise-names/pt-BR.js` e faz `Object.assign` nos objetos exportados antes do 1º `setLang` (mesma
    instância de módulo que o glob carrega). Efeito colateral bom: esses pacotes vão para o grafo de entrada e
    entram no precache (§9). Só cobre os idiomas importados.
  - Não colocar a camada em `src/locales/` (o glob a trataria como idioma; `locale-coverage.test.js` conta os
    pacotes). `check-locales.mjs` e o fingerprint do pt-BR (`scripts/pt-br-inheritance-fingerprint.mjs`) não a veem.
- Catálogo: `catalogue/i18n/pt-BR.json` = `{ "<id>": { name, instructions? } }` (5.632 nomes, 1.324 instruções,
  0 descrições). Chega ao app por **build commitado**: `scripts/catalogue/build.mjs` gera
  `fe/src/exercise-names/pt-BR.js` (`JSON.parse('{…}')`, 270 KB), `fe/src/instr/pt-BR.js`,
  `fe/src/lib/exercises-data.js` e `fe/src/lib/catalogue-langs.js`; CI roda `--check`. Não é buscado em runtime.
  Overlay de nomes: `names` da opção A/B (não editar o JSON nem os gerados).
- Ranking de popularidade: **não há telemetria de uso** (por princípio). Melhores aproximações no repo:
  `fe/src/lib/hevy-id-map.js` (297 modelos nativos do Hevy → **265 ids distintos do catálogo**: a melhor lista
  "~300 mais comuns"); `STAPLES` em `fe/src/lib/exercises.js:576-583` (44 básicos de academia, 36 deles no Hevy);
  `priorOf`/`CLASSIC` (`:562-571`, `catalogue-v13-ids.json`, 1.324 exercícios clássicos); `liftosaur-exercises.js`
  (218 nativos do Liftosaur, mapeados em `import-apps.js`); planos de `fe/src/lib/starter.js:12-37`.
  Sugestão: união Hevy ∪ STAPLES ∪ starter.

---

## 7. Criação de rotina e modelos prontos

- Botão "New routine": `fe/src/views/Plan.jsx:429-433` (`addRoutine`, cria e navega a `/plan/r/:id`) e `:462`;
  também `sheets.jsx:1475-1494` (rotina nova a partir de um exercício).
- Tela de edição: `fe/src/views/RoutineEdit.jsx` (`export default` `:365`, render `:461`; cabeçalho `:462-469`,
  bloco de progressão `:471-485`). **Aviso**: inserir `<Gym12RoutineNotice/>` logo após o cabeçalho (`:469`),
  2 linhas (import + JSX), renderiza `null` fora do standalone.
- Modelos prontos ("starter plans"): dados em `fe/src/lib/starter.js` (PPL, Upper/Lower, Full Body, 5×5;
  `PLANS` `:39+`); textos em `sheets.jsx:227-232` (`PLAN_COPY`), seletor `StarterPlanChooser` `:263-306`
  (título "Choose starter plan" `:285`), `starterPlanSheet` `:306`. Entradas "Load starter plan":
  `Home.jsx:221`, `Plan.jsx:165,322,492`, `Settings.jsx:846`. Programas prontos: `views/Programmes.jsx:145`
  ("Starter programmes"). **Renomear** para "Modelos de divisão (exemplo)" só pela camada de tradução
  (chaves `Load starter plan`, `Choose starter plan`, `Starter programmes`; hoje "Carregar plano inicial",
  "Escolha um plano inicial", "Programas iniciais"). Nomes das rotinas criadas ficam em inglês por design
  (`starter.js:5-7`).

---

## 8. Mídia dos exercícios

- Resolução de URL: `fe/src/lib/exercises.js:189-210`: `IMG_BASE = VITE_IMG_BASE || 'exercise-media/still/'`,
  `GIF_BASE = VITE_GIF_BASE || 'exercise-media/clip/'`, `CLIP_EXT` mp4 (webp só no Android de loja);
  `imgSrc`/`gifSrc` `:208,210`. Caminho **relativo, mesma origem** (`base: './'`). Dev: middleware
  `catalogueMedia` em `fe/vite.config.js:17-37` serve direto de `catalogue/media`.
- `catalogue/media/`: só tamanho 180 px (regra de licença, `scripts/catalogue/check-media.mjs`).
  `still/` 6.554 `.webp` (33,2 MiB, máx. 12,5 KB); `clip/` 6.554 `.mp4` (156,7 MiB, máx. 188 KB); `NOTICE.md`.
  Total 13.109 arquivos, ~190 MiB. (5.632 exercícios + 922 desenhos de variante feminino/masculino.)
- `scripts/catalogue/stage-media.mjs <dist>`: copia `still/*.webp` e `clip/*.mp4` para
  `<dist>/exercise-media/{still,clip}` e o `NOTICE.md` (`APP_MEDIA_DIR` = mídia maior, só release móvel).
  O build web normal (`npm run build`) **não** inclui mídia (no Docker o nginx a monta); o demo do Pages a
  inclui rodando `stage-media` depois do build (`.github/workflows/pages.yml:45-50`).
- **Mínimo para o GYM 12**: rodar `node ../scripts/catalogue/stage-media.mjs dist` depois do `vite build`
  (zero código). Nada de `VITE_IMG_BASE`.
- Contagem final estimada do `dist`: hoje 169 arquivos (154 em `assets/`, 10 `app-icons`, 5 na raiz; 28 MB;
  maior arquivo `assets/en-*.js` 1,79 MB). Menos ~10 chunks de IA/admin/leaflet/demo (§3), mais 13.109 de mídia
  e ~5 do GYM 12 ≈ **13.270 arquivos, ~220 MiB**. Abaixo de 20.000 arquivos; maior arquivo ≪ 25 MiB.

---

## 9. PWA / offline

- Registro: `fe/src/main.jsx:39-44`, só fora do móvel e **só em `https:`** (`vite preview` em http não tem SW).
  Depois disso, prefetch de mídia (`fe/src/lib/media-prefetch.js:111`).
- Estratégia (`fe/public/sw.js`): instalação faz precache do `index.html` e de tudo que ele referencia
  (js/css/png/svg/json, `:47-88`) e da lista `LAZY` (chunks sob demanda) carimbada pelo build
  (`fe/scripts/sw-stamp.mjs:16-27`). Pacotes de idioma (`locales/`, `instr/`, `exercise-names/`) ficam **fora**
  do precache, exceto `instr/en.js` (`sw-stamp.mjs:9-14`). Chunks com hash: cache-first (`sw.js:255-264`);
  resto: rede primeiro com fallback ao cache em 3 s (`:279-304`); `/api/` nunca em cache (`:269`).
- Mídia: **nunca** precache; cache-first em runtime no cache próprio `opengym-media-v1`, limitado a 150 MB /
  3.000 itens com LRU aproximado (`sw.js:14-35,138-149,177-200`), sobrevive a atualizações, responde a Range
  de vídeo (`:156-173`). `media-prefetch.js` baixa adiantado só a mídia do plano e só como app instalado
  (`installedApp`, `:65-68`). Os ~190 MiB do catálogo passam do teto: manter em runtime (correto como está).
- **Risco pt-BR offline**: como o pt-BR será o padrão e seus pacotes não são precacheados, um app atualizado e
  aberto sem rede pode cair em inglês. Correção sem editar o SW: importar os pacotes pt-BR estaticamente em
  `gym12/boot.js` (opção B do §6) ou acrescentá-los à `LAZY` num pós-build.
- `display-mode: standalone`: `index.css:230`, `media-prefetch.js:57-68` (`installedApp()`, reutilizável),
  `edge-swipe-back.js:94-97`, `Settings.jsx:121-123` (`standalone()`).
- `beforeinstallprompt` / `appinstalled`: **não existem** no código. UI de instalação atual: só a seção "Tip"
  em Sobre (`Settings.jsx:1169-1177`), texto por plataforma, sem botão.
- `navigator.storage.persist`: **não é chamado** em lugar nenhum. Pontos: `gym12/boot.js` quando
  `installedApp()` for verdadeiro, e/ou ao concluir o primeiro treino; opcionalmente mostrar o estado em Dados e backup.

---

## 10. Testes

- Layout: 651 arquivos `*.test.*` ao lado do código (`fe/src/**`, `fe/scripts/*.test.mjs`); vitest com
  happy-dom, setup `fe/src/test-setup.js` (`vite.config.js:128`); include padrão, ou seja, testes em
  `src/gym12/` rodam no `npm test` sem configuração.
- Regra que mantém o upstream verde: **toda mudança de comportamento atrás de `STANDALONE`** (falso no vitest)
  e marca de HTML/manifest/ícones só no build do GYM 12. Nunca pôr `VITE_STANDALONE` em `fe/.env` ou
  `.env.test` (o vitest carregaria e dezenas de testes de Ajustes/Módulos/Integrações quebrariam); usar
  só o comando de build / `vite.gym12.config.js` (um `.env.production` também funcionaria, o vitest
  não o lê, mas transformaria todo `npm run build` em GYM 12).
- Testes que quebrariam se os originais fossem editados sem flag:
  - texto de `index.html`: `lib/boot-watchdog.test.js` ("openGym could not start…"), `lib/viewport-zoom.test.js`,
    `lib/csp.test.js` (hash do script inline, casado com `web/Dockerfile`).
  - fonte lida como texto: `App.no-tabs.test.js` e `lib/system-bars.test.js` (`App.jsx`: `const noTabs =`,
    `{!noTabs && <TabBar`), `lib/coach.test.js:690` (`useStore.js`: `config: null`, `api('/api/config')`),
    `lib/sw-lazy.test.js:77` (`vite.config.js`: `generateBundle…lazyAssets` e `stampSw(...)`) → não editar
    `vite.config.js`, `lib/mobile.autobackup.test.js` (`Settings.jsx`: `autoBackupSubtitle(…, 14)`).
  - `public/sw.js`: `sw.test.js`, `sw-media.test.js`, `sw-offline-launch.test.js`, `sw-subpath.test.js`, `sw-lazy.test.js`.
  - módulos: `lib/modules.test.js` (ids/contagem), `views/Modules.test.jsx`, `views/settings-pages.test.jsx`
    (renderiza cada página e exige cada linha do índice de busca), `views/Integrations.test.jsx`.
  - idioma: `lib/default-lang.test.js`, `default-lang.effective.test.js`, `store/useStore.default-lang.test.jsx`,
    `useStore.weighin-default.test.jsx`, `lib/locale-coverage.test.js`, `lib/pt-br-locale.test.js`, `pt-br-instructions.test.js`.
  - tema/acento: `views/Settings.themes.test.jsx`, `Settings.accent.test.jsx`, `accent-swatch.test.js`,
    `lib/accent.test.js`, `design-review.test.js`, `a11y-contrast-transparency.test.js` (leem `index.css`).
  - demo/IA: 14 testes mocam `lib/demo.js` (lista: `SyncBanner`, `coach-api.*` (4), `coach-demo`, `StructuralBalance`,
    `Login.*` (3), `CoachIntake`, `Integrations`, `CoachChat.demo-failure`, `Plan.rotation`); 68 arquivos citam coach.
  - nome: 51 arquivos contêm "openGym", p.ex. `Wrapped.test.jsx:52,74`, `RoutineShare.test.jsx:69,126`,
    `plan-print.test.js`; seguros enquanto a troca de marca for só no standalone.
- Varreduras do upstream que **também valem para `src/gym12/`**: `scripts/check-source-strings.mjs --strict`
  (todo `t('literal')` precisa existir em todos os 19 pacotes: no código GYM 12 usar textos pt-BR diretos ou
  `t(variável)`), `lib/empty-placeholder.test.js` (sem `'—'` como placeholder), `design-review.test.js:165+`
  (padrão de cartões em `.jsx`), `color-mix-fallback.test.js` (CSS).
- Testes dependentes de env (18 arquivos, `vi.stubEnv`/`import.meta.env`): `Animations.test.jsx`, `print-pictures`,
  `media-prefetch`, `mobile.listener`, `rest-alert.native`, `exercises.clip-ext`, `system-bars`, `sound`,
  `health-sync(.read)`, `widgets`, `live-activity`, `mobile.remote-file`, `channel`, `useStore.adopt-hold`,
  `useStore.media-backup`, `useStore.mobile-remote`, `useStore.mobile-durable`. Modelo para os testes GYM 12:
  `vi.stubEnv('VITE_STANDALONE','1')` + `vi.resetModules()` + `await import(...)` (as flags são lidas no carregamento).
- Testes novos sugeridos (`fe/src/gym12/*.test.js`): módulos forçados off; `effectiveLang` com o cache pt-BR;
  overlay (`openGym` some de todos os valores pt-BR); boot vazio (sem seed); gate de instalação; e um teste de
  build (padrão de `check-bundle-syntax.test.mjs`) que procura URLs de IA no `dist`.
- Linha de base: `scripts/app-icons.test.mjs` com 2 falhas pré-existentes; o resto passa.

---

## 11. Rotas e entrada

- Entrada: `fe/index.html:124` → `fe/src/main.jsx` (CSS `:10-12`, render `:26-28`, SW `:39-44`) → `fe/src/App.jsx`
  (`App` `:425-513`: `boot()` do store, `HashRouter` `:512`; `Shell` `:125-395`).
- Roteador: `HashRouter` (URLs `#/home`…; o servidor só precisa servir `/`, sem `_redirects` no Cloudflare).
  Decisão de tela em `App.jsx:333`: `!authed → Login`, `needsMobileOnboarding → MobileOnboarding`,
  `permSteps → PermissionSteps`, senão `<Routes>` `:334-362`. Catch-all `:361` → `/home`.
- Views lazy registradas em `lazyView` (`App.jsx:67-104`) e pré-buscadas no ócio.
- **Landing de instalação com toque mínimo**: envolver o app em `main.jsx` (2 linhas):
  `import { Gym12Gate } from './gym12/Gate.jsx'` e `render(<StrictMode><Gym12Gate><App/></Gym12Gate></StrictMode>)`.
  O Gate mostra a landing quando `STANDALONE && !installedApp() && !dispensado`, captura
  `beforeinstallprompt` (registrado em `gym12/boot.js`, no carregamento) e **precisa chamar `hideBoot()`**
  (`fe/src/lib/boot.js:15`): o vigia de `index.html:59-61` mostra "taking too long" após 10 s se a tela de
  boot não sair. Alternativa dentro do roteador: 1 condição a mais em `App.jsx:333` (cuidado com o teste que lê a linha `noTabs`).
- Build separado sem tocar em `vite.config.js`: novo `fe/vite.gym12.config.js` =
  `mergeConfig(base, { plugins: [gym12()] })` (arrays de plugins são concatenados), rodado com
  `vite build --config vite.gym12.config.js`. O vitest continua usando `vite.config.js`.

---

## 12. O que acessa a rede ou recursos remotos em runtime

| O quê | Onde | Web standalone |
|---|---|---|
| `/api/*` (config, me, data, push, coach, media, integrations) | `lib/api.js:59-106`, `beacon` `:113-119` | não chamado (boot demo + convidado) |
| Umami (analytics) | `vite.config.js:39-56` | só se `VITE_UMAMI_SRC` **e** `VITE_UMAMI_ID` no build: não definir |
| GitHub releases (update) | `lib/update.js:16,59,105` | só móvel |
| Provedores de IA | `api/coach/core/providers.js` via `lib/coach-local.js` | só móvel BYOK; remover do bundle (§3) |
| Hevy API | `lib/import-hevy.js:38` | ação do usuário; esconder a linha (`Settings.jsx:1098`) |
| Tiles OSM + Nominatim/Photon + links Google/Apple Maps | `lib/gym-places.js`, `components/GymMap.jsx:33` | só móvel; chunk leaflet ainda vai no SW (stub opcional) |
| YouTube (embed nocookie, busca) | `components/YouTubeVideo.jsx`, `lib/youtube.js`, `sheets.jsx:1365`, `Workout.jsx:35`, `FocusView.jsx:27` | só por ação do usuário |
| Links externos (doação, GitHub, opengym.ch, lojas) | `Settings.jsx:1128-1185`, `sheets.jsx:1369`, `Integrations.jsx:29-30` | só ao tocar; esconder |
| Link de rotina `opengym.ch/r#…` | `lib/routine-link.js:24,158` | gerado sem rede, mas aponta ao site upstream |
| Push subscribe no SW | `public/sw.js:241` | só com assinatura (exige servidor) |
| Fontes/CSS/scripts remotos | nenhum (sem Google Fonts, sem CDN) | ok |

Mídia, pacotes de idioma e chunks: mesma origem.

---

## Plano de camada fina

**Arquivos novos**

| Arquivo | Papel |
|---|---|
| `fe/vite.gym12.config.js` | `mergeConfig(base)` + plugin GYM 12; define `VITE_DEMO=1` e `VITE_STANDALONE=1` |
| `fe/src/gym12/flags.js` | `STANDALONE`, `BRAND` (nome, site, URL do código-fonte do GYM 12), idioma padrão |
| `fe/src/gym12/vite-plugin.js` | stubs de IA/admin/demo/leaflet (`resolveId`); `transformIndexHtml` (título, metas, cores, textos do vigia); manifest/ícones de `brand/`; `_headers` do Cloudflare |
| `fe/src/gym12/stubs/*` | `EmptyView.jsx`, `coach-local.js`, `coach-demo.js`, `demoSeed.js`, `GymMap.jsx` |
| `fe/src/gym12/boot.js` | só se `STANDALONE`: chaves `gym_demo_seeded_v1` e `gym_default_lang`; `beforeinstallprompt`; `storage.persist()`; importa `gym12.css` e os pacotes pt-BR |
| `fe/src/gym12/Gate.jsx` + `InstallLanding.jsx` | landing quando não instalado; chama `hideBoot()` |
| `fe/src/gym12/i18n-overlay.js` + `locales/pt-BR.js` | `overlayFor(lang)`: `ui`, `names`, troca `openGym → GYM 12` |
| `fe/src/gym12/RoutineNotice.jsx` | aviso na criação de rotina |
| `fe/src/gym12/SettingsBits.jsx` | linhas da conta/sobre no standalone (sem texto demo) |
| `fe/src/gym12/gym12.css` | tokens, acento, fonte mono nos números |
| `fe/src/gym12/scripts/postbuild.mjs` | chama `stage-media.mjs dist`; falha se achar URL de IA, mais de 20.000 arquivos ou arquivo > 25 MiB |
| `fe/src/gym12/*.test.js` | testes do §10 |
| `brand/` (raiz) | ícones 180/512 e manifest do GYM 12 |

Comando de build (Cloudflare Pages): `cd frontend && npm ci && VITE_DEMO=1 VITE_STANDALONE=1 npx vite build --config vite.gym12.config.js && node src/gym12/scripts/postbuild.mjs dist`
(saída `frontend/dist`).

**Arquivos originais que mudam**

| Arquivo | Mudança | Linhas |
|---|---|---|
| `fe/src/main.jsx` | `import './gym12/boot.js'` (1º import) e `<Gym12Gate>` em volta de `<App/>` (`:26-28`) | 2 |
| `fe/src/lib/modules.js` | conjunto `OFF` por env, filtro em `MODULES` (`:24`), 1ª linha de `isOn` (`:71`) | 3 |
| `fe/src/lib/i18n.js` | merge de `overlayFor(l)` em `setLang` (`:71-76`); dispensável com a opção B | 3 |
| `fe/src/lib/i18n-core.js` | (opcional) aceitar dict para `en` em `:275`, para rebatizar o inglês | 1 |
| `fe/src/views/Settings.jsx` | ramo `STANDALONE` em `:1204`, `:1211`, `:1288`; esconder Suporte `:1155`, Android `:1128-1130`, Hevy `:1098`; marca/URL do código em `:1181-1182` e `:1333` (atribuição da mídia **intacta**) | ~8 |
| `fe/src/lib/card-draw.js` | `SITE` (`:11`) e texto da marca em `drawBrand` (`:81-84`) vindos de `BRAND` | 3 |
| `fe/src/lib/print-doc.js` | marca `:154` e rodapé `:160` | 2 |
| `fe/src/views/RoutineEdit.jsx` | import + `<Gym12RoutineNotice/>` após `:469` | 2 |
| `fe/src/lib/routine-link.js` | (opcional) `linkFor` (`:158`) → `location.origin + '/#/r/' + payload` no standalone | 2 |
| `fe/src/sheets.jsx` | (opcional) esconder "Suggest a fix" (`:1367`) | 1 |
| `fe/src/store/useStore.js` | (opcional) tema/acento/`enParens` padrão em `freshState` (`:330-338`) | 1 |

Total: cerca de 25 linhas em 6 arquivos obrigatórios (+5 opcionais). Nenhuma mudança em `index.html`,
`public/manifest.json`, `public/sw.js`, `vite.config.js`, `demo.js`, `pt.js`/`pt-BR.js`, `catalogue/` ou
nos arquivos gerados. Cada linha alterada vai para `GYM12_CHANGES.md`.

**Decisões em aberto (para o orquestrador)**: confirmar que o GYM 12 é não comercial (licença da mídia);
URL pública do código-fonte do GYM 12 (AGPL §13); manter ou desligar Check-in (NFC grava `opengym.ch`),
Sazonal e "Your year in…"; o que fazer com "Compartilhar rotina" (outra origem ou esconder); paleta, tema
padrão e fonte mono; se o inglês também deve ser rebatizado (exige a linha em `i18n-core.js`).
