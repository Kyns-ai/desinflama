# As telas dos dois apps, por dentro — o que copiar de cada uma

Capturado direto da App Store deles em 02/08/2026. As imagens estão em `docs/referencia/`.
Cada tela abaixo diz **o que eles fazem** e **o que a gente copia**.

---

## SIMPLE — 18M downloads, 400 mil avaliações, App of the Day

### `simple-0.jpg` — a capa da loja
**Eles:** *"Only app you need to lose weight"* + gráfico de projeção de peso com balão **"Goal 160 lbs"** +
três selos de louros: **App Store App of the Day** · **400K reviews ★★★★★** · **18M downloads**.

**Copiar:** a capa é promessa + gráfico de projeção + selos. Nosso equivalente do gráfico é a
**projeção datada** que o app já tem (72h / 7d / 21d) — ela vira a imagem da capa.

---

### `simple-1.jpg` — a HOME (a tela mais importante de todas)
**Eles:** legenda *"Success made Simple and fun!"*
- Header: `Home` + **contador de ofensiva `🔥 1/30`** + foto da pessoa
- **Blinky** no centro — um monstrinho roxo peludo — com balão: *"Hey, I'm Blinky, your bestest buddy"*
- **4 anéis de tracker em linha**, cada um com `+`: refeições `0/3` · água `0/1.5 l` · passos `0/5.000` ·
  jejum `Start fast`
- **Card COACH AVO** com mensagem proativa: *"Over the next 3 days, I'll gather your behavioral data to
  **supercharge your program** ⚡ and bring your goals within reach. Let's make it count!"* — com uma barra
  de progresso roxo→rosa
- **"Today's plan"** com os itens do dia

**Copiar (é o desenho da nossa Home):**
- Ofensiva no topo, no formato `🔥 dia/total` (o nosso é `🔥 3/21`)
- **4 anéis do Desinflama:** refeições · água · check-in · calmaria
- **Card da Nutri IA proativa** — ela FALA primeiro, sem a cliente perguntar. Ex.: *"Nos próximos 3 dias
  eu vou aprender o seu padrão pra afinar o seu protocolo. Bora?"*
- "Seu dia de hoje" logo abaixo (já existe)

---

### `simple-2.jpg` — escolha da personalidade do coach
**Eles:** *"AI Coach to crush your goals"* → tela **"Pick your Coach Avo personality — You can change it
later"** com 6 cards com foto de pessoa e uma frase de estilo:
*Build confidence by pushing your limits* (marcado como **RECOMMENDED**) · *Harness mindset as your
superpower* · *Reflect, learn, and rewrite patterns* · *Practice self-care and compassion* ·
*Systematic, habit-…* → botão **"Meet my coach"**

**Copiar:** a cliente escolhe **como a nutri fala com ela**. Três estilos bastam:
*"Firme comigo — me cobra"* · *"Gentil — me acolhe"* · *"Direta ao ponto — só o que fazer"*.
Isso muda uma linha do prompt da IA e aumenta muito a sensação de "é minha nutri".

---

### `simple-4.jpg` — O FEEDBACK DA REFEIÇÃO (a vitória dos 5 minutos, exatamente)
**Eles:** *"Get instant nutritional feedback on your meals"*
- O **Blinky aparece verde** (ele muda de cor conforme o resultado) com balão **"Peak Weight Loss!"** e um
  arco/medidor em volta
- **Card COACH AVO** com 👍 / 👎 no canto e o veredito escrito:
  *"That oatmeal with nut butter and berries is a **perfect refuel after your kickboxing** — the fiber and
  protein will keep you **satisfied and energized** as you recover. Keep this winning streak going."*
- **Dois chips de pergunta pronta:** `How will this meal make me feel? 🤔` e `Portion size suggestions`
- Abaixo: **"Breakfast vs daily targets"** — Proteína `33g de 90g` com barra, e a decomposição por
  ingrediente: *"12g eggs, 10g bacon, 7g baked beans, 3g toast, 1g tomato"*

**Copiar (tela por tela, trocando o assunto):**
- Personagem que **muda de cor** conforme o veredito (verde/amarelo/vermelho = o nosso Semáforo, que já
  existe em `content/semaforo.ts`)
- Veredito escrito com **destaque em negrito na parte que importa**
- 👍/👎 no card — serve pra nutri melhorar o prompt depois
- **Chips de pergunta pronta:** `Como isso vai me cair? 🤔` · `O que eu troco?`
- A decomposição por ingrediente vira: **quais itens do prato mexem com o SEU tipo de inchaço** — em vez
  de gramas de proteína, mostra `lactose` `frutano` `polióis` por alimento

---

### `simple-5.jpg` — a barra de abas e a tela de registro
**Eles:** *"Log meals, drinks, and fasting in seconds"*
- **Tab bar de 4: `Home` · `Coach` · `Track (+)` · `Explore`** — o Coach tem lugar fixo, é produto
- Régua da semana `M T W T F S S` com o dia de hoje circulado
- `0 / 3 meals — Nutrition` com botão laranja **"Log food"** e, ao lado, um **botão de câmera com ✨**
- `Steps 2.100/4.000` com barra · `Movement 0/30 min` · `Hydration 0/2 L` com lápis e `+`

**Copiar:** a nossa tab bar vira **`Hoje` · `Nutri IA` · `Registrar (+)` · `Programa`**. O botão de câmera
com ✨ ao lado do registro é o atalho da foto — é assim que a análise vira hábito diário, não novidade
de uma vez só.

---

## REVERSE HEALTH — 1,1 milhão de mulheres

### `rh-1.jpg` — a capa
**Eles:** **"FINALLY. FITNESS & NUTRITION JUST FOR WOMEN 40+"** e, destacado em rosa,
**"Join 1M+ women"** *already feeling stronger, leaner, & more radiant* ★★★★★

**Copiar:** a estrutura exata — `FINALMENTE.` + o que é + **pra quem é** + número de prova + estrelas.

---

### `rh-3.jpg` — o Meal Plan
**Eles:** *"Feel full, eat well, & still **lose weight** with personal **meal plans**"*
- Abas: **Planner · Recipes · Supplements**
- **Calendário da semana** (Mon 25 → Sun 31) com o dia ativo em círculo azul
- **"Add to shopping list"** em destaque no topo, ao lado de "Calendar"
- Cards de refeição: foto + tipo (`SNACK` / `BREAKFAST` / `LUNCH`) + **tempo de preparo** (`10 min`) + nome

**Copiar:** o `/cardapio` do Desinflama já é isso, mas falta: **tempo de preparo em cada card** e o
**"Adicionar à lista de compras"** no topo (hoje a lista é uma aba separada — lá é um botão à mão).

---

### `rh-4.jpg` — a Home deles
**Eles:** *"Hi there!"* + régua de dias `24 25 26 27…` (os dias feitos ficam em círculo rosa) +
**anel grande de contagem regressiva** com `REMAINING 7:11:53` no meio + botão largo **"End fasting"** +
`Start fast Wed 18:00 / End fast Thu 10:00` + uma seção **STORIES** embaixo

**Copiar:** o **anel grande no meio da home** com UMA coisa acontecendo agora. No nosso caso, o anel do
dia (check-in + missão + água). E a régua de dias com os concluídos preenchidos — o app já tem
(`WeekStrip`), mas é discreta demais perto do que eles fazem.

---

### `rh-5.jpg` — o Tracker
**Eles:** *"Track and celebrate every milestone with holistic **wellness tools**"*
- Régua de dias no topo
- **Weight** com `Current: 109.1 lbs` × `Target: 109 lbs` lado a lado e botão **"Log weight"**
- **Gráfico dos últimos 7 dias** com um ponto marcado num balão azul: `110.2 lbs — Aug 30`
- Abaixo, **Meal Plan** com botão `Log meal`

**Copiar:** o par **"onde estou × onde quero chegar"** lado a lado, e o **balão no ponto do gráfico**.
Nosso número não é peso — é o **Índice Intestinal** e a **escala de inchaço 0–10**. O `/progresso` já tem
o gráfico, falta o par atual×alvo e o balão.

---

### `rh-6.jpg` — comunidade
**Eles:** *"Join **our community** for **support & tips** from ladies just like you!"* — duas mulheres reais
batendo um high-five.

**Copiar:** eles vendem **pertencimento** como feature de produto, com destaque igual ao das outras. Para
o Desinflama isso é o grupo de WhatsApp/Telegram que você já pretende ter — merece card próprio dentro do
app, não um link escondido no rodapé.

---

## Resumo: as 6 coisas que os dois fazem e o Desinflama não faz

| # | O que eles fazem | Onde eu aplico |
|---|---|---|
| 1 | **Personagem que fala com a pessoa** e muda de cor conforme o resultado (Blinky) | Home + feedback da refeição |
| 2 | **Coach de IA com aba fixa e nome próprio**, que fala primeiro sem ser perguntado | Nova aba `Nutri IA` |
| 3 | **Escolher a personalidade do coach** | Uma tela no Dia 0, muda uma linha do prompt |
| 4 | **Anéis de tracker no topo da home**, com `+` em cada | Home |
| 5 | **Chips de pergunta pronta** embaixo de cada resposta da IA | Nutri IA |
| 6 | **Comunidade como feature**, com card próprio | Home / Programa |
