# GYM 12 — especificação de marca (decidida pelo orquestrador)

Identidade herdada do Protocolo 12.

## Cores (tokens)
| Papel | Valor |
|---|---|
| ink-950 (fundo base) | #050604 |
| ink-900 (cartão / elevado) | #0a0c08 |
| ink-800 (elevado 2, inputs) | #121510 |
| ink-700 (borda) | #1a1e17 |
| ink-600 (borda forte) | #252a20 |
| lime (destaque padrão) | #c4f439 |
| lime-400 (hover) | #d4fa5e |
| lime-600 (pressionado) | #a8d82e |
| bone (texto principal) | #f4f1ea |
| mist-400 (texto secundário) | #8b8a7e |
| mist-500 (terciário) | #6b6a5e |
| signal-amber (aviso) | #e8b83c |
| signal-red (erro) | #e5484d |
| texto sobre lime | #050604 |

Regra do lime: acento, não fundo. Um elemento lime dominante por tela (botão principal OU número-chave OU palavra do título).
O app é sempre escuro por padrão (tema escuro = ink). Se o openGym tiver tema claro/seletor de cor de destaque, o padrão passa a ser escuro + lime; os outros temas podem continuar disponíveis.

## Tipografia (todas servidas pelo próprio app, woff2 em frontend/public/fonts ou via @fontsource empacotado; licença OFL — manter os arquivos OFL junto)
- Fraunces (variável, com itálico): SÓ títulos grandes (título de página/tela, hero, splash, página de instalação). Ênfase em itálico de Fraunces numa palavra do título (ex.: "Sua ficha de treino, *evoluída*").
- Geist (variável): toda a interface (corpo, botões, listas, navegação).
- JetBrains Mono: todo número de treino (carga, repetições, séries, tempo de descanso, cronômetro, volume, recordes, datas curtas em tabelas), com `font-variant-numeric: tabular-nums`. Também rótulos técnicos/kickers em caixa alta com tracking largo.

## Marca
- Nome: "GYM 12" (com espaço, caixa alta). Wordmark: "GYM" em bone + "12" em lime, Fraunces peso 600-700.
- Ícone do app (PWA, 192/512/maskable/apple-touch 180): fundo ink-950, "GYM" pequeno em bone em cima, "12" grande em lime, Fraunces; margem segura de 20% no maskable.
- Tela de abertura (splash): ink-950, wordmark centralizado, fino traço lime embaixo.
- theme_color e background_color do manifest: #050604.
