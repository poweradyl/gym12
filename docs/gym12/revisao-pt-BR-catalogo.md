# Revisão dos nomes pt-BR do catálogo (GYM 12)

Revisão dos nomes em português do Brasil dos exercícios mais comuns de academia. Nada no catálogo
(`catalogue/`) nem nos arquivos gerados foi editado: os nomes revisados ficam na sobreposição
`frontend/src/gym12/locales/pt-BR.names.js` (`{ "<id>": "Nome" }`), aplicada por cima de
`catalogue/i18n/pt-BR.json`. Só entram ali os nomes que mudaram. São duas camadas no mesmo arquivo:
a revisão manual (§1–§4 e §7) e a padronização automática do catálogo inteiro (§5); quando as duas mexem no
mesmo id, a manual ganha.

## 1. Como a lista de prioridade foi montada

Não há telemetria de uso (MAPA §6), então a lista é a união de quatro fontes do próprio repositório:

| Fonte | Exercícios |
|---|---|
| `frontend/src/lib/hevy-id-map.js` (`HEVY_ID_MAP` + `HEVY_TITLE_MAP`, modelos nativos do Hevy) | 265 |
| `STAPLES` em `frontend/src/lib/exercises.js` (básicos de academia comercial) | 44 |
| Planos prontos de `frontend/src/lib/starter.js` (PPL, superior/inferior, corpo inteiro, 5×5) | 17 |
| Nativos do Liftosaur (`liftosaur-exercises.js`), ligados a ids pelo próprio importador do app (`liftosaurMatchName` + `matchExercise`): 182 de 218 casaram | 180 |
| **União sem repetição** | **363** |

Como a união já passou de 300, não foi preciso completar com a lista `CLASSIC`.

## 2. Contagens

- Revisados: **363**
- Alterados à mão: **140**
- Mantidos: **223** (inclui os que só diferiam na maiúscula inicial; ver §4). Destes, 8 recebem só a
  padronização automática da §5 (nome próprio com maiúscula ou "barra V"): `0070`, `0372`, `0402`, `0439`,
  `0592`, `1597`, `2137`, `2249`.
- Padronização automática (§5): **736** nomes mudam; 34 deles já tinham nome manual (a manual ganha), então
  **702** entram no arquivo por essa via.
- Total na sobreposição: **842** entradas (140 manuais + 702 automáticas).
- Colisões criadas: **0** (checado no conjunto inteiro de 5.632 nomes, sobreposição por cima do `pt-BR.json`).
  Grupos de nomes repetidos: 105 antes → 99 depois. Três pares que já eram iguais no catálogo original
  (`1503`/`4568` abertura, `1004`/`4398` agachamento, `0905`/`4358` puxada ajoelhado, todos "com faixa
  elástica") voltam a ser iguais depois da padronização; não são colisões novas.

## 3. Glossário adotado

| Inglês | pt-BR |
|---|---|
| bench press | Supino reto / inclinado / declinado |
| fly / pec deck | Crucifixo / Voador (`1030`); reverse pec deck → Voador inverso (`0602`) |
| cable crossover | Crossover |
| lat pulldown | Puxada frontal; reverse grip → Puxada supinada |
| straight-arm pulldown | Pulldown |
| seated cable row (low pulley) | Remada baixa; V handle → "com triângulo" |
| one-arm dumbbell row | Remada serrote com halter (`0292`) |
| T-bar row | Remada cavalinho |
| pull-up / chin-up | Barra fixa / Barra fixa supinada |
| back squat | Agachamento livre com barra (`0043`) |
| Bulgarian / rear-foot-elevated split squat | Agachamento búlgaro |
| lunge / walking lunge / split squat | Afundo / Passada / Afundo estático |
| leg press 45°, hack squat (máquina) | Leg press 45°, Hack |
| leg extension / lying leg curl / seated leg curl | Cadeira extensora / Mesa flexora / Cadeira flexora |
| hip abduction / adduction (máquina) | Cadeira abdutora / adutora |
| deadlift / RDL / stiff-leg | Levantamento terra / Levantamento terra romeno / Stiff |
| trap bar | barra hexagonal |
| hip thrust / glute bridge | Elevação pélvica / Ponte de glúteos |
| calf raise | Panturrilha em pé / sentado; no leg press |
| shoulder press / military press | Desenvolvimento / Desenvolvimento militar |
| shrug | Encolhimento |
| upright row | Remada alta (por isso "high row" de máquina virou Puxada articulada, `0581`) |
| curl / preacher / hammer / concentration | Rosca direta / Scott / martelo / concentrada |
| EZ / SZ bar | barra W |
| triceps pushdown | Tríceps pulley (com barra / corda / barra V / barra W) |
| skull crusher | Tríceps testa |
| overhead triceps extension | Tríceps francês |
| triceps kickback | Tríceps coice |
| dips / rings | Mergulho / argolas |
| crunch / plank / Russian twist / ab wheel | Abdominal / Prancha / Giro russo / Abdominal com rodinha |
| wall sit | Cadeirinha |
| good morning | Bom dia |
| clean and jerk / snatch | Arremesso / Arranco (terminologia do LPO) |
| rowing machine / stair machine | Remo ergômetro / Simulador de escada |
| Qualificadores | com barra · com halteres (unilateral: com halter) · no cabo · na máquina · no Smith · com kettlebell · com elástico |

Grafia: primeira palavra maiúscula, o resto minúsculo, exceto nomes próprios (Scott, Smith, Arnold, Pendlay,
Zercher), siglas/letras de forma (W, V, JM) e "45°". O app mostra os nomes pt-BR em caixa de frase
(maiúscula só na primeira letra, posta pelo código), então os nomes da padronização automática podem ficar
em minúsculas no arquivo.

## 4. Observações para a decisão do dono

1. **Caixa de frase (decidido).** O GYM 12 mostra os nomes pt-BR com maiúscula só na primeira letra, posta pelo
   código (o `capitalize` do CSS sai para pt-BR). Nomes que só mudavam a maiúscula inicial não entram na
   sobreposição; nomes próprios e letras de forma em minúscula no meio do nome entram (§5, regras R7 e R8).
2. **Qualificadores no catálogo inteiro (feito).** "faixa elástica", "na máquina Smith", "barra EZ", "anéis" e
   "polia" foram padronizados nos 5.632 nomes (§5).
3. **"Flexão de braços" (plural) foi mantido**, como nos outros 83 nomes do catálogo; a busca por
   "flexão de braço" também acha o plural.
4. **Duplicatas reais mantidas**: `0576`/`0577` ("supino na máquina", mesmo nome também em inglês); `0241` virou
   "Tríceps pulley com barra V" e `2249` (mesmo movimento) ficou com o nome original, para não repetir.
5. **Escolhas com alguma dúvida**: `0581` Puxada articulada na máquina (iso-lateral high row);
   `0602` Voador inverso (o glossário pedia "Crucifixo inverso"; "voador inverso" é o nome de academia para a
   máquina; o crucifixo inverso ficou para os halteres); `0237`/`0238` Pulldown (braços estendidos);
   `0044` Bom dia com barra (muita academia fala "good morning"; a busca acha pelo inglês);
   `3220` astride jumps mantido (não é certo que seja polichinelo).

## 5. Padronização automática

Script em Python sobre os 5.632 nomes de `catalogue/i18n/pt-BR.json`. Cada regra é um troca por expressão
regular, na ordem abaixo; um nome pode cair em mais de uma. O resultado entra na seção 2 do arquivo de
sobreposição, sem os ids que já têm nome manual.

| Regra | O que faz | Nomes afetados |
|---|---|---|
| R1 | "faixa elástica" → "elástico" ("com", "e", "por", "de" ficam iguais; "com faixa em x" e "com faixa para" do dead bug também). Não mexe em "cama elástica" (trampolim), na faixa de alongamento (`1599`) nem na "técnica de faixa suspensa" (`3184`–`3188`, nome de técnica) | 437 |
| R2 | "na máquina Smith" → "no Smith" | 66 |
| R3 | "barra EZ" e "barra sz" → "barra W" | 52 |
| R4 | "nos anéis" → "nas argolas" | 23 |
| R5 | "na polia alta" → "no cabo alto", "na polia" → "no cabo". **Termo global: cabo** (438 nomes do catálogo e toda a revisão manual; "polia" tinha 8) | 8 |
| R6 | "tríceps pulley … no cabo" → sem "no cabo" (pulley já é a polia) | 7 |
| R7 | nomes próprios com maiúscula: Smith, Scott, Arnold, Zercher, Zottman, Jefferson, Svend, Larsen, Tate, Kroc, Frankenstein, Bradford, Pendlay; sigla JM | 111 |
| R8 | letra que descreve forma em maiúscula depois de "em", "barra", "para", "superman" (em V, em Y, em T, em W, em L, em X, barra V). Não mexe em "v. 2" (versão) | 50 |
| **Total** | nomes com pelo menos uma troca | **736** |

Ajuste depois da checagem de colisões: `2938` (band upper body resistance dead bug) ficaria igual a `3512`
("dead bug com elástico para parte superior do corpo"); virou **"dead bug com elástico nos braços"**.

Não padronizado, de propósito:
- **"avanço"** (67 nomes) ficou como está. É usado no Brasil ao lado de "afundo"; trocar criaria pares iguais
  com nomes "afundo" já existentes (ex.: "avanço com halteres" × "afundo com halteres").
- **"Flexão de braços"** no plural (ver §4).

15 exemplos:

| id | antes | depois | regra |
|---|---|---|---|
| 1050 | elevação de panturrilha no smith (com bloco) | elevação de panturrilha no Smith (com bloco) | R7 |
| 1224 | desenvolvimento de ombros em pé no smith | desenvolvimento de ombros em pé no Smith | R7 |
| 1308 | supino pegada aberta na máquina Smith | supino pegada aberta no Smith | R2 |
| 1506 | rosca pegada fechada com barra EZ e faixa elástica | rosca pegada fechada com barra W e elástico | R1, R3 |
| 2753 | agachamento completo com kettlebell e faixa elástica a partir do déficit | agachamento completo com kettlebell e elástico a partir do déficit | R1 |
| 4841 | levantamento terra assistido por faixa elástica com barra | levantamento terra assistido por elástico com barra | R1 |
| 1344 | remada curvada com barra EZ, pegada pronada | remada curvada com barra W, pegada pronada | R3 |
| 4979 | rollout nos anéis | rollout nas argolas | R4 |
| 1724 | extensão de tríceps acima da cabeça na polia alta com corda | extensão de tríceps acima da cabeça no cabo alto com corda | R5 |
| 1723 | tríceps pulley unilateral no cabo | tríceps pulley unilateral | R6 |
| 2406 | tríceps pulley com pegada supinada (barra sz) no cabo (com arm blaster) | tríceps pulley com pegada supinada (barra W) (com arm blaster) | R3, R6 |
| 1594 | agachamento frankenstein no smith | agachamento Frankenstein no Smith | R7 |
| 4157 | press tate sentado à frente e atrás com halteres | press Tate sentado à frente e atrás com halteres | R7 |
| 3403 | elevação em y em pé | elevação em Y em pé | R8 |
| 5048 | superman w para y | superman W para Y | R8 |

## 6. Validação

- Todo id da sobreposição existe em `catalogue/i18n/pt-BR.json` e no catálogo (`EXDB`).
- Nenhuma entrada repete o nome original.
- Nenhuma colisão nova no conjunto efetivo (5.632 nomes).
- Depois da sobreposição, sobram 0 ocorrências de "faixa elástica", "máquina Smith", "barra EZ", "anéis",
  "polia" (fora de "pulley"), "ginásio" e "haltere".
- O arquivo `.js` é importado no Node e bate com a lista gerada.

## 7. Tabela completa da revisão manual (363 exercícios)

"—" em *depois* = nome mantido na revisão manual (8 deles ainda recebem a padronização automática; ver §2).

| id | inglês | antes | depois |
|---|---|---|---|
| 0009 | assisted chest dip (kneeling) | mergulho para peito assistido (ajoelhado) | Mergulho assistido para peitoral (ajoelhado) |
| 0017 | assisted pull-up | barra fixa assistida | — |
| 0019 | assisted triceps dip (kneeling) | mergulho para tríceps assistido (ajoelhado) | Mergulho assistido para tríceps (ajoelhado) |
| 0025 | barbell bench press | supino com barra | Supino reto com barra |
| 0027 | barbell bent over row | remada curvada com barra | — |
| 0028 | barbell clean and press | clean and press com barra | — |
| 0030 | barbell close-grip bench press | supino pegada fechada com barra | — |
| 0031 | barbell curl | rosca direta com barra | — |
| 0032 | barbell deadlift | levantamento terra com barra | — |
| 0033 | barbell decline bench press | supino declinado com barra | — |
| 0038 | barbell drag curl | rosca drag com barra | — |
| 0041 | barbell front raise | elevação frontal com barra | — |
| 0042 | barbell front squat | agachamento frontal com barra | — |
| 0043 | barbell full squat | agachamento completo com barra | Agachamento livre com barra |
| 0044 | barbell good morning | good morning com barra | Bom dia com barra |
| 0046 | barbell hack squat | agachamento hack com barra | — |
| 0047 | barbell incline bench press | supino inclinado com barra | — |
| 0052 | barbell jm bench press | supino JM com barra | — |
| 0053 | barbell jump squat | agachamento com salto com barra | Agachamento saltado com barra |
| 0054 | barbell lunge | afundo com barra | — |
| 0060 | barbell lying triceps extension skull crusher | tríceps testa deitado com barra | Tríceps testa com barra |
| 0061 | barbell lying triceps extension | extensão de tríceps deitado com barra | — |
| 0065 | barbell one arm floor press | supino unilateral no chão com barra | — |
| 0067 | barbell one arm snatch | arranco unilateral com barra | — |
| 0069 | barbell overhead squat | agachamento com barra acima da cabeça | — |
| 0070 | barbell preacher curl | rosca scott com barra | — |
| 0074 | barbell rack pull | levantamento terra parcial com barra | — |
| 0078 | barbell rear lunge | afundo para trás com barra | Afundo reverso com barra |
| 0080 | barbell reverse curl | rosca inversa com barra | — |
| 0082 | barbell reverse wrist curl | rosca de punho invertida com barra | Rosca de punho inversa com barra |
| 0085 | barbell romanian deadlift | levantamento terra romeno com barra | — |
| 0088 | barbell seated calf raise | elevação de panturrilha sentado com barra | Panturrilha sentado com barra |
| 0091 | barbell seated overhead press | desenvolvimento sentado com barra | — |
| 0095 | barbell shrug | encolhimento de ombros com barra | Encolhimento com barra |
| 0099 | barbell single leg split squat | afundo estático unilateral com barra | Agachamento búlgaro com barra |
| 0116 | barbell straight leg deadlift | levantamento terra pernas estendidas com barra | — |
| 0117 | barbell sumo deadlift | levantamento terra sumô com barra | — |
| 0121 | barbell upright row v. 3 | remada alta com barra v. 3 | — |
| 0126 | barbell wrist curl | rosca de punho com barra | — |
| 0127 | barbell zercher squat | agachamento Zercher com barra | — |
| 0128 | battling ropes | corda naval | — |
| 0129 | bench dip (knees bent) | mergulho no banco (joelhos flexionados) | — |
| 0149 | cable alternate triceps extension | extensão de tríceps alternada no cabo | — |
| 0150 | cable bar lateral pulldown | puxada lateral com barra no cabo | Puxada frontal no cabo |
| 0151 | cable bench press | supino no cabo | — |
| 0155 | cable cross-over variation | crossover no cabo (variação) | Crossover |
| 0162 | cable front raise | elevação frontal no cabo | — |
| 0165 | cable hammer curl (with rope) | rosca martelo no cabo (com corda) | — |
| 0168 | cable hip adduction | adução de quadril no cabo | — |
| 0175 | cable kneeling crunch | abdominal ajoelhado no cabo | — |
| 0178 | cable lateral raise | elevação lateral no cabo | — |
| 0180 | cable low seated row | remada sentada baixa no cabo | Remada baixa no cabo |
| 0190 | cable one arm curl | rosca unilateral no cabo | — |
| 0192 | cable one arm lateral raise | elevação lateral unilateral no cabo | — |
| 0194 | cable overhead triceps extension (rope attachment) | extensão de tríceps acima da cabeça no cabo (com corda) | Tríceps francês no cabo com corda |
| 0196 | cable pull through (with rope) | pull-through no cabo (com corda) | — |
| 0198 | cable pulldown | puxada no cabo | Puxada frontal pegada aberta no cabo |
| 0200 | cable pushdown (with rope attachment) | tríceps pulley no cabo (com corda) | Tríceps pulley com corda |
| 0201 | cable pushdown | tríceps pulley no cabo | Tríceps pulley com barra |
| 0206 | cable reverse curl | rosca inversa no cabo | — |
| 0208 | cable reverse-grip straight back seated high row | remada alta sentada com costas retas e pegada supinada no cabo | Puxada supinada no cabo |
| 0218 | cable seated wide-grip row | remada sentada pegada aberta no cabo | — |
| 0220 | cable shrug | encolhimento de ombros no cabo | Encolhimento no cabo |
| 0233 | cable standing rear delt row (with rope) | remada para deltoide posterior em pé no cabo (com corda) | — |
| 0234 | cable standing row (v-bar) | remada em pé no cabo (barra v) | Remada em pé no cabo com triângulo |
| 0237 | cable straight arm pulldown (with rope) | puxada com braços retos no cabo (com corda) | Pulldown com corda no cabo |
| 0238 | cable straight arm pulldown | puxada com braços retos no cabo | Pulldown no cabo |
| 0241 | cable triceps pushdown (v-bar) | tríceps pulley no cabo (barra v) | Tríceps pulley com barra V |
| 0243 | cable twist | giro no cabo | — |
| 0246 | cable upright row | remada alta no cabo | — |
| 0251 | chest dip | mergulho para peitoral | — |
| 0259 | close-grip push-up | flexão de braços pegada fechada | — |
| 0262 | cross body crunch | abdominal cruzado | — |
| 0274 | crunch floor | abdominal no chão | Abdominal |
| 0276 | dead bug | inseto morto | Dead bug |
| 0277 | decline crunch | abdominal declinado | — |
| 0279 | decline push-up | flexão de braços declinada | — |
| 0283 | diamond push-up | flexão de braços diamante | — |
| 0289 | dumbbell bench press | supino reto com halteres | — |
| 0290 | dumbbell bench seated press | desenvolvimento sentado no banco com halteres | Desenvolvimento sentado com halteres |
| 0292 | dumbbell one arm bent-over row | Remada curvada unilateral com halter | Remada serrote com halter |
| 0293 | dumbbell bent over row | remada curvada com halteres | — |
| 0294 | dumbbell biceps curl | Rosca bíceps com halteres | Rosca direta com halteres |
| 0297 | dumbbell concentration curl | Rosca concentrada com halter | — |
| 0298 | dumbbell cross body hammer curl | Rosca martelo cruzada com halteres | — |
| 0300 | dumbbell deadlift | Levantamento terra com halteres | — |
| 0301 | dumbbell decline bench press | Supino declinado com halteres | — |
| 0308 | dumbbell fly | Crucifixo com halteres | — |
| 0310 | dumbbell front raise | Elevação frontal com halteres | — |
| 0312 | dumbbell hammer curl v. 2 | Rosca martelo com halteres v. 2 | — |
| 0313 | dumbbell hammer curl | Rosca martelo com halteres | — |
| 0314 | dumbbell incline bench press | Supino inclinado com halteres | — |
| 0318 | dumbbell incline curl | Rosca inclinada com halteres | — |
| 0319 | dumbbell incline fly | Crucifixo inclinado com halteres | — |
| 0327 | dumbbell incline row | Remada inclinada com halteres | — |
| 0334 | dumbbell lateral raise | Elevação lateral com halteres | — |
| 0336 | dumbbell lunge | Afundo com halteres | — |
| 0351 | dumbbell lying triceps extension | Extensão de tríceps deitado com halteres | Tríceps testa com halteres |
| 0362 | dumbbell one arm triceps extension (on bench) | Extensão de tríceps unilateral com halter (no banco) | Tríceps francês unilateral com halter |
| 0372 | dumbbell preacher curl | Rosca scott com halteres | — |
| 0375 | dumbbell pullover | Pullover com halteres | — |
| 0380 | dumbbell rear lateral raise | Elevação lateral posterior com halteres | Elevação lateral curvada com halteres |
| 0381 | dumbbell rear lunge | Afundo reverso com halteres | — |
| 0383 | dumbbell reverse fly | Crucifixo invertido com halteres | — |
| 0385 | dumbbell reverse wrist curl | Rosca de punho inversa com halteres | — |
| 0392 | dumbbell seated front raise | Elevação frontal sentado com halteres | — |
| 0396 | dumbbell seated lateral raise | Elevação lateral sentado com halteres | — |
| 0401 | dumbbell seated palms up wrist curl | rosca de punho sentado com halter, palmas para cima | Rosca de punho sentado com halter |
| 0402 | dumbbell seated preacher curl | rosca scott sentado com halter | — |
| 0403 | dumbbell seated revers grip concentration curl | rosca concentrada sentado com halter, pegada pronada | Rosca concentrada inversa com halter |
| 0404 | dumbbell seated shoulder press (parallel grip) | desenvolvimento de ombro sentado com halter (pegada paralela) | Desenvolvimento com halteres pegada neutra |
| 0405 | dumbbell seated shoulder press | desenvolvimento de ombro sentado com halter | Desenvolvimento com halteres |
| 0406 | dumbbell shrug | encolhimento de ombros com halter | Encolhimento com halteres |
| 0407 | dumbbell side bend | flexão lateral de tronco com halter | — |
| 0410 | dumbbell single leg split squat | agachamento búlgaro com halter | — |
| 0413 | dumbbell squat | agachamento com halter | Agachamento com halteres |
| 0417 | dumbbell standing calf raise | elevação de panturrilha em pé com halter | Panturrilha em pé com halteres |
| 0426 | dumbbell standing overhead press | desenvolvimento acima da cabeça em pé com halter | Desenvolvimento em pé com halteres |
| 0429 | dumbbell standing reverse curl | rosca em pé com halter, pegada pronada | Rosca inversa com halteres |
| 0430 | dumbbell standing triceps extension | extensão de tríceps em pé com halter | Tríceps francês em pé com halter |
| 0431 | dumbbell step-up | step up com halter | — |
| 0437 | dumbbell upright row | remada alta com halter | Remada alta com halteres |
| 0439 | dumbbell zottman curl | rosca zottman com halter | — |
| 0443 | elbow-to-knee | cotovelo no joelho | — |
| 0447 | ez barbell curl | rosca direta com barra EZ | Rosca direta com barra W |
| 0459 | flutter kicks | tesoura de pernas | — |
| 0463 | front plank | prancha frontal | Prancha |
| 0471 | handstand push-up | flexão de braços em parada de mãos | — |
| 0472 | hanging leg raise | elevação de pernas na barra fixa | — |
| 0493 | incline push-up | flexão de braços inclinada | — |
| 0499 | inverted row | remada invertida | — |
| 0507 | jackknife sit-up | abdominal canivete | — |
| 0514 | jump squat | agachamento com salto | — |
| 0521 | kettlebell alternating renegade row | remada renegade alternada com kettlebell | Remada renegada alternada com kettlebell |
| 0528 | kettlebell double push press | push press com kettlebell duplo | Push press com dois kettlebells |
| 0529 | kettlebell double snatch | arranco com kettlebell duplo | Arranco com dois kettlebells |
| 0534 | kettlebell goblet squat | agachamento goblet com kettlebell | — |
| 0535 | kettlebell hang clean | clean suspenso com kettlebell | Hang clean com kettlebell |
| 0544 | kettlebell pistol squat | agachamento pistol com kettlebell | — |
| 0548 | kettlebell sumo high pull | puxada alta sumô com kettlebell | Remada alta sumô com kettlebell |
| 0549 | kettlebell swing | swing com kettlebell | Kettlebell swing |
| 0550 | kettlebell thruster | thruster com kettlebell | — |
| 0551 | kettlebell turkish get up (squat style) | levantamento turco com kettlebell (estilo agachamento) | — |
| 0562 | landmine 180 | landmine 180° | — |
| 0564 | lateral box jump | salto lateral na caixa | — |
| 0571 | lever alternating narrow grip seated row | remada sentada pegada fechada alternada (máquina) | Remada alternada fechada na máquina |
| 0572 | lever assisted chin-up | barra fixa assistida com pegada supinada (máquina) | Barra fixa supinada assistida na máquina |
| 0573 | lever back extension | extensão lombar (máquina) | Extensão lombar na máquina |
| 0575 | lever bicep curl | rosca bíceps (máquina) | — |
| 0576 | lever chest press | supino na máquina | — |
| 0577 | lever chest press | supino na máquina | — |
| 0579 | lever front pulldown | puxada frontal na máquina | — |
| 0581 | lever high row | remada alta na máquina | Puxada articulada na máquina |
| 0584 | lever lateral raise | elevação lateral na máquina | — |
| 0585 | lever leg extension | cadeira extensora (máquina) | Cadeira extensora |
| 0586 | lever lying leg curl | mesa flexora deitada (máquina) | Mesa flexora |
| 0587 | lever military press | press militar na máquina | Desenvolvimento militar na máquina |
| 0592 | lever preacher curl | rosca scott na máquina | — |
| 0593 | lever reverse hyperextension | hiperextensão reversa na máquina | — |
| 0594 | lever seated calf raise | panturrilha sentada na máquina | Panturrilha sentado na máquina |
| 0596 | lever seated fly | crucifixo sentado na máquina | Crucifixo na máquina |
| 0597 | lever seated hip abduction | abdução de quadril sentado na máquina | Cadeira abdutora |
| 0598 | lever seated hip adduction | adução de quadril sentado na máquina | Cadeira adutora |
| 0599 | lever seated leg curl | cadeira flexora (máquina) | Cadeira flexora |
| 0602 | lever seated reverse fly | crucifixo invertido sentado na máquina | Voador inverso |
| 0604 | lever shrug | encolhimento na máquina | — |
| 0605 | lever standing calf raise | panturrilha em pé na máquina | — |
| 0606 | lever t bar row | remada cavalinho na máquina | — |
| 0607 | lever triceps extension | extensão de tríceps na máquina | — |
| 0620 | lying leg raise flat bench | elevação de pernas deitado no banco reto | — |
| 0624 | march sit (wall) | marcha sentada na parede | Cadeirinha com marcha |
| 0630 | mountain climber | escalador | — |
| 0631 | muscle up | muscle up | — |
| 0635 | oblique crunches floor | abdominal oblíquo no chão | — |
| 0648 | power clean | power clean | — |
| 0652 | pull-up | barra fixa | — |
| 0659 | push-up (wall) | flexão de braços na parede | — |
| 0662 | push-up | flexão de braços | — |
| 0677 | ring dips | mergulho nos anéis | Mergulho nas argolas |
| 0687 | russian twist | torção russa | Giro russo |
| 0688 | scapular pull-up | barra fixa escapular | — |
| 0708 | side crunch | abdominal lateral | — |
| 0715 | side plank | prancha lateral | — |
| 0726 | single leg bridge | ponte unilateral | Ponte de glúteos unilateral |
| 0736 | sit up | abdominal completo | — |
| 0738 | sled 45° calf press | press de panturrilha 45 graus no sled | Panturrilha no leg press 45° |
| 0739 | sled 45° leg press | leg press 45 graus no sled | Leg press 45° |
| 0743 | sled hack squat | hack squat no sled | Agachamento hack |
| 0748 | smith bench press | supino na máquina Smith | Supino no Smith |
| 0752 | smith deadlift | levantamento terra na máquina Smith | Levantamento terra no Smith |
| 0753 | smith decline bench press | supino declinado na máquina Smith | Supino declinado no Smith |
| 0757 | smith incline bench press | supino inclinado na máquina Smith | Supino inclinado no Smith |
| 0766 | smith shoulder press | desenvolvimento de ombro na máquina Smith | Desenvolvimento no Smith |
| 0767 | smith shrug | encolhimento de ombros na máquina Smith | Encolhimento no Smith |
| 0770 | smith squat | agachamento na máquina Smith | Agachamento no Smith |
| 0776 | snatch pull | puxada de arranco | — |
| 0788 | standing behind neck press | desenvolvimento por trás da nuca em pé | — |
| 0803 | superman push-up | flexão de braços superman | — |
| 0809 | suspended split squat | afundo suspenso | Agachamento búlgaro suspenso |
| 0811 | trap bar deadlift | levantamento terra com trap bar | Levantamento terra com barra hexagonal |
| 0814 | triceps dip | mergulho para tríceps | — |
| 0815 | triceps dips floor | mergulho para tríceps no chão | — |
| 0826 | vertical leg raise (on parallel bars) | elevação de pernas vertical (nas paralelas) | Elevação de pernas nas paralelas |
| 0830 | weighted bench dip | mergulho no banco com peso | — |
| 0832 | weighted crunch | abdominal com peso | — |
| 0834 | weighted front raise | elevação frontal com peso | — |
| 0851 | weighted sissy squat | agachamento sissy com peso | — |
| 0857 | wheel rollerout | rolamento com roda abdominal | Abdominal com rodinha |
| 0858 | wind sprints | tiros de velocidade | — |
| 0860 | cable kickback | kickback de tríceps no cabo | Tríceps coice no cabo |
| 0861 | cable seated row | remada sentada no cabo | — |
| 0865 | lying leg-hip raise | elevação de pernas e quadril deitado | — |
| 0867 | reverse plank | prancha reversa | — |
| 0868 | cable curl | rosca no cabo | — |
| 0872 | reverse crunch | abdominal reverso | — |
| 0905 | band kneeling pulldown | puxada ajoelhado com faixa elástica | Puxada ajoelhado com elástico |
| 0970 | band assisted pull-up | barra fixa assistida com faixa elástica | Barra fixa assistida com elástico |
| 0972 | band bicycle crunch | abdominal bicicleta com faixa elástica | Abdominal bicicleta com elástico |
| 0977 | band front lateral raise | elevação lateral frontal com faixa elástica | Elevação lateral frontal com elástico |
| 0978 | band front raise | elevação frontal com faixa elástica | Elevação frontal com elástico |
| 0979 | band horizontal pallof press | pallof press horizontal com faixa elástica | Pallof press com elástico |
| 0983 | band kneeling one arm pulldown | puxada unilateral ajoelhado com faixa elástica | Puxada unilateral ajoelhado com elástico |
| 1003 | band squat row | agachamento com remada e faixa elástica | Agachamento com remada no elástico |
| 1004 | band squat | agachamento com faixa elástica | Agachamento com elástico |
| 1030 | lever pec deck fly | crucifixo peck deck na máquina | Voador |
| 1060 | barbell hip thrust | elevação pélvica com barra | — |
| 1160 | burpee | burpee | — |
| 1161 | rowing (with rowing machine) | remada (na máquina de remo) | Remo ergômetro |
| 1162 | barbell standing military press | desenvolvimento militar em pé com barra | — |
| 1164 | smith calf raise v. 2 | elevação de panturrilha no smith v. 2 | Panturrilha em pé no Smith |
| 1165 | barbell standing military press (without rack) | desenvolvimento militar em pé com barra (sem rack) | — |
| 1182 | push up (on knees) | flexão de braço (de joelhos) | Flexão de braços de joelhos |
| 1206 | cable pull through | pull through no cabo | Pull-through no cabo |
| 1246 | hollow hold | hollow hold | — |
| 1258 | barbell wide reverse grip bench press | supino pegada aberta supinada com barra | — |
| 1269 | cable standing up straight crossovers | crossover em pé ereto no cabo | Crossover em pé |
| 1273 | clap push up | flexão de braços com palma | Flexão de braços com batida de palmas |
| 1299 | lever incline chest press | supino inclinado na máquina | — |
| 1323 | cable rope seated row | remada sentada com corda no cabo | — |
| 1326 | chin-up | barra fixa pegada supinada | Barra fixa supinada |
| 1350 | lever seated row | remada sentada na máquina | — |
| 1359 | smith bent over row | remada curvada na máquina Smith | Remada curvada no Smith |
| 1372 | barbell standing calf raise | elevação de panturrilha em pé com barra | Panturrilha em pé com barra |
| 1391 | sled calf press on leg press | press de panturrilha no leg press (sled) | Panturrilha no leg press |
| 1409 | barbell glute bridge | ponte de glúteos com barra | — |
| 1410 | barbell lateral lunge | afundo lateral com barra | — |
| 1426 | smith seated wrist curl | rosca de punho sentado na máquina Smith | Rosca de punho sentado no Smith |
| 1429 | wide grip pull-up | barra fixa pegada aberta | — |
| 1451 | lever seated dip | mergulho sentado na máquina | — |
| 1452 | lever seated crunch | abdominal sentado na máquina | Abdominal na máquina |
| 1454 | lever seated shoulder press | desenvolvimento de ombros sentado na máquina | Desenvolvimento sentado na máquina |
| 1457 | barbell standing wide military press | desenvolvimento militar em pé pegada aberta com barra | — |
| 1459 | dumbbell romanian deadlift | Levantamento terra romeno com halteres | — |
| 1460 | walking lunge | afundo caminhando | Passada |
| 1489 | sissy squat | agachamento sissy | — |
| 1494 | butterfly yoga pose | postura da borboleta | — |
| 1495 | oblique crunch v. 2 | abdominal oblíquo v. 2 | — |
| 1520 | barbell hang clean | hang clean com barra | — |
| 1522 | barbell hang snatch | hang snatch com barra | — |
| 1530 | barbell power snatch | power snatch com barra | — |
| 1538 | barbell split jerk | split jerk com barra | — |
| 1543 | barbell stiff legged deadlift | stiff com barra | — |
| 1597 | smith stiff legged deadlift | stiff no smith | — |
| 1605 | cable triceps pushdown (sz bar) | extensão de tríceps no cabo (barra W) | Tríceps pulley com barra W |
| 1636 | cable overhead curl | rosca acima da cabeça no cabo | — |
| 1675 | dumbbell reverse spider curl | Rosca aranha inversa com halteres | — |
| 1700 | dumbbell push press | Push press com halteres | — |
| 1755 | weighted tricep dips | mergulho para tríceps com peso | — |
| 1757 | dumbbell single leg deadlift | levantamento terra unilateral com halter | — |
| 1759 | single leg squat (pistol) male | agachamento unilateral (pistol) masculino | — |
| 1760 | dumbbell goblet squat | Agachamento goblet com halter | — |
| 1860 | hyperextension v. 2 | hiperextensão v. 2 | — |
| 2071 | single leg hip thrusts | hip thrust unilateral | Elevação pélvica unilateral |
| 2133 | farmers walk | caminhada do fazendeiro | — |
| 2137 | dumbbell arnold press | desenvolvimento arnold com halteres | — |
| 2141 | walk elliptical cross trainer | caminhada no elíptico | — |
| 2143 | dumbbell standing around world | elevação circular de ombros em pé com halter | — |
| 2163 | resistance band reverse hyperextension | hiperextensão reversa com faixa elástica | Hiperextensão reversa com elástico |
| 2249 | cable triceps pushdown (v bar) | extensão de tríceps no cabo (barra v) | — |
| 2258 | walking | caminhada | — |
| 2267 | lever seated leg press | leg press sentado na máquina | — |
| 2271 | left hook. boxing | gancho de esquerda (boxe) | — |
| 2285 | lever pullover | pullover na máquina | — |
| 2290 | dumbbell bulgarian split squat | agachamento búlgaro com halteres | — |
| 2311 | walking on stepmill | caminhada no stepmill | Simulador de escada |
| 2315 | lever rotary calf | panturrilha rotativa na máquina | — |
| 2330 | cable lat pulldown full range of motion | puxada frontal com amplitude total no cabo | — |
| 2331 | cycle cross trainer | cross trainer (elíptico) | — |
| 2335 | lever seated calf press | panturrilha sentada na máquina (leg press) | Panturrilha no leg press sentado |
| 2393 | dumbbell one arm bent over row | remada curvada unilateral com halter | — |
| 2461 | side lying clam | clam deitado de lado | — |
| 2611 | lever horizontal one leg press | leg press horizontal unilateral na máquina | — |
| 2612 | jump rope | pular corda | — |
| 2661 | cable seated row with v bar | remada sentada no cabo com barra v | Remada baixa com triângulo no cabo |
| 2921 | pike push up | flexão pike | — |
| 2960 | dumbbell split squat | agachamento afundo com halteres | — |
| 2980 | dumbbell renegade row | remada renegada com halteres | — |
| 3017 | barbell pendlay row | remada Pendlay com barra | — |
| 3091 | high knee skips | skip com joelhos altos | — |
| 3142 | smith sumo squat | agachamento sumô na máquina Smith | Agachamento sumô no Smith |
| 3193 | glute-ham raise | elevação glúteo-femoral | — |
| 3211 | kneeling push-up (male) | flexão de braços ajoelhada (masculino) | — |
| 3220 | astride jumps (male) | salto com pernas afastadas (masculino) | — |
| 3232 | cable standing rear delt horizontal row (with rope) | remada horizontal para deltoide posterior em pé no cabo (com corda) | — |
| 3293 | archer pull up | barra fixa arqueiro | — |
| 3302 | handstand | parada de mãos | — |
| 3304 | skin the cat | skin the cat | — |
| 3305 | barbell thruster | thruster com barra | — |
| 3323 | kettlebell half turkish get up | meio turkish get up com kettlebell | Meio levantamento turco com kettlebell |
| 3335 | dumbbell glute bridge | ponte de glúteos com halter | — |
| 3360 | bear crawl | caminhada do urso | — |
| 3366 | shrimp squat | agachamento shrimp | — |
| 3436 | superman | superman | — |
| 3543 | bodyweight drop jump squat | agachamento com salto em drop peso corporal | Agachamento drop com salto |
| 3561 | glute bridge march | ponte de glúteo com marcha | Ponte de glúteos com marcha |
| 3593 | barbell squat | agachamento com barra | — |
| 3622 | v up | v up | — |
| 3650 | jump box | salto na caixa | — |
| 3655 | walking high knees lunge | afundo caminhando com joelhos altos | Passada com elevação de joelho |
| 3663 | reverse plank with leg lift | prancha reversa com elevação de perna | — |
| 3666 | walking on incline treadmill | caminhada em esteira inclinada | Caminhada na esteira inclinada |
| 3780 | band standing chest press | supino em pé com faixa elástica | Supino em pé com elástico |
| 3824 | pseudo planche push up | flexão pseudo planche | — |
| 3888 | dumbbell one arm snatch | Arranco unilateral com halter | — |
| 3890 | hanging knees to elbows | elevação de joelhos até os cotovelos na barra fixa | — |
| 3891 | hanging toes to bar | elevação de pés até a barra | — |
| 3893 | assault bike run | corrida na assault bike | — |
| 4214 | lever low row (plate loaded) | remada baixa na máquina (com anilhas) | Remada baixa articulada |
| 4287 | knee raise | elevação de joelho | — |
| 4347 | lever standing leg curl | flexão de perna em pé na máquina | Flexora em pé |
| 4568 | resistance band pull apart | abertura com faixa elástica | Abertura com elástico |
| 4770 | inverted wide row | remada invertida pegada aberta | — |
| 4838 | cable unilateral bicep curl | rosca bíceps unilateral no cabo | — |
| 4962 | barbell box squat | agachamento no caixote com barra | — |
| 4966 | press under | press por baixo | — |
| 4978 | ring kneeling ab rollout | rollout abdominal ajoelhado nos anéis | Rollout abdominal ajoelhado nas argolas |
| 4982 | negative dragon flag | bandeira de dragão negativa | Dragon flag negativo |
| 5035 | weighted hyperextension | hiperextensão com peso | — |
| 5052 | single leg calf raise off step | panturrilha unilateral fora do degrau | Panturrilha unilateral no degrau |
| 5090 | cable standing row | remada em pé no cabo | — |
| 5122 | barbell clean and jerk | arremesso e jerk com barra | Arremesso com barra |
| 5179 | cable standing close grip row | remada em pé pegada fechada no cabo | — |
| 5198 | single straight leg glute bridge hold | sustentação em ponte de glúteo com uma perna estendida | Ponte de glúteos unilateral isométrica |
| 5201 | dumbbell waiter biceps curl | rosca bíceps garçom com halter | Rosca garçom com halter |
| 5607 | band face pull | face pull com faixa elástica | Face pull com elástico |
| 5702 | barbell deadlift from deficit | levantamento terra com déficit e barra | Levantamento terra com déficit |
| 5873 | ez barbell lying triceps extension | tríceps testa deitado com barra EZ | Tríceps testa com barra W |
| 6211 | bicycle crunch | abdominal bicicleta | — |
| 6392 | cable lateral pulldown with mag grip | puxada lateral no cabo com pegada mag | Puxada frontal com pegada MAG no cabo |
| 6545 | handstand hold on wall | parada de mão na parede | Parada de mãos na parede |
| 7108 | lever seated leg extension v. 3 | cadeira extensora sentado na máquina v. 3 | Cadeira extensora v. 3 |
| 7385 | pull up (negative) | barra fixa (negativa) | — |
| 7564 | cable split stance single arm row | remada unilateral com base dividida no cabo | — |
| 7589 | cable kneeling glute kickback | coice de glúteo ajoelhado no cabo | — |
| 7744 | cable standing supinated face pull (with rope) | face pull supinado em pé no cabo (com corda) | Face pull supinado no cabo |
| 7746 | nordic hamstring curl | flexão nórdica de posterior de coxa | Flexão nórdica |
| 8194 | lying knee raise | elevação de joelhos deitado | — |
| 8365 | resistance band pass through | passagem acima da cabeça com faixa elástica | Passagem acima da cabeça com elástico |
| 8882 | neutral wrist roller | rolo de punho pegada neutra | — |
| 9819 | hanging knee raise | elevação de joelhos na barra fixa | — |
| 10065 | lever torso rotation | rotação de tronco na máquina | — |
| 10503 | cable reverse narrow grip lat pulldown | puxada alta pegada fechada inversa no cabo | Puxada supinada pegada fechada no cabo |
| 10780 | lying neck flexion | flexão de pescoço deitado | — |
