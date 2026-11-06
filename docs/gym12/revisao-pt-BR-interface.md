# Revisão pt-BR da interface (GYM 12)

Data: 05/11/2026. Arquivo gerado: `frontend/src/gym12/locales/pt-BR.ui.js` (só as chaves que mudaram, em ordem alfabética).
Nada foi alterado em `frontend/src/locales/pt.js` nem em `frontend/src/locales/pt-BR.js`.

## Números

| | Quantidade |
|---|---|
| Chaves visíveis em pt-BR (`{ ...pt, ...PT_BR_OVERRIDES }`) | 3615 |
| Revisadas (todas fora das áreas ocultas) | 2902 (1124 herdadas do pt-PT + 1778 sobrescritas BR) |
| Alteradas | 388 (147 herdadas do pt-PT + 241 sobrescritas BR) |
| Mantidas como estavam | 2514 |
| Não revisadas (ocultas no GYM 12) | 713 |

"Ocultas no GYM 12" = chaves usadas **só** em telas de Treinador IA/Coach, admin, login/senha/chaves de acesso, servidor e sincronização,
integrações, Garmin, Zepp, Apple Saúde/Health Connect e frequência cardíaca ao vivo
(`views/CoachChat`, `lib/coach*`, `views/CoachIntake`, `views/CoachSetup`, `components/CoachConsentSheet`,
`components/WorkoutCoachSheet`, `views/Admin*`, `components/PasswordAuth`, `components/Passkeys`, `components/ServerSync`,
`views/Integrations`, `lib/integrations`, `views/Login`, `components/LostAccess`, `components/DeleteAccount`,
`views/ZeppSettings`, `lib/garmin*`, `lib/health-*`, `lib/sync-*`, `components/SyncBanner`, `lib/api.js`, `lib/media-sync`,
`components/LiveHeartRate`, `lib/heart-rate`). Mesmo assim, a checagem de termos de Portugal abaixo cobre as 3.615 chaves.

Observação: o texto pt-BR que já existia estava, em geral, em bom português do Brasil (o `pt.js` herdado é quase todo neutro).
As mudanças são sobretudo de **terminologia de academia e consistência** (Ajustes, treino, carga, rodízio, agenda, drop-set,
séries efetivas, posteriores de coxa…) e alguns restos de Portugal (ex.: "Gémeo esquerdo", "Ancas", "O peso que registas",
"Guardar cartão", "A verificar…", "Introduz", "edita-as", "Tens a versão", "Predefinido", "supersérie").

## Glossário aplicado

| Inglês | pt-BR no GYM 12 | Observação |
|---|---|---|
| Settings (a área do app) | **Ajustes** | "configurações do celular" continua quando é o sistema do telefone |
| Workout / session | **treino** | "sessão" só ficou para login ("encerrar a sessão") e uma piada de Natal |
| Set / sets | série / séries | |
| Work set | série de trabalho | |
| Hard set | **série efetiva** | antes "série dura" |
| Weight (o que se levanta na série) | **carga** | "peso" fica para peso corporal, unidade de peso, peso da barra/halter |
| Body weight | peso corporal | |
| Reps | repetições / reps | "reps" em rótulos curtos |
| Rest / rest timer | descanso / **cronômetro de descanso** | antes "temporizador"/"timer" |
| Warm-up / ramp sets | aquecimento / séries de aproximação | "Padrão" no lugar de "Predefinido" |
| Failure | falha | |
| Drop set / drops | **drop-set** / drops | antes "série decrescente"/"quedas" |
| Rest-pause burst | **mini-série** | antes "rajada" |
| Back-off sets | séries de back-off | antes "séries descendentes" |
| Superset | **bi-set** | 2026-11-06: decisão do dono, "Bi-set" no início da frase e "bi-set" no meio, em todo o pt-BR (antes "superset", mantido porque o app permite 3+ exercícios) |
| PR / new best | recorde / recorde pessoal | |
| Routine | rotina | |
| Plan | plano | |
| Schedule | **Agenda** (agenda semanal) | antes "Horário" |
| Rotation / loop | **rodízio** | antes "rotação"/"ciclo"; uma passagem pelo rodízio = "volta" |
| Programme | programa | |
| Starter plan(s) / starter programmes | **Modelos de divisão (exemplo)** | título do seletor, botões de entrada e seção de Programas |
| Badge | medalha | antes misturava "emblema" e "medalha" |
| Gym membership code/card | código/carteirinha da academia | antes "código de sócio" |
| Tap / press | tocar / toque | "Pressione voltar" virou "Toque em voltar" |
| App / application | app | "aplicativo" trocado por "app" nas telas visíveis |
| Home screen (do celular) | tela de início | exceto o caminho literal do menu do Chrome ("Adicionar à tela inicial") |
| Start / Finish | Começar / Terminar | antes misturava Iniciar/Finalizar |
| Hamstrings / traps / upper back | posteriores de coxa / trapézio / parte alta das costas | |
| Hips / calf (medidas) | quadril / panturrilha | antes "Ancas", "Gémeo" |
| Leverage machine / weight plate / suspension trainer | máquina articulada / anilha / fita de suspensão | |
| Machine weight stack | placas da máquina | |
| openGym (nos valores alterados) | GYM 12 | o resto é trocado automaticamente pela camada de tradução |

## Todas as mudanças, por tema

### Modelos de divisão (exemplo) (12)

| chave (inglês) | antes | depois |
|---|---|---|
| Choose starter plan | Escolha um plano inicial | Modelos de divisão (exemplo) |
| Load plan | Carregar plano | Carregar modelo |
| Load starter plan | Carregar plano inicial | Modelos de divisão (exemplo) |
| Make one, or grab the starter plan to get going. | Crie uma, ou pegue o plano inicial para começar. | Crie uma, ou use um modelo de divisão (exemplo) para começar. |
| No programmes yet. Make one from your plan, or grab a starter below. | Ainda não tem programas. Crie um a partir do seu plano ou escolha um inicial abaixo. | Ainda não tem programas. Crie um a partir do seu plano ou escolha um dos modelos abaixo. |
| Programmes, starter plans and sharing a plan with a friend live behind this button. | Programas, planos iniciais e compartilhar um plano com um amigo ficam atrás deste botão. | Programas, modelos de divisão (exemplo) e compartilhar um plano com um amigo ficam neste botão. |
| Push, pull and legs each get their own day. | Empurrar, puxar e pernas, cada um no seu dia. | Peito/ombro/tríceps, costas/bíceps e pernas, cada um no seu dia. |
| Schedule says when, Routines says what. Build your own or grab a starter plan. | Horário diz quando, Rotinas diz o quê. Crie as suas ou pegue um plano inicial. | A Agenda diz quando, as Rotinas dizem o quê. Monte as suas ou use um modelo de divisão (exemplo). |
| Set up your weekly routine to get going, or grab a ready-made starter plan. | Configure sua rotina semanal para começar, ou pegue um plano inicial já pronto. | Monte sua rotina semanal para começar, ou use um dos modelos de divisão (exemplo). |
| Starter programmes | Programas iniciais | Modelos de divisão (exemplo) |
| Upper body twice, lower body twice. | Tronco superior duas vezes, inferior duas vezes. | Parte de cima duas vezes, parte de baixo duas vezes. |
| Your routines as a block of weeks, with starter programmes to try. | Suas rotinas como um bloco de semanas, com programas iniciais para experimentar. | Suas rotinas como um bloco de semanas, com modelos de divisão (exemplo) para experimentar. |

### Ajustes (nome da área e telas de ajustes) (28)

| chave (inglês) | antes | depois |
|---|---|---|
| {0} set brings an {1} with it. Switch on Effort per set in Settings to see it. | {0} série traz um {1} junto. Ative “Esforço por série” nas Configurações para ver. | {0} série traz um {1} junto. Ative “Esforço por série” nos Ajustes para ver. |
| {0} sets bring an {1} with them. Switch on Effort per set in Settings to see it. | {0} séries trazem um {1} junto. Ative “Esforço por série” nas Configurações para ver. | {0} séries trazem um {1} junto. Ative “Esforço por série” nos Ajustes para ver. |
| Added before your work sets. They count in your volume (Settings), but stay out of records and progression. Each one closes half the gap to the work weight, never below the bar on a barbell lift, and you can still change any of them mid-session. | Entram antes das suas séries de trabalho. Contam no seu volume (Ajustes), mas ficam de fora dos recordes e da progressão. Cada uma fecha metade da distância até o peso de trabalho, nunca abaixo da barra vazia em um exercício com barra, e você ainda pode mudar qualquer uma no meio do treino. | Entram antes das suas séries de trabalho. Contam no seu volume (Ajustes), mas ficam de fora dos recordes e da progressão. Cada uma fecha metade da distância até a carga de trabalho, nunca abaixo da barra vazia em um exercício com barra, e você ainda pode mudar qualquer uma no meio do treino. |
| All settings | Todas as configurações | Todos os ajustes |
| Built from your work weight and rounded to this gym’s plates and dumbbells. An exercise can pick its own in its settings. | Calculados a partir do peso de trabalho e arredondados às anilhas e halteres desta academia. Cada exercício pode escolher os seus nas configurações. | Calculados a partir da carga de trabalho e arredondados às anilhas e halteres desta academia. Cada exercício pode escolher os seus nos ajustes dele. |
| Camera permission is needed to scan. Enable it in Settings. | É necessária a permissão da câmera para escanear. Ative-a nos Ajustes. | É preciso permitir a câmera para escanear. Ative nas configurações do celular. |
| Change it anytime in Settings → Modules. | Mude quando quiser em Configurações → Módulos. | Mude quando quiser em Ajustes → Módulos. |
| Copy this exercise’s warm-up sets, and the rest and note from its Exercise settings, into the routine. A note added for today stays with this workout. Your workout history is kept. | Copia para a rotina as séries de aquecimento deste exercício, e o descanso e a anotação das Configurações do exercício dele. Uma anotação adicionada para hoje fica com este treino. Seu histórico de treinos é mantido. | Copia para a rotina as séries de aquecimento deste exercício, e o descanso e a anotação dos Ajustes do exercício. Uma anotação adicionada para hoje fica com este treino. Seu histórico de treinos é mantido. |
| Could not change notification settings | Não foi possível alterar as configurações de notificação | Não foi possível alterar os ajustes de notificação |
| Each exercise can have its own rest too. Set it in the exercise settings of a routine. | Cada exercício também pode ter seu próprio descanso. Defina nas configurações do exercício de uma rotina. | Cada exercício também pode ter seu próprio descanso. Defina nos ajustes do exercício de uma rotina. |
| Effort per set is off. Turn it on in Settings → Workout to keep rating. | O esforço por série está desativado. Ative em Configurações → Treino para continuar avaliando. | O esforço por série está desativado. Ative em Ajustes → Treino para continuar avaliando. |
| Exercise settings | Configurações do exercício | Ajustes do exercício |
| Follows Settings → Workout → Automatic warm-ups. | Segue Configurações → Treino → Aquecimentos automáticos. | Segue Ajustes → Treino → Aquecimentos automáticos. |
| Local keeps everything on this phone. Connecting syncs to your own openGym server instead. You can switch later in Settings. | Local mantém tudo neste celular. Conectar sincroniza com o seu próprio servidor openGym. Dá para mudar depois em Configurações. | Local mantém tudo neste celular. Conectar sincroniza com o seu próprio servidor GYM 12. Dá para mudar depois nos Ajustes. |
| Open exercise settings | Abrir configurações do exercício | Abrir ajustes do exercício |
| Progression settings | Configurações de progressão | Ajustes de progressão |
| Routines, exercises, sets and reps, your weekly schedule and progression settings. | Rotinas, exercícios, séries e repetições, seu horário semanal e as configurações de progressão. | Rotinas, exercícios, séries e repetições, seus dias da semana e os ajustes de progressão. |
| Search settings | Buscar nas configurações | Buscar nos ajustes |
| Settings | Configurações | Ajustes |
| Settings are on Home | As Configurações ficam no Início | Os Ajustes ficam no Início |
| Switch it off anytime in Settings | Desligue quando quiser nas Configurações | Desligue quando quiser nos Ajustes |
| Syncing lives under your account. Tap back to Settings. | A sincronização fica na sua conta. Volte para Configurações. | A sincronização fica na sua conta. Volte para Ajustes. |
| Tap back to Settings. | Volte para Configurações. | Volte para Ajustes. |
| The barbell has put on its Santa hat. Just for this phone, and you can switch back in Settings any time. | A barra colocou o gorro de Papai Noel. Só neste celular, e você pode voltar atrás em Configurações quando quiser. | A barra colocou o gorro de Papai Noel. Só neste celular, e você pode voltar atrás nos Ajustes quando quiser. |
| Want more? Each of these is a short guided run. You’ll find them again in Settings → About & updates. | Quer mais? Cada um é um passeio guiado curtinho. Você encontra todos de novo em Configurações → Sobre e atualizações. | Quer mais? Cada um é um passeio guiado curtinho. Você encontra todos de novo em Ajustes → Sobre e atualizações. |
| Workout settings | Configurações do treino | Ajustes do treino |
| Workout settings, layouts, notes and extra exercises hide in here. | Configurações do treino, layouts, notas e mais exercícios se escondem aqui. | Ajustes do treino, layouts, notas e mais exercícios ficam aqui. |
| You can change it anytime in Settings. | Você pode mudar isso quando quiser nas Configurações. | Você pode mudar isso quando quiser nos Ajustes. |

### Tour e tutoriais (29)

| chave (inglês) | antes | depois |
|---|---|---|
| Add it to the loop | Coloque na rotação | Coloque no rodízio |
| Backups, spreadsheets, other apps and sync | Backups, planilhas, outros aplicativos e sincronização | Backups, planilhas, outros apps e sincronização |
| Finish saves the session and moves your weights along. This practice one just quietly disappears. | Terminar salva a sessão e faz seus pesos avançarem. Este de mentirinha simplesmente some. | Terminar salva o treino e faz suas cargas avançarem. Este de mentirinha simplesmente some. |
| Hands-free backups | Backup sem esforço | Backup automático |
| Health apps | Aplicativos de saúde | Apps de saúde |
| Moving in? | Vindo de outro aplicativo? | Vindo de outro app? |
| Muscles at a glance | Músculos num piscar de olhos | Seus músculos num relance |
| Practice run | Sessão de treino | Treino de teste |
| Practice session | Sessão de teste | Treino de teste |
| Push Day, Legs, Monday Misery. Tap the name and type your own. | Dia de Empurrar, Pernas, Segunda Sofrida. Toque no nome e digite o seu. | Treino A, Pernas, Segunda Sofrida. Toque no nome e digite o seu. |
| Reopens it: sets, weights, reps, exercises. Nothing changes until you tap Save. | Reabre o treino: séries, pesos, repetições, exercícios. Nada muda até você tocar em Salvar. | Reabre o treino: séries, cargas, repetições, exercícios. Nada muda até você tocar em Salvar. |
| Rewrite the session note whenever. | Reescreva a nota da sessão quando quiser. | Reescreva a nota do treino quando quiser. |
| Share weigh-ins and workouts with the phone’s health app. | Compartilhe pesagens e treinos com o aplicativo de saúde do celular. | Compartilhe pesagens e treinos com o app de saúde do celular. |
| Show me | Me mostra | Mostrar |
| Tap Add and pick your new routine. The loop runs in that order. | Toque em Adicionar e escolha sua rotina nova. A rotação segue essa ordem. | Toque em Adicionar e escolha sua rotina nova. O rodízio segue essa ordem. |
| Tap an exercise any time to change sets, reps or weight. The arrows reorder, the link makes a superset. | Toque num exercício quando quiser para mudar séries, repetições ou peso. As setas reordenam, o link vira um superset. | Toque num exercício quando quiser para mudar séries, repetições ou carga. As setas reordenam, o link vira um bi-set. |
| Tap one to set its sets, reps and weight, or + to take the usual. Close the list when you’re done. | Toque em um para definir séries, repetições e peso, ou em + para o de sempre. Feche a lista quando terminar. | Toque em um para definir séries, repetições e carga, ou em + para o de sempre. Feche a lista quando terminar. |
| Tap Schedule to put it on a day. | Toque em Horário para colocar a rotina num dia. | Toque em Agenda para colocar a rotina num dia. |
| The big Start button | O grande botão Começar | O botão Começar |
| The rest timer starts by itself. Add time, or skip it if you feel heroic. | O descanso começa sozinho. Adicione tempo, ou pule se estiver se sentindo herói. | O cronômetro de descanso começa sozinho. Adicione tempo, ou pule se estiver se sentindo herói. |
| This one is pretend, nothing gets saved. Each row is a set: weight, then reps. Tap a number to change it. | Este é de mentirinha, nada é salvo. Cada linha é uma série: peso, depois repetições. Toque em um número para mudar. | Este é de mentirinha, nada é salvo. Cada linha é uma série: carga, depois repetições. Toque em um número para mudar. |
| Today at a glance | Hoje num piscar de olhos | Hoje, num relance |
| Today’s session lives here. One tap and you’re lifting. On a rest day it says so, no guilt trip. | A sessão de hoje fica aqui. Um toque e você já está treinando. Em dia de descanso ele avisa, sem culpa. | O treino de hoje fica aqui. Um toque e você já está treinando. Em dia de descanso ele avisa, sem culpa. |
| Train on fixed weekdays, or run your routines in a loop where the next one waits for you. | Treine em dias fixos, ou rode suas rotinas em ciclo: a próxima espera por você. | Treine em dias fixos da semana, ou faça um rodízio das suas rotinas: a próxima fica esperando você. |
| Want a 1-minute tour? | Um tour de 1 minuto? | Quer um tour de 1 minuto? |
| Week or rotation | Semana ou rotação | Semana ou rodízio |
| Weight unit, plates and stack live here. Edit or delete the exercise from here too. | Unidade de peso, anilhas e placas ficam aqui. Dá para editar ou excluir o exercício daqui também. | Unidade de peso, anilhas e placas da máquina ficam aqui. Dá para editar ou excluir o exercício daqui também. |
| When do you train it? | Quando você treina ela? | Em que dia você treina essa rotina? |
| Your routines live behind this tab. Tap Plan. | Suas rotinas ficam atrás dessa aba. Toque em Plano. | Suas rotinas ficam nessa aba. Toque em Plano. |

### Corpo, medidas e pesagens (20)

| chave (inglês) | antes | depois |
|---|---|---|
| Body fat must be between 0 and 100%. | A gordura corporal tem de estar entre 0 e 100 %. | A gordura corporal precisa estar entre 0 e 100 %. |
| Delete measurements? | Eliminar medidas? | Excluir medidas? |
| Down since your first weigh-in of the year | A menos desde a primeira pesagem do ano | Abaixo da primeira pesagem do ano |
| Enter at least one measurement | Introduz pelo menos uma medida | Informe pelo menos uma medida |
| Fill only what you measured today. Empty fields stay empty. | Preenche só o que mediste hoje. Os campos vazios ficam vazios. | Preencha só o que você mediu hoje. Os campos vazios ficam vazios. |
| Hips | Ancas | Quadril |
| Keep the logging form focused on the measurements you actually track. | Mantém o formulário focado nas medidas que realmente acompanhas. | Deixa o formulário só com as medidas que você realmente acompanha. |
| Left calf | Gémeo esquerdo | Panturrilha esquerda |
| Log measurements | Registar medidas | Registrar medidas |
| Log your weight on {0} day | Pese-se em {0} dia | Registre seu peso em {0} dia |
| Log your weight on {0} days | Pese-se em {0} dias | Registre seu peso em {0} dias |
| Measurements saved | Medidas guardadas | Medidas salvas |
| Plus weigh-ins, measurements, photos and your health apps. | Mais pesagens, medidas, fotos e seus aplicativos de saúde. | Mais pesagens, medidas, fotos e seus apps de saúde. |
| Right calf | Gémeo direito | Panturrilha direita |
| Start a workout or log your weight by voice. | Inicie um treino ou registre seu peso por voz. | Comece um treino ou registre seu peso por voz. |
| Start a workout or log your weight from the app icon. | Inicie um treino ou registre seu peso pelo ícone do aplicativo. | Comece um treino ou registre seu peso pelo ícone do app. |
| Target weight | Peso alvo | Meta de peso |
| That date already has measurements. Edit it instead. | Essa data já tem medidas — edita-as em vez disso. | Essa data já tem medidas. Edite essa medição. |
| Up since your first weigh-in of the year | A mais desde a primeira pesagem do ano | Acima da primeira pesagem do ano |
| Weigh-ins from other apps | Pesagens de outros aplicativos | Pesagens de outros apps |

### Progressão e carga (49)

| chave (inglês) | antes | depois |
|---|---|---|
| {0} sets of {1}. Time to add weight or try a harder variation. | {0} séries de {1}. Hora de colocar mais peso ou partir para uma variação mais difícil. | {0} séries de {1}. Hora de aumentar a carga ou partir para uma variação mais difícil. |
| A fuller dot means less left in the tank. The same weight at a lower {0} is progress the line alone doesn’t show. | Um ponto mais cheio significa menos sobrando no tanque. O mesmo peso com um {0} mais baixo é um progresso que a linha sozinha não mostra. | Um ponto mais cheio significa menos sobrando no tanque. A mesma carga com um {0} mais baixo é um progresso que a linha sozinha não mostra. |
| Added before your work sets and left out of volume, records and progression. Each one closes half the gap to the work weight, never below the bar on a barbell lift, and you can still change any of them mid-session. | Entram antes das suas séries de trabalho e ficam de fora do volume, dos recordes e da progressão. Cada uma fecha metade da distância até o peso de trabalho, nunca abaixo da barra vazia em um exercício com barra, e você ainda pode mudar qualquer uma no meio do treino. | Entram antes das suas séries de trabalho e ficam de fora do volume, dos recordes e da progressão. Cada uma fecha metade da distância até a carga de trabalho, nunca abaixo da barra vazia em um exercício com barra, e você ainda pode mudar qualquer uma no meio do treino. |
| All sets at the same weight. | Todas as séries com o mesmo peso. | Todas as séries com a mesma carga. |
| Built from your work weight when the workout starts. | Feitos a partir do peso de trabalho quando o treino começa. | Calculados a partir da carga de trabalho quando o treino começa. |
| Each one closes half the gap to the work weight. | Cada uma fecha metade da distância ao peso de trabalho. | Cada uma fecha metade da distância até a carga de trabalho. |
| Empty leaves the weight to your progression. A %1RM is worked out from your best estimated 1RM. | Vazio deixa o peso com a sua progressão. O %1RM é calculado a partir do seu melhor 1RM estimado. | Vazio deixa a carga com a sua progressão. O %1RM é calculado a partir do seu melhor 1RM estimado. |
| Enter a positive step to use this progression rule. | Digite um passo positivo para usar esta regra de progressão. | Digite um incremento positivo para usar esta regra de progressão. |
| For dips or pull-ups with a belt. Progression then follows the weight. | Para dips ou pull-ups com cinto. A progressão passa então a seguir o peso. | Para paralelas ou barra fixa com cinto de carga. A progressão passa a seguir a carga. |
| Four days. Your progression picks the weights, the effort climbs to RPE 9, then a deload. | Quatro dias. Sua progressão escolhe os pesos, o esforço sobe até RPE 9 e depois vem um deload. | Quatro dias. Sua progressão escolhe as cargas, o esforço sobe até RPE 9 e depois vem um deload. |
| Hit every rep in every set and the weight goes up. Repeated misses trigger a deload. | Conclua todas as repetições de todas as séries para aumentar o peso. Falhas repetidas acionam uma redução de carga. | Conclua todas as repetições de todas as séries e a carga sobe. Falhas repetidas acionam uma redução de carga. |
| Kept. Same warm-ups next time, scaled to your work weight. | Salvo. Os mesmos aquecimentos na próxima vez, na escala do peso de trabalho. | Salvo. Os mesmos aquecimentos na próxima vez, ajustados à carga de trabalho. |
| Lighter weights, and its sessions do not count toward progression. | Pesos mais leves, e as sessões não contam para a progressão. | Cargas mais leves, e esses treinos não contam para a progressão. |
| Missed reps {0} sessions running. Reset to {1} {2} and work back up. | Repetições não concluídas em {0} sessões seguidas. Volte para {1} {2} e vá subindo de novo. | Repetições não concluídas em {0} treinos seguidos. Volte para {1} {2} e vá subindo de novo. |
| Missed reps last time. Same weight again ({0} of {1} to go). | Faltaram repetições da última vez. Mesmo peso de novo (faltam {0} de {1}). | Faltaram repetições da última vez. Mesma carga de novo (faltam {0} de {1}). |
| Missed reps. {0} {1} of help while you build back up. | Repetições perdidas. {0} {1} de ajuda enquanto você volta a subir. | Faltaram repetições. {0} {1} de ajuda enquanto você volta a subir. |
| No weight logged last time. Enter what you lift and progression takes it from there. | Nenhum peso registrado da última vez. Informe quanto você levanta e a progressão segue daí. | Nenhuma carga registrada da última vez. Informe quanto você levanta e a progressão segue daí. |
| Nothing logged yet, so this session sets the baseline. | Nada registrado ainda, então esta sessão define o ponto de partida. | Nada registrado ainda, então este treino define o ponto de partida. |
| Nothing to add in weight here: it goes up in reps, then sets. | Aqui não há peso para acrescentar: sobe em repetições e depois em séries. | Aqui não há carga para acrescentar: sobe em repetições e depois em séries. |
| One stack: a belt, a landmine, a plate-loaded machine, a sled. | Uma pilha só: um cinto, uma landmine, uma máquina de anilhas, um trenó. | Um lado só: cinto de carga, landmine, máquina de anilhas, trenó. |
| Ramped from the work weight: more rungs when it is heavy, fewer when it is light. | Em degraus a partir do peso de trabalho: mais quando é pesado, menos quando é leve. | Em degraus a partir da carga de trabalho: mais quando é pesada, menos quando é leve. |
| Reps climb to the top of the range, then a set is added, up to your most sets. All of them at the top and the weight goes up, back to your first sets and reps. | As repetições sobem até o topo da faixa, depois entra mais uma série, até o seu máximo de séries. Todas no topo e o peso sobe, de volta às primeiras séries e repetições. | As repetições sobem até o topo da faixa, depois entra mais uma série, até o seu máximo de séries. Todas no topo e a carga sobe, de volta às primeiras séries e repetições. |
| Reps: {0} is under a third of last time’s {1}. | Reps: {0} é menos de um terço da última vez, {1}. | Reps: {0} é menos de um terço da última vez ({1}). |
| Same weight, aim for {0} reps in every set. | Mesmo peso. Tente {0} repetições em cada série. | Mesma carga. Tente {0} repetições em cada série. |
| Same weight, aim for {0} reps on the last set. | Mesmo peso. Tente {0} repetições na última série. | Mesma carga. Tente {0} repetições na última série. |
| Same weight, aim for {0} reps this time. | Mesmo peso. Desta vez, tente {0} repetições. | Mesma carga. Desta vez, tente {0} repetições. |
| Saved in the routine, scaled to your work weight | Salvo na rotina, na escala do peso de trabalho | Salvo na rotina, ajustado à carga de trabalho |
| Short {0} sessions in a row. Back off to {1}s and build up again. | {0} sessões seguidas abaixo da meta. Reduza para {1} s e vá subindo de novo. | {0} treinos seguidos abaixo da meta. Reduza para {1} s e vá subindo de novo. |
| Single stack | Pilha única | Um lado só |
| Stuck for {0} sessions. Back to {1} {2} of help, start again at {3} sets of {4}. | Travado há {0} sessões. Volte para {1} {2} de ajuda e recomece com {3} séries de {4}. | Travado há {0} treinos. Volte para {1} {2} de ajuda e recomece com {3} séries de {4}. |
| Stuck for {0} sessions. Back to {1} {2} of help, then build up again. | Estagnado há {0} sessões. Volte para {1} {2} de ajuda e suba de novo. | Estagnado há {0} treinos. Volte para {1} {2} de ajuda e suba de novo. |
| Stuck for {0} sessions. Deload to {1} {2} and start again at {3} sets of {4}. | Travado há {0} sessões. Reduza a carga para {1} {2} e recomece com {3} séries de {4}. | Travado há {0} treinos. Reduza a carga para {1} {2} e recomece com {3} séries de {4}. |
| Stuck for {0} sessions. Deload to {1} {2}. | Travado há {0} sessões. Reduza a carga para {1} {2}. | Travado há {0} treinos. Reduza a carga para {1} {2}. |
| Targets stay where you set them. | As metas permanecem como você definir. | As metas ficam como você definiu. |
| That’s the whole stack: {0} {1} is the heaviest it goes, so the weight stays. | É o bloco todo: {0} {1} é o máximo que dá, então o peso fica. | São todas as placas: {0} {1} é o máximo da máquina, então a carga fica. |
| The reps you logged last time in that routine, carried over, and any warm-ups you set up yourself. With progression off, the weight too. | São mantidas as repetições que você registrou da última vez nessa rotina e os aquecimentos que você mesmo ajustou. Com a progressão desativada, o peso também. | São mantidas as repetições que você registrou da última vez nessa rotina e os aquecimentos que você mesmo ajustou. Com a progressão desligada, a carga também. |
| The weights this machine really has, odd steps and all. Progression, deloads, warm-ups and the + and − buttons land only on these. | Os pesos que esta máquina tem mesmo, saltos estranhos incluídos. A progressão, as descargas, os aquecimentos e os botões + e − só caem nestes. | Os pesos que esta máquina tem de verdade, saltos estranhos incluídos. A progressão, os deloads, os aquecimentos e os botões + e − só caem nestes. |
| The weights you own, one bell each. Progression, deloads, warm-ups and the + and − buttons of dumbbell lifts land only on these. | Os pesos que você tem, um halter cada. A progressão, as descargas, o aquecimento e os botões + e − dos exercícios com halteres só caem nestes. | Os pesos que você tem, um halter cada. A progressão, os deloads, o aquecimento e os botões + e − dos exercícios com halteres só caem nestes. |
| These count on top of the loop. Tap a day to change or clear it. | Contam além do ciclo. Toque em um dia para mudar ou limpar. | Contam além do rodízio. Toque em um dia para mudar ou limpar. |
| Top of the rep range in every set. {0} {1} less help, back to {2} reps. | Topo do intervalo em todas as séries. Menos {0} {1} de ajuda, de volta a {2} repetições. | Topo da faixa em todas as séries. Menos {0} {1} de ajuda, de volta a {2} repetições. |
| Top of the table. Take a bow. | No topo da tabela. Pode fazer uma reverência. | No topo da tabela. Pode comemorar. |
| Two straight sets plus a final set taken to failure. Beat the target on that set and the weight goes up (twice as much if you double the reps). One failure resets 10 %. | Duas séries normais e uma série final até a falha. Supere a meta nessa série e o peso sobe (em dobro se você dobrar as repetições). Uma falha reduz 10 %. | Duas séries normais e uma série final até a falha. Supere a meta nessa série e a carga sobe (em dobro se você dobrar as repetições). Uma falha reduz 10 %. |
| Weight is up to you: pyramid sets are not progressed automatically. | Você escolhe o peso: as séries em pirâmide não progridem automaticamente. | Você escolhe a carga: as séries em pirâmide não progridem automaticamente. |
| Weight stack | Bloco de pesos | Placas da máquina |
| Weight: {0} is more than twice your heaviest, {1}. | Peso: {0} é mais que o dobro do seu máximo, {1}. | Carga: {0} é mais que o dobro do seu máximo, {1}. |
| Weight: {0} is under a third of last time’s {1}. | Peso: {0} é menos de um terço da última vez, {1}. | Carga: {0} é menos de um terço da última vez ({1}). |
| Work up through a rep range at the same weight. Reach the top of the range in every set and the weight goes up, reps back to the bottom. | Avance por uma faixa de repetições com o mesmo peso. Ao atingir o topo da faixa em todas as séries, o peso aumenta e as repetições voltam ao mínimo. | Avance por uma faixa de repetições com a mesma carga. Ao atingir o topo da faixa em todas as séries, a carga aumenta e as repetições voltam ao mínimo. |
| You’ve outgrown the rack: {0} {1} is your heaviest dumbbell, so the weight stays. | Você já superou o rack: {0} {1} é o seu halter mais pesado, então o peso fica. | Você já superou o rack: {0} {1} é o seu halter mais pesado, então a carga fica. |
| Your rows, as a share of the work weight, so they grow with it. | Suas linhas, como parte do peso de trabalho, então crescem com ele. | Suas linhas, como parte da carga de trabalho, então crescem com ela. |

### Rotinas, plano, agenda e rodízio (47)

| chave (inglês) | antes | depois |
|---|---|---|
| “{0}” is out of the loop. | “{0}” saiu do ciclo. | “{0}” saiu do rodízio. |
| Add routine to the rotation | Adicionar rotina à rotação | Adicionar rotina ao rodízio |
| Add to the rotation | Adicionar à rotação | Adicionar ao rodízio |
| Added as a new routine. Nothing you already have is touched. | Adicionada como nova rotina. Nada do que você já tem é mexido. | Adicionada como nova rotina. Nada do que você já tem é alterado. |
| Already in the loop: adds it again | Já está no ciclo: adiciona de novo | Já está no rodízio: adiciona de novo |
| Applies to every exercise in this routine that does not set its own rule. | Aplica-se a todos os exercícios desta rotina que não definam a sua própria regra. | Vale para todos os exercícios desta rotina que não têm regra própria. |
| Bring another routine into this session | Trazer outra rotina para esta sessão | Trazer outra rotina para este treino |
| Build my own plan | Criar meu próprio plano | Montar meu próprio plano |
| Build your loop in Plan | Monte seu ciclo no Plano | Monte seu rodízio no Plano |
| Create an independent routine from these exercise targets. Your workout history is kept. | Criar uma rotina independente a partir destes objetivos. O histórico de treinos será mantido. | Criar uma rotina independente a partir destas metas. O histórico de treinos será mantido. |
| Every stored weight (logged sets, working weights, routine targets, body weight, bar weights) is in {0}. Convert the numbers, or keep them and only change the label? | Todos os pesos salvos (séries registradas, pesos de trabalho, alvos das rotinas, peso corporal, pesos das barras) estão em {0}. Converter os números, ou mantê-los e mudar só o rótulo? | Todos os pesos salvos (séries registradas, cargas de trabalho, metas das rotinas, peso corporal, pesos das barras) estão em {0}. Converter os números, ou manter os números e mudar só a unidade? |
| It will be removed from your routines. Already-logged workouts keep their sets. | Ele será removido das suas rotinas. Os treinos já registrados manterão suas séries. | Ele será removido das suas rotinas. Os treinos já registrados mantêm as séries. |
| Logged a workout on another device? Before the nudge goes out, the phone checks with your server whenever it lets the app run in the background. Opening the app always catches up. | Registrou um treino em outro dispositivo? Antes do aviso, o celular confirma com o seu servidor, sempre que deixar o aplicativo rodar em segundo plano. Abrir o aplicativo sempre deixa tudo em dia. | Registrou um treino em outro dispositivo? Antes do aviso, o celular confirma com o seu servidor, sempre que deixar o app rodar em segundo plano. Abrir o app sempre deixa tudo em dia. |
| Name and rest of this superset | Nome e descanso desta supersérie | Nome e descanso deste superset |
| No rotation yet. Add routines in the order you want to train them. The first one you haven’t logged stays up next. | Ainda sem rotação. Adicione as rotinas na ordem em que quer treiná-las. A primeira que você ainda não registrou continua sendo a próxima. | Ainda sem rodízio. Adicione as rotinas na ordem em que quer treinar. A primeira que você ainda não registrou continua sendo a próxima. |
| No rotation yet. Add routines to it in Plan. | Ainda sem rotação. Adicione rotinas no Plano. | Ainda sem rodízio. Adicione rotinas no Plano. |
| No schedule yet. Put routines on your week or in a loop in Plan, then take it over here. | Ainda não tem agenda. Coloque rotinas na sua semana ou numa rotação no Plano e depois traga para cá. | Ainda não tem agenda. Coloque rotinas na sua semana ou num rodízio no Plano e depois traga para cá. |
| Pick a routine. Sets, reps and weight come next. | Escolha uma rotina. Séries, repetições e peso vêm em seguida. | Escolha uma rotina. Séries, repetições e carga vêm em seguida. |
| Plan the final set as an all-out one. | Planeje a última série com tudo. | Planejar a última série até a falha. |
| Planned sessions start from | Ponto de partida das sessões planejadas | Ponto de partida dos treinos planejados |
| Rest day. The loop goes on {0}. | Dia de descanso. O ciclo continua {0}. | Dia de descanso. O rodízio continua {0}. |
| Rotation | Rotação | Rodízio |
| Rounded to whole sets. A set counts fully for its main muscle and partly for the ones that help, so the muscles add up to more than your work sets. | Arredondado a séries inteiras. Uma série conta por inteiro para o músculo principal e em parte para os que ajudam, por isso os músculos somam mais do que as séries de trabalho. | Arredondado para séries inteiras. Uma série conta por inteiro para o músculo principal e em parte para os que ajudam, por isso os músculos somam mais do que as séries de trabalho. |
| Routines in a loop. Whatever is next stays next until you train it, whatever the day. | Rotinas em ciclo. A próxima continua sendo a próxima até você treinar, seja qual for o dia. | Rotinas em rodízio. A próxima continua sendo a próxima até você treinar, seja qual for o dia. |
| Schedule | Horário | Agenda |
| Sets, routines and the loop: left removes, right copies | Séries, rotinas e o ciclo: esquerda remove, direita copia | Séries, rotinas e o rodízio: esquerda remove, direita copia |
| Start new pass | Iniciar nova passagem | Começar nova volta |
| Start the loop | Iniciar o ciclo | Começar o rodízio |
| Start the loop over | Recomeçar o ciclo | Recomeçar o rodízio |
| Superset position {0} | Posição na supersérie {0} | Posição no superset {0} |
| Tap a trained day for details · tap any other day to plan a session | Toque em um dia treinado para ver detalhes · toque em outro dia para planejar uma sessão | Toque em um dia treinado para ver detalhes · toque em outro dia para planejar um treino |
| The loop | O ciclo | O rodízio |
| The loop stops. Your weekdays stay as they are, and the loop is saved for later. | O ciclo para. Seus dias da semana ficam como estão e o ciclo fica salvo para depois. | O rodízio para. Seus dias da semana ficam como estão e o rodízio fica salvo para depois. |
| The routine’s sets and reps. Your history decides the weight. | As séries e repetições da rotina. Seu histórico decide o peso. | As séries e repetições da rotina. Seu histórico decide a carga. |
| This programme is gone. | Este programa já não existe. | Este programa não existe mais. |
| This rotation couldn’t be read. Another device may have written it. | Não foi possível ler esta rotação. Talvez outro dispositivo tenha gravado ela. | Não foi possível ler este rodízio. Talvez outro dispositivo tenha gravado ele. |
| Three days on the 5×5 routines, a little heavier every week, then a light week to bounce back. | Três dias nas rotinas 5×5, um pouco mais pesado cada semana, depois uma semana leve para recuperar. | Três dias nas rotinas 5×5, um pouco mais pesado a cada semana, depois uma semana leve para recuperar. |
| Use this rotation | Usar esta rotação | Usar este rodízio |
| Use this rotation? | Usar esta rotação? | Usar este rodízio? |
| Use this weekly schedule | Usar este horário semanal | Usar esta agenda semanal |
| Week schedule | Horário semanal | Agenda semanal |
| Without one, the superset rests as long as its longest exercise rest. | Sem isto, a supersérie descansa tanto como o descanso mais longo dos seus exercícios. | Sem isso, o superset descansa o mesmo que o descanso mais longo dos exercícios dele. |
| Your coach gives up control of this week: openGym owns the queue from here on and repeats these sessions by itself once they are all done. A new week from the coach’s app would replace this rotation. | Seu treinador abre mão do controle desta semana: o openGym passa a ser dono da fila a partir de agora e repete essas sessões sozinho assim que todas estiverem concluídas. Uma nova semana vinda do aplicativo do seu treinador substituiria esta rotação. | Seu treinador abre mão do controle desta semana: o GYM 12 passa a cuidar da fila a partir de agora e repete esses treinos sozinho quando todos estiverem concluídos. Uma nova semana vinda do app do seu treinador substituiria este rodízio. |
| Your last session of the exercise in the same routine. Heavy day and light day stay apart. | Sua última sessão do exercício na mesma rotina. Dia pesado e dia leve ficam separados. | Seu último treino com o exercício na mesma rotina. Dia pesado e dia leve ficam separados. |
| Your loop | Seu ciclo | Seu rodízio |
| Your own loop gets replaced. | Seu próprio ciclo é substituído. | Seu rodízio atual é substituído. |
| Your routines in a loop | Suas rotinas em ciclo | Suas rotinas em rodízio |

### Estatísticas e recordes (21)

| chave (inglês) | antes | depois |
|---|---|---|
| at {0} {1} or harder | a {0} {1} ou mais duro | com {0} {1} ou mais difícil |
| Average time a session, counted from when its sets were ticked. | Tempo médio por sessão, contado a partir de quando as séries foram marcadas. | Tempo médio por treino, contado a partir de quando as séries foram marcadas. |
| Best set weight per workout | Melhor peso por treino | Maior carga por treino |
| by hard sets | por séries duras | por séries efetivas |
| Consistency | Regularidade | Constância |
| Fatigue shows how recently each muscle was trained. High means rest. | A fadiga mostra há quanto tempo cada músculo foi treinado. Um nível elevado significa que é preciso descansar. | A fadiga mostra há quanto tempo cada músculo foi treinado. Alta significa que ele precisa descansar. |
| Fatigued | Fatigado | Cansado |
| Go a bit lighter today, or swap the session. | Pegue mais leve hoje, ou troque a sessão. | Pegue mais leve hoje, ou troque o treino. |
| Hard | Duras | Efetivas |
| Max reps | Reps Máx | Máx. de reps |
| no hard sets | sem séries duras | sem séries efetivas |
| No hard sets in this period | Sem séries duras neste período | Sem séries efetivas neste período |
| Structural balance | Balanço estrutural | Equilíbrio estrutural |
| Target range | Intervalo-alvo | Faixa-alvo |
| What this session hits | O que esta sessão trabalha | O que este treino trabalha |
| Your back hasn’t had any work in {0} days. | Suas costas não treinam há {0} dias. | Você não treina costas há {0} dias. |
| Your chest hasn’t had any work in {0} days. | Seu peito não treina há {0} dias. | Você não treina peito há {0} dias. |
| Your legs are still recovering from {0}. | Suas pernas ainda estão se recuperando (sessão: {0}). | Suas pernas ainda estão se recuperando do treino de {0}. |
| Your legs haven’t had any work in {0} days. | Suas pernas não treinam há {0} dias. | Você não treina pernas há {0} dias. |
| Your shoulders haven’t had any work in {0} days. | Seus ombros não treinam há {0} dias. | Você não treina ombros há {0} dias. |
| Your upper body is still recovering from {0}. | A parte de cima ainda está se recuperando (sessão: {0}). | A parte de cima ainda está se recuperando do treino de {0}. |

### Backup, importação e app (15)

| chave (inglês) | antes | depois |
|---|---|---|
| Android app only | Só no aplicativo Android | Só no app Android |
| Auto-backup on changes | Backup automático ao alterar | Backup automático a cada alteração |
| Checksum not available, so not installing | Soma de verificação indisponível, por isso não foi instalado | Soma de verificação indisponível, então não foi instalado |
| Download the APK from opengym.ch | Descarrega o APK em opengym.ch | Baixe o APK em opengym.ch |
| Get the Android app | Obter a app Android | Baixar o app Android |
| Import a photo of your membership card or scan it with the camera. No extra app needed at the gym, just open this screen. | Importe uma foto do seu cartão de sócio ou escaneie com a câmera. Nada de outro app na academia, é só abrir esta tela. | Importe uma foto da carteirinha da academia ou escaneie com a câmera. Nada de outro app na academia, é só abrir esta tela. |
| Import failed: {0} | Importação falhou: {0} | Falha na importação: {0} |
| Import from another app | Importar de outro aplicativo | Importar de outro app |
| Only while using the app | Só durante o uso do aplicativo | Só durante o uso do app |
| Siri asks for the number and logs it without opening the app. | A Siri pergunta o número e registra sem abrir o aplicativo. | A Siri pergunta o número e registra sem abrir o app. |
| Strong, Hevy, FitNotes, Liftosaur, Fitbod, StrongLifts, JEFIT and more, or body weight from Apple Health | Strong, Hevy, FitNotes, Liftosaur, Fitbod, StrongLifts, JEFIT e outras, ou o peso da Apple Saúde | Strong, Hevy, FitNotes, Liftosaur, Fitbod, StrongLifts, JEFIT e outros, ou o peso do Apple Saúde |
| The web app updates together with your server. The Android app installs its own updates from here. | A app web atualiza-se com o teu servidor. A app Android instala as suas atualizações a partir daqui. | O app web atualiza junto com o seu servidor. O app Android instala as próprias atualizações por aqui. |
| to install openGym as a full-screen app. | para instalar o openGym como aplicativo em tela cheia. | para instalar o GYM 12 como app em tela cheia. |
| Wear OS watches talk to the phone through Google Play services, which F-Droid apps leave out. The APK from opengym.ch and the Google Play app have the watch link. | Os relógios Wear OS falam com o celular através dos serviços do Google Play, que os aplicativos do F-Droid deixam de fora. O APK de opengym.ch e o aplicativo do Google Play têm a conexão com o relógio. | Os relógios Wear OS falam com o celular através dos serviços do Google Play, que os apps do F-Droid deixam de fora. O APK de opengym.ch e o app do Google Play têm a conexão com o relógio. |
| You have the latest version. | Tens a versão mais recente. | Você está na versão mais recente. |

### Motivação, desafios e extras de época (12)

| chave (inglês) | antes | depois |
|---|---|---|
| {0} waited by the door all evening. For you. | {0} esperou você na porta a noite toda. Você. | {0} ficou esperando você na porta a noite toda. |
| {0} weeks in a row. New badge! | {0} semanas seguidas. Emblema novo! | {0} semanas seguidas. Nova medalha! |
| All three done. Gold month! | Os três feitos. Mês de ouro! | Os três concluídos. Mês de ouro! |
| Back next December. The elves are on a tea break. | Volta em dezembro. Os duendes estão numa pausa para o chá. | Volta em dezembro. Os duendes estão numa pausa para o café. |
| Every badge collected. Legend. | Todos os emblemas. Lenda. | Todas as medalhas conquistadas. Lenda. |
| Freezes full. A missed week uses one, no harm done. | Congelamentos cheios. Uma semana perdida gasta um, sem drama. | Congelamentos no máximo. Uma semana perdida gasta um, sem drama. |
| Gold month. Take a bow. | Mês de ouro. Pode agradecer os aplausos. | Mês de ouro. Pode comemorar. |
| Next badge at {0} weeks. | Próximo emblema com {0} semanas. | Próxima medalha com {0} semanas. |
| One more surprise: the barbell has a festive outfit for your home screen. | Mais uma surpresa: a barra ganhou um visual festivo para a sua tela inicial. | Mais uma surpresa: a barra ganhou um visual festivo para a sua tela de início. |
| Put it away | Guardar | Fechar |
| Streak badges | Emblemas da sequência | Medalhas da sequência |
| You found a present! Inside: one extra rep of good vibes. | Você achou um presente! Dentro: uma repetição extra de boas vibrações. | Você achou um presente! Dentro: uma repetição extra de boas vibes. |

### Academia, equipamentos e check-in (30)

| chave (inglês) | antes | depois |
|---|---|---|
| A nudge when you walk into your gym. | Um toque quando você entra na sua academia. | Um aviso quando você entra na sua academia. |
| Cardio exercises log time + speed instead of weight × reps. | Exercícios de cardio registram tempo e velocidade em vez de peso × repetições. | Exercícios de cardio registram tempo e velocidade em vez de carga × repetições. |
| Checking… | A verificar… | Verificando… |
| Coach wants you back on the bar. | O coach quer você de volta na barra. | O treinador quer você de volta na barra. |
| core | abdômen | core |
| e.g. FitZone downtown | ex. FitZone centro | ex.: Academia do Centro |
| elliptical machine | elíptica | elíptico |
| hamstrings | isquiotibiais | posteriores de coxa |
| Hamstrings | Isquiotibiais | Posteriores de coxa |
| inner thighs | interior das coxas | parte interna das coxas |
| Label | Etiqueta | Nome |
| Lats & upper back | Dorsais e costas superiores | Dorsais e parte alta das costas |
| leverage machine | máquina de alavanca | máquina articulada |
| No more nudges when you arrive here. | Você não recebe mais o toque quando chegar aqui. | Você não recebe mais o aviso ao chegar aqui. |
| olympic | halterofilia | levantamento olímpico |
| Pairs of each size you own. Every set row loads from this list, so a home gym with one pair of 45s is never told to use two. | Pares de cada tamanho que você tem. Cada linha de série carrega a partir desta lista, então uma academia em casa com apenas um par de anilhas de 45 nunca é instruída a usar duas. | Pares de cada tamanho que você tem. Cada linha de série monta a carga a partir desta lista, então uma academia em casa com só um par de anilhas de 45 nunca vai receber a sugestão de usar duas. |
| Rest-timer alerts, even if openGym is closed. | Alertas do temporizador de descanso, mesmo com o openGym fechado. | Alertas do cronômetro de descanso, mesmo com o GYM 12 fechado. |
| Save card | Guardar cartão | Salvar cartão |
| Show a card on Home with your membership QR codes. | Mostra no Início um cartão com seus códigos QR de sócio. | Mostra no Início um cartão com os QR codes da sua academia. |
| Streaks, challenges, badges, recaps and your year in openGym. | Sequências, desafios, emblemas, resumos e seu ano no openGym. | Sequências, desafios, medalhas, resumos e seu ano no GYM 12. |
| suspension trainer | treino em suspensão | fita de suspensão |
| The weight you log is all plates. | O peso que registas são só discos. | A carga que você registra é só de anilhas. |
| Touch and hold the openGym icon. You can also drag a shortcut onto your home screen. | Toque e segure o ícone do openGym. Você também pode arrastar um atalho para a tela inicial. | Toque e segure o ícone do GYM 12. Você também pode arrastar um atalho para a tela de início. |
| traps | trapézios | trapézio |
| upper back | costas superiores | parte alta das costas |
| upper chest | peito superior | peitoral superior |
| weight plate | disco de peso | anilha |
| What the bars at your gym weigh. Every exercise with that bar counts plates from it, unless you gave the exercise its own. Logged weights stay totals. | O quanto pesam as barras da sua academia. Cada exercício com essa barra conta as anilhas a partir dela, a menos que você tenha dado uma própria a ele. Os pesos registrados continuam sendo totais. | O quanto pesam as barras da sua academia. Cada exercício com essa barra conta as anilhas a partir dela, a menos que você tenha dado uma própria a ele. As cargas registradas continuam sendo o total. |
| You still log the total weight. This only feeds the plate line under each set. | Você continua registrando o peso total. Isso só alimenta a linha de anilhas embaixo de cada série. | Você continua registrando a carga total. Isso só alimenta a linha de anilhas embaixo de cada série. |
| Your membership codes on Home, and NFC stickers that start a workout. | Seus códigos de sócio no Início e adesivos NFC que iniciam um treino. | Os códigos da sua academia no Início e adesivos NFC que começam um treino. |

### Treino e séries (88)

| chave (inglês) | antes | depois |
|---|---|---|
| {0} session | {0} sessão | {0} treino |
| {0} sessions | {0} sessões | {0} treinos |
| {0} set still unchecked. Finish the workout now? | Falta {0} série sem marcar. Finalizar o treino agora? | Falta {0} série sem marcar. Terminar o treino agora? |
| {0} sets still unchecked. Finish the workout now? | Faltam {0} séries sem marcar. Finalizar o treino agora? | Faltam {0} séries sem marcar. Terminar o treino agora? |
| + Burst | + Rajada | + Mini-série |
| + Drop | + Queda | + Drop |
| A number of ramp sets | Um número de séries de subida | Um número de séries de aproximação |
| A set left at 0 weight starts from that set’s weight last time. | Uma série com peso 0 começa com o peso dessa série da última vez. | Uma série com carga 0 começa com a carga dessa série da última vez. |
| A timer runs while you hold the set. Leave the weight at 0 for bodyweight holds. | Um cronômetro funciona enquanto você mantém a posição. Deixe o peso em 0 para isometrias com o peso do corpo. | Um cronômetro roda enquanto você segura a posição. Deixe a carga em 0 para isometrias com o peso do corpo. |
| Add burst | Adicionar série rest-pause | Adicionar mini-série |
| Add drop set | Adicionar drop set | Adicionar drop-set |
| Add session note | Adicionar nota da sessão | Adicionar nota do treino |
| aim for {0} | mire em {0} | tente {0} |
| All exercises done. Nice work! Finish up, or add another one if you’ve got more in you. | Todos os exercícios feitos. Mandou bem! Finalize, ou adicione mais um se ainda tiver gás. | Todos os exercícios feitos. Mandou bem! Termine, ou adicione mais um se ainda tiver gás. |
| Ask for a weight on every set. | Pedir um peso em cada série. | Pedir a carga em cada série. |
| Back-off sets | Séries descendentes | Séries de back-off |
| Burst {0} | Rajada {0} | Mini-série {0} |
| Default (auto) | Predefinido (automático) | Padrão (automático) |
| Default (none) | Predefinido (nenhum) | Padrão (nenhum) |
| Drop {0} | Queda {0} | Drop {0} |
| Drop set | Drop set | Drop-set |
| Drop-set | Série decrescente | Drop-set |
| Drop-set / rest-pause | Séries decrescentes / rest-pause | Drop-set / rest-pause |
| Drops | Quedas | Drops |
| Each set one step lighter than the one before. The weight above is the first set. | Cada série um passo mais leve do que a anterior. O peso acima é a primeira série. | Cada série um passo mais leve que a anterior. A carga acima é a da primeira série. |
| Easy, warm-up territory | Fácil, zona de aquecimento | Fácil, nível de aquecimento |
| Edit session note | Editar nota da sessão | Editar nota do treino |
| Enter a weight and 1–{0} reps. Beyond that it’s basically guesswork. | Informe um peso e de 1 a {0} repetições. Acima disso é praticamente chute. | Informe a carga e de 1 a {0} repetições. Acima disso é praticamente chute. |
| Every set becomes a drop-set: after the main set, {0} drop(s) with no rest, each about {1}% lighter. | Cada série vira uma série decrescente: depois da série principal, {0} queda(s) sem descanso, cada uma cerca de {1}% mais leve. | Cada série vira um drop-set: depois da série principal, {0} drop(s) sem descanso, cada um cerca de {1}% mais leve. |
| Every set becomes rest-pause: {0} reps to start, then {1} more split into short bursts, {2}s rest before each, roughly halving each time. | Cada série vira rest-pause: {0} repetições para começar, depois mais {1} divididas em rajadas curtas, com {2}s de descanso antes de cada uma, caindo cerca de metade a cada vez. | Cada série vira rest-pause: {0} repetições para começar, depois mais {1} divididas em mini-séries, com {2}s de descanso antes de cada uma, caindo cerca de metade a cada vez. |
| Expand | Ampliar | Expandir |
| Finish your current workout first | Finalize o treino atual primeiro | Termine o treino atual primeiro |
| For lunges, single-arm rows and the like. | Para afundos, remadas a um braço e afins. | Para afundos, remadas unilaterais e afins. |
| Forgot to finish on time? Set how long the session really took. It keeps its start time and its sets. | Esqueceu de terminar na hora? Defina quanto tempo a sessão realmente durou. Ela mantém o horário de início e as séries. | Esqueceu de terminar na hora? Defina quanto tempo o treino realmente durou. Ele mantém o horário de início e as séries. |
| Go! | Já! | Vai! |
| Holds start by themselves | Começa sozinha | As isometrias começam sozinhas |
| How hard did that feel? | Quão puxado pareceu? | Quão puxado foi? |
| How hard was that set? | Quão dura foi a série? | Quão difícil foi a série? |
| It hurts, it’s taken, no time, feeling great | Dói, ocupado, sem tempo, em grande forma | Dói, está ocupado, sem tempo, me sentindo ótimo |
| Last {0} sessions | Últimas {0} sessões | Últimos {0} treinos |
| Load {0} | Carregar {0} | Colocar {0} |
| Logged on the usual workout screen, without timers. | Registrado na tela de treino habitual, só sem temporizadores. | Registrado na tela de treino de sempre, só sem cronômetros. |
| Logging a past workout, so no rest timers. | Registrando um treino passado, então sem timers de descanso. | Registrando um treino passado, então sem cronômetros de descanso. |
| Maybe half a rep left | Talvez meia repetição em reserva | Talvez desse mais meia repetição |
| My own | Os meus | Do meu jeito |
| No explicit muscle group | Nenhum grupo muscular explícito | Sem grupo muscular definido |
| No rest timer | Sem temporizador | Sem cronômetro |
| No sessions logged yet | Ainda não há sessões registradas | Nenhum treino registrado ainda |
| No sets are left in this workout, so there is nothing to save. Delete it from your history? | Não sobrou nenhuma série neste treino, então não há nada para salvar. Excluí-lo do seu histórico? | Não sobrou nenhuma série neste treino, então não há nada para salvar. Excluir do histórico? |
| No weight to enter. Just log the reps. | Sem peso para informar. É só registrar as repetições. | Sem carga para informar. É só registrar as repetições. |
| No weight to enter. Just time the hold. | Sem peso para informar. É só cronometrar a sustentação. | Sem carga para informar. É só cronometrar a isometria. |
| Not on iPhone | Não no iPhone | Não funciona no iPhone |
| Not supported in this browser. | Não suportado neste navegador. | Não funciona neste navegador. |
| Noted. See you next session! | Anotado. Até a próxima sessão! | Anotado. Até o próximo treino! |
| Nothing at {0} {1}: that one starts cold. | Nada com {0} {1}: esse começa a frio. | Nada com {0} {1}: esse começa sem aquecimento. |
| Nothing left, went to failure | Nada sobrando, fui até a falha | Fui até a falha, não sobrou nada |
| One more rep in the tank | Mais uma repetição de margem | Dava para fazer mais uma |
| Primary muscle groups | Grupos musculares primários | Grupos musculares principais |
| Remove burst | Remover rajada | Remover mini-série |
| Remove drop | Remover queda | Remover drop |
| Replacing {0} | Substituir {0} | Substituindo {0} |
| Reps climb to {0}, then a set is added and the reps start over. At {1} sets it asks you to add weight instead. | As repetições aumentam até {0}; depois, uma série é adicionada e as repetições recomeçam. Ao chegar a {1} séries, o app sugere adicionar peso. | As repetições aumentam até {0}; depois, uma série é adicionada e as repetições recomeçam. Ao chegar a {1} séries, o app sugere aumentar a carga. |
| reps from your last session | reps da sua última sessão | reps do seu último treino |
| Rest timer | Temporizador de descanso | Cronômetro de descanso |
| Rest-pause burst | Rajada rest-pause | Mini-série rest-pause |
| Save & start workout | Salvar e iniciar treino | Salvar e começar treino |
| Scroll to 0:00 to turn the rest timer off. | Role até 0:00 para desligar o temporizador. | Role até 0:00 para desligar o cronômetro de descanso. |
| Session note | Nota da sessão | Nota do treino |
| Sessions | Sessões | Treinos |
| Set {0} gone. Its timer stopped too. | Série {0} já era. O timer também. | Série {0} já era. O cronômetro também. |
| Start set | Iniciar série | Começar série |
| Start without weighing in | Iniciar sem se pesar | Começar sem se pesar |
| Started | Começado | Começou |
| Straight into the work sets. | Direto às séries de trabalho. | Direto para as séries de trabalho. |
| The session keeps its length. Personal records are worked out again from the new order. | A sessão mantém a duração. Os recordes pessoais são recalculados pela nova ordem. | O treino mantém a duração. Os recordes pessoais são recalculados pela nova ordem. |
| The sets you logged for this exercise in this session will be lost. | As séries registradas para este exercício nesta sessão serão perdidas. | As séries registradas para este exercício neste treino serão perdidas. |
| The sets you logged in this session will be lost. | As séries registradas nesta sessão serão perdidas. | As séries registradas neste treino serão perdidas. |
| This exercise, this session only | Só este exercício, só nesta sessão | Só este exercício, só neste treino |
| This removes the exercise from your current session. | Isso remove o exercício da sua sessão atual. | Isso remove o exercício do treino atual. |
| This session | Esta sessão | Este treino |
| Three more reps | Mais três repetições | Dava para fazer mais três |
| Three sessions, the whole body each time. | Três sessões, o corpo todo de cada vez. | Três treinos, o corpo todo em cada um. |
| Two more reps | Mais duas repetições | Dava para fazer mais duas |
| Vibrate | Vibração | Vibrar |
| Weight drop (%) | Queda de peso (%) | Redução de carga (%) |
| Working, but steady | Exigente, mas estável | Puxando, mas sob controle |
| You haven’t checked off any sets. Finish the workout anyway? | Você não marcou nenhuma série. Deseja finalizar o treino mesmo assim? | Você não marcou nenhuma série. Terminar o treino mesmo assim? |
| Your last session | Sua última sessão | Seu último treino |

### Geral (37)

| chave (inglês) | antes | depois |
|---|---|---|
| “{0}” is done. Nicely lifted. What next? | “{0}” está concluído. Bem levantado. E agora? | “{0}” está concluído. Mandou bem. E agora? |
| Asks for your body weight when a workout starts. Off starts the session straight away. | Pede seu peso ao iniciar um treino. Desligado, a sessão começa na hora. | Pede seu peso ao começar um treino. Desligado, o treino começa na hora. |
| Chime (louder) | Carrilhão (mais alto) | Melodia (mais alta) |
| Drop and burst shortcuts on every set | Atalhos de drop e rajada em cada série | Atalhos de drop e mini-série em cada série |
| Every muscle group got at least one hard set in this period. | Todos os grupos musculares tiveram pelo menos uma série dura neste período. | Todos os grupos musculares tiveram pelo menos uma série efetiva neste período. |
| Generous, especially at high reps. | Generosa, sobretudo com muitas repetições. | Generosa, principalmente com muitas repetições. |
| Go! {0} | Já! {0} | Vai! {0} |
| Hi {0} | Olá {0} | Oi, {0} |
| How hard a set was, logged next to weight and reps. Two scales for the same judgement, counted from opposite ends. | O quão dura foi uma série, ao lado do peso e das repetições. Duas escalas para o mesmo juízo, contadas de pontas opostas. | O quanto uma série foi difícil, registrado ao lado da carga e das repetições. Duas escalas para a mesma avaliação, contadas de pontas opostas. |
| How it felt | Como se sentiu | Como foi |
| Include my weights | Incluir meus pesos | Incluir minhas cargas |
| Just for this phone. Some home screens take a moment to catch up. | Só para este celular. Algumas telas iniciais demoram um pouco para perceber. | Só neste celular. Algumas telas de início demoram um pouco para atualizar. |
| Keep the numbers, change the label | Manter os números, mudar o rótulo | Manter os números, mudar só a unidade |
| Keep timing after target | Continuar contando após o objetivo | Continuar contando depois da meta |
| Next session: {0}, {1} | Próxima sessão: {0}, {1} | Próximo treino: {0}, {1} |
| No setting matches “{0}”. | Nenhuma configuração corresponde a “{0}”. | Nenhum ajuste corresponde a “{0}”. |
| Nordic curl (1 rep) | Nordic curl (1 rep) | Flexão nórdica (1 rep) |
| Off: just sets, reps and rest. They pick their own weights. | Desligado: só séries, repetições e descanso. Os pesos eles escolhem. | Desligado: só séries, repetições e descanso. A pessoa escolhe as próprias cargas. |
| One session in this period. | Uma sessão neste período. | Um treino neste período. |
| Plays from YouTube, and only once you tap | Reproduz a partir do YouTube, e só quando você toca | Vem do YouTube e só carrega quando você toca |
| Press back again to exit | Pressione voltar novamente para sair | Toque em voltar de novo para sair |
| Rest timer, right on the lock screen | Timer de descanso, direto na tela de bloqueio | Cronômetro de descanso, direto na tela de bloqueio |
| Seated good morning (10 reps) | Bom dia sentado (10 reps) | Good morning sentado (10 reps) |
| Sessions and timed sets | Sessões e séries por tempo | Treinos e séries por tempo |
| Squats, presses, rows and friends get a ramp. Curls and raises start cold. | Agachamentos, supinos, remadas e companhia ganham subida. Roscas e elevações começam a frio. | Agachamentos, supinos, remadas e companhia ganham aproximação. Roscas e elevações começam sem aquecimento. |
| Streaks, the Coach, themes, the lot. | Sequências, o Treinador, temas, tudo o que tem direito. | Sequências, o Treinador, temas e tudo mais. |
| Swap session | Trocar sessão | Trocar treino |
| swipe gesture | deslizar gesto | gesto de deslizar |
| Switching the unit offers to convert every stored weight. | Ao mudar de unidade é oferecido converter todos os pesos salvos. | Ao mudar a unidade, o app oferece converter todos os pesos salvos. |
| The short break between the bursts of a rest-pause set. | A pausa curta entre os blocos de uma série rest-pause. | A pausa curta entre as mini-séries de uma série rest-pause. |
| Timer alerts | Alertas do temporizador | Alertas do cronômetro |
| Weight and reps buttons | Botões +/− de peso e repetições | Botões +/− de carga e repetições |
| Welcome! | Bem-vindo! | Boas-vindas! |
| Work sets | Séries efetivas | Séries de trabalho |
| You have v{0} | Tens a v{0} | Você tem a v{0} |
| Your own mix. Flip the switches below. | Sua própria mistura. Mexa nos interruptores abaixo. | Do seu jeito. Ligue e desligue abaixo. |
| Your training on paper: totals, charts, new bests and every set. Frame it, print it or send it to your coach. | Seu treino no papel: totais, gráficos, novos recordes e cada série. Coloque num quadro, imprima ou envie para o seu treinador. | Seu treino no papel: totais, gráficos, novos recordes e cada série. Emoldure, imprima ou envie para o seu treinador. |

## Pontos em aberto (para o dono decidir)

- **`Copy`** fica "Cópia": a mesma chave é usada como sufixo do nome de rotina duplicada ("Push (Cópia)") e como botão de confirmar em "Copiar de {0}?" (`sheets.jsx:1106`). Uma tradução não serve para os dois; "Cópia" é a menos ruim.
- **`Weight ({0})`** e **`Weight`** ficaram "Peso (…)": a chave aparece tanto no campo de peso corporal quanto no editor de carga das séries.
- **Superset** mantido em inglês (o grupo pode ter 3+ exercícios). Se preferir "bi-set"/"conjugado", é só trocar.
- **Nomes dos modelos** ("Push / Pull / Legs", "Superior / Inferior", "Corpo inteiro", "5×5") mantidos; só a descrição do PPL virou "Peito/ombro/tríceps, costas/bíceps e pernas". As rotinas criadas continuam com nomes em inglês por desenho (`starter.js:5-7`).
- Textos de Natal/Halloween (neve, inverno em dezembro, outubro) foram só traduzidos; o hemisfério continua o do original.
- Strings de Treinador/Coach ainda visíveis fora das telas ocultas (ex.: "Semana do Coach", "planos do Coach") não foram mexidas.
