# GYM 12 — página de instalação (especificação do orquestrador)

## Quando aparece
- Primeira tela para quem abre o link FORA do app instalado: `!matchMedia('(display-mode: standalone)').matches && !navigator.standalone`.
- Instalado (standalone) → entra direto no treino (rota inicial do app), nunca vê esta página.
- "Usar sem instalar" grava `gym12.skipInstall=1` (localStorage, try/catch) e entra no app; nas próximas visitas no navegador vai direto ao app. Acessível também por /instalar (link discreto em Ajustes > "Instalar o GYM 12").
- Só existe no build standalone (VITE_STANDALONE=1).

## Detecção do ambiente (função pura, testável, em frontend/src/gym12/install/detect.js)
- `inapp`: UA contém `Instagram`, `FBAN`, `FBAV`, `FB_IAB`, `FBIOS`, `Messenger` → caminho "abrir no navegador".
- `ios-safari`: iPhone/iPad (incl. iPadOS com UA de Mac + touch) e NÃO in-app; se não for Safari (CriOS/FxiOS/EdgiOS), mostrar o mesmo passo a passo com a nota "No iPhone, a instalação é pelo Safari." + botão copiar link.
- `android-chrome`: Android e não in-app. Se `beforeinstallprompt` chegou → botão "Instalar o GYM 12" (chama prompt()). Sem o evento (após ~2,5 s ou se o navegador não suporta) → passos pelo menu ⋮: "Toque em ⋮ no canto de cima" → "Instalar app" (ou "Adicionar à tela inicial").
- `desktop`/outros: texto curto "Abra este link no celular" + QR opcional NÃO (sem dependência nova); mostrar só "Usar sem instalar".

## Layout (390×844, ink-950, sem rolagem horizontal, gutter 20 px)
1. Topo: wordmark GYM 12 pequeno (GYM bone + 12 lime), Geist/Fraunces 600, 20 px.
2. Kicker mono: "— APP DE TREINO GRÁTIS" (mist-400, 11 px, tracking 0.16em).
3. Título Fraunces 40/44 px, bone, text-wrap balance: "Sua ficha de treino, *evoluída*" — "evoluída" em itálico Fraunces e em lime (a única palavra lime da dobra; o botão principal é lime também — exceção aceita: botão é o CTA). 
4. Mock do celular: moldura arredondada (raio 36 px, borda 6 px ink-700, sombra suave), ~220×450 px, centralizado, com uma CAPTURA REAL do GYM 12 (tela de treino em andamento com números em mono) — imagem estática gerada por Playwright do próprio build (`frontend/public/gym12/install-screen.webp`, ~60 KB), com dados fictícios só para a foto. Leve "12" fantasma gigante em Fraunces atrás (opacidade 4%, sangrando pela direita).
5. Faixa: fundo ink-900, bordas ink-700 em cima/embaixo, texto Geist 14 px bone: "Grátis. Sem anúncio. Seus treinos ficam no seu celular." com os três pontos-chave separados.
6. Bloco de instruções conforme o ambiente (cartão ink-900, borda ink-700, raio 20):
   - in-app: desenho simples SVG (barra do topo de um navegador com "•••" destacado em lime no canto superior direito + seta) e texto: "Toque nos ••• no canto e escolha **Abrir no navegador**." Para Instagram iOS o menu fica em cima à direita; manter o desenho genérico. Abaixo: botão secundário "Copiar link" (clipboard, feedback "Link copiado").
   - iOS Safari: 3 passos numerados (números em JetBrains Mono lime): 1 "Toque em Compartilhar" com o ícone SVG do share do iOS (quadrado com seta para cima) desenhado inline; 2 "Role e escolha **Adicionar à Tela de Início**" com ícone de quadrado com +; 3 "Toque em **Adicionar**. O GYM 12 aparece na sua tela de início."
   - Android com prompt: botão primário lime pílula 56 px "Instalar o GYM 12".
   - Android sem prompt: 2 passos: "Toque em ⋮ no canto de cima" e "Escolha **Instalar app** ou **Adicionar à tela inicial**".
7. "Usar sem instalar" — botão ghost (borda ink-700, texto bone), SEMPRE visível em todas as variantes, logo abaixo do bloco.
8. Rodapé mínimo mist-500 12 px: "Funciona sem internet depois de instalado." Sem crédito, sem openGym, sem links externos.
- Sem cartão de WhatsApp (decisão: fork não comercial).
- Movimento: entrada fade+translateY 16px, stagger 80 ms; respeitar prefers-reduced-motion.
- Acessibilidade: contraste AA, alvos ≥ 44 px, idioma pt-BR, botões reais.
