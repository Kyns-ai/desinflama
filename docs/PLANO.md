# PLANO DE REFUNDAÇÃO DO DESINFLAMA

## ONDE ISTO ESTÁ — atualizado em 03/08/2026

> **A cor mudou: a marca é ROSA** (decisão do Ruyter no meio da execução).
> Rosa amora `#A8446A` / `#6A2440` sobre bege rosado `#F5ECE8`, tinta
> marrom-vinho. Onde este documento fala em verde, leia rosa. A escolha se
> apoia na Reverse Health (`docs/referencia/rh-*.jpg`), que é rosa e tem
> 1,1 milhão de mulheres — não era só gosto.

| Fase | Situação |
|---|---|
| 0 · Fundação visual | **feita** — tokens medidos do I am, emoji fora da UI, hex órfão eliminado |
| 0b · Todas as telas | **parcial** — todas receberam a paleta e funcionam; só entrada, Hoje, Prato, Prazeres e Eu foram REESTRUTURADAS. As ~15 internas ainda têm o empilhamento de cards antigo |
| 1 · Hoje + Broto | **feita** — Broto em SVG (16 poses), não MUAPI: ver "desvios" abaixo |
| 2 · Prato + Nota | **feita** — `lib/notaPrato.ts` com 15 testes; montagem manual por catálogo além da foto |
| 3 · Prazeres | **feita** — loja, teto semanal, "Estava no seu plano" |
| 4 · Compartilhar | **feita** — frase do dia + 4 cards de conquista, via `html-to-image` |
| 5 · Promessa e vitrine | **feita, aguardando o Ruyter** — promessa (21 dias), problema e projeção na landing; paywall com preço/dia; ficha das lojas redigida na Seção 11 do `STORE_SUBMISSION.md`, marcada como pendente de aprovação (texto de loja é promessa pública) |
| 6 · Admin (fora do plano original) | **feito** — 21 rotas espelhando o app, lendo o conteúdo REAL via `externalDir`; schema da Onda 2, agregados de produto e a tela Sistema (que diz o que é real e o que é demo). Usuárias/leads/assinaturas seguem em mock até haver Supabase |
| 7 · Cardápio pessoal (pedido do Ruyter) | **feito** — "gosto / não é pra mim", cardápio montado por preferência + tolerância, troca por refeição, tirar dúvida |

### Decisões do Ruyter tomadas depois deste plano

1. **A marca é ROSA** (não o verde escrito aqui).
2. **21 dias, não 14** — "14 é muito pouco". O programa já era 14 + Reset de
   21, então a promessa passou a falar do arco completo.
3. **O quiz longo de venda é EXTERNO.** Este app começa depois do login; não se
   constrói funil de venda aqui dentro.
4. **Conversar com a nutri continua existindo**, mas como FUNÇÃO ("tirar
   dúvida", entrando por uma pergunta concreta com o contexto carregado), nunca
   como aba com nome e personalidade — isso é o que o plano manda matar.
5. **Cardápio pessoal** ("gosto / não é pra mim") entrou como feature nova.

### Desvios conscientes deste plano

1. **O Broto é SVG, não arte gerada no MUAPI.** O plano previa 12 poses
   geradas, com plano B em código. Ficou o plano B por decisão técnica:
   modelo de imagem erra a identidade do personagem entre poses, e 16
   desenhos "quase iguais" é exatamente o que lê como feito por IA. Em vetor,
   cabeça/olhos/vaso são o mesmo código. Se o Ruyter preferir a arte gerada, é
   trocar o componente.
2. **A economia de sementes entrou já na Fase 1**, não na 3: o nível do Broto
   depende de `seedsLifetime` e não dava para adiar a separação saldo × acumulado.
3. **O catálogo manual de alimentos não estava no plano.** Entrou porque a
   `ANTHROPIC_API_KEY` não está na máquina — sem ele a aba Prato ficaria morta
   e não testável.

### O que falta — e o que trava em quem

**Trava no Ruyter (não dá pra eu decidir):**
1. **Aprovar a ficha das lojas** (Seção 11 do `STORE_SUBMISSION.md`).
2. **Prova social e garantia no paywall** — a estrutura cabe; os números são
   reais ou não existem, e inventar aqui é o pior tipo de mentira.
3. **Fotografia real de mulher** na home, onboarding e paywall. É o que I am e
   Reverse Health fazem e o que mais separa o nosso de "app bonito genérico".
   Banco de imagem × geração × ensaio é decisão de marca e de orçamento.

**Trava em infraestrutura:**
4. Supabase de verdade (o admin já lê as tabelas; falta a chave).
5. `ANTHROPIC_API_KEY` para a identificação por foto.

**Pode seguir sem ninguém:**
6. Capturas novas para as lojas, nas 7 telas listadas.
7. Widget de tela de bloqueio (nativo) — a maior alavanca de retorno diário
   que existe no plano, e a peça mais cara.

---


> Documento mestre. Escrito em 02/08/2026 para ser executado na sessão seguinte,
> depois de um `/clear`. Quem pegar isto não precisa de contexto de conversa:
> está tudo aqui — o que o produto é, de quem a gente copia o quê, as telas, a
> economia de pontos, a identidade visual e a ordem de execução.
>
> Referências visuais em `docs/referencia/`. Pesquisa de mecânica em
> `docs/MECANICAS-VALIDADAS.md`. Telas do Simple/Reverse Health (rodada
> anterior) em `docs/TELAS-REFERENCIA.md` — servem de apoio, não são o esqueleto.

---

## 0. O QUE O PRODUTO É

**Desinflama é um app que desinflama o intestino.** Emagrecer é consequência, não
a promessa inteira: quando o intestino desinflama, melhoram também **energia,
sono, humor e pele**.

A IA **não é o produto**. Ela é uma função dentro do app — olhar a foto do prato
e sugerir substituição. Nunca se apresenta como nutricionista (a nutricionista
real do programa é a autoridade, e IA no papel de profissional é risco de CFN).

### A promessa (a copiar da estrutura da ZOE)

A ZOE vende assim: **"Eat for gut health, not just calories"** + *"Feel healthier.
In weeks"* + resultado relatado em ensaio próprio (mais energia, sono, humor,
menos fome). É promessa grande sustentada por frase honesta.

A nossa, mesma estrutura:

> **Coma para desinflamar, não para contar caloria.**
> Em 14 dias você descobre o que incha VOCÊ — e junto vêm energia, sono e pele.

Regras de copy que valem em todo o app:
- Resultado sempre como **relato** ("mulheres que fizeram os 14 dias relatam…"),
  nunca como garantia.
- Fonte do lado, do jeito que a tela `/ciencia` já faz.
- Ordem dos benefícios: **inchaço → energia → sono → humor → pele** (força da
  evidência decrescente; a pele é a mais fraca, entra por último e com cuidado).

> **Decisão do Ruyter, não minha:** quais benefícios entram na venda e como a
> promessa é escrita no funil. O app entrega os quatro.

---

## 1. DE QUEM A GENTE COPIA O QUÊ (e por que só destes)

Três apps, três papéis. Não há quarto. Mais referência agora vira Frankenstein —
o risco que o Ruyter já apontou.

| App | Números | O que a gente copia | O que a gente NÃO copia |
|---|---|---|---|
| **Finch** | ~9 mi de usuários/dia, ~US$3 mi/mês, 2º grátis em Saúde nos EUA | O **laço com um personagem** que reage ao seu cuidado, a estrutura da home (cenário em cima, cartão do dia embaixo) e a **ausência total de punição** | O visual infantil azul, a fantasia de aventura, amigos/multiplayer |
| **ZOE** | maior estudo de nutrição do mundo, ensaio próprio | A **foto do prato virando nota 0–100** com veredito, o cartão da refeição, o medidor do dia e a forma de prometer | O teste de fezes (exige laboratório), o vocabulário de microbioma que a gente não mede |
| **I am** | 12,5 mi de downloads na App Store, 9,9 mi no Google Play, 4,8★ com 1,2 mi de avaliações | A **estética** (bege quente, serifada, foto bonita), o **card compartilhável** que a mulher posta, e a frase do dia | Afirmação genérica de autoajuda sem ligação com o corpo dela |

Mais duas, só como regra de economia (mecânica já extraída, sem nova pesquisa):
**Habitica** (loja de recompensas da vida real com preço) e **WeightWatchers**
(orçamento semanal de prazer). Ver `MECANICAS-VALIDADAS.md`.

---

## 2. REFAZER OU REAPROVEITAR? — **Reaproveitar o motor, refazer a casca**

Decisão tomada, com o motivo:

**Fica (é o que custou caro e ninguém vê no print):**
- Conteúdo: 21 dias de aulas, receitas, cardápio da semana, lista de compras,
  auditoria FODMAP, semáforo, Mapa de Tolerância. É o ativo mais caro do projeto.
- Motor: `src/store/useAppStore.ts`, persistência (IndexedDB/Preferences),
  `lib/journey.ts`, `lib/computeGutScore.ts`, `lib/streak.ts`, `lib/cycle.ts`.
- Backend `api/`: webhook de compra, acesso por código do funil, endpoints de IA.
- Capacitor (iOS/Android), Next 16 com `output: 'export'`, RevenueCat, Supabase.

**Sai / é refeito (é o que está feio e o que o Ruyter vê):**
- **Todas as telas**: layout, hierarquia, tipografia, cor. Hoje só `/inicio` e
  `/nutri` têm a identidade nova — as outras ~23 estão no visual antigo, e a
  primeira tela que se vê (login) é uma delas.
- A aba **Nutri IA**, o nome, a escolha de personalidade e o chat de bolhas.
- O `/jardim` como tela isolada: vira o personagem, que passa a morar na home.

Refazer do zero jogaria fora conteúdo e motor por causa de CSS. Não se faz.

---

## 3. ARQUITETURA NOVA

### Barra de abas (4 + botão central)

```
   Hoje        Programa      ( 📷 )      Prazeres        Eu
   Broto +     trilha,       foto do    sementes,    progresso,
   dia dela    cardápio,     prato      loja de      mapa de
               biblioteca               recompensa   tolerância
```

- O **botão central é a câmera do prato** — é a ação mais frequente e a que dá
  prazer imediato (a "vitória dos 5 minutos"). É onde a ZOE também põe.
- O check-in sai da barra e vira a primeira linha do cartão do dia, na Hoje.
- `/nutri`, `/jardim`, `/bem-vinda` deixam de existir como destino.

### As cinco telas, com o esqueleto de quem

**1. HOJE** — esqueleto do Finch (`docs/referencia/finch-02.jpg`)
```
┌─────────────────────────────┐
│  cenário ilustrado          │  ← metade de cima: o BROTO no cenário,
│      🌱 (o Broto)           │    reagindo ao cuidado de hoje
│                             │
│  ┌───────────────────────┐  │  ← cartão branco flutuando por cima
│  │ Dia 6 · Remoção   3/4 │  │
│  │ ○ Check-in de hoje    │  │
│  │ ✓ Aula do dia         │  │
│  │ ○ Água (1,5 L)        │  │
│  │ ○ Sem gatilho hoje    │  │
│  └───────────────────────┘  │
│  frase do dia (compartilhar)│  ← card do I am, com logo e @
└─────────────────────────────┘
```

**2. PRATO** — esqueleto da ZOE (`zoe-02.jpg`, `zoe-03.jpg`)
- Topo: **medidor em arco 0–100** com o número grande e a palavra do veredito —
  "Nota Desinflama de hoje".
- Abaixo: linha das refeições de hoje em miniatura, cada uma com sua notinha
  colorida no canto.
- Cada refeição abre o **cartão da refeição**: foto sangrando, nome do prato,
  nota no círculo colorido, veredito, ingredientes com o grupo FODMAP e **a troca
  de hoje**.

**3. PROGRAMA** — trilha dos 21 dias (já existe, só reveste), cardápio da semana,
lista de compras, biblioteca da nutri, bônus.

**4. PRAZERES** — esqueleto do Habitica (`habitica-rewards.jpg`)
- Saldo de **sementes** no topo.
- Lista de prazeres com preço: `Um quadradinho de chocolate 70% — 30` ·
  `Taça de vinho — 80` · `Brigadeiro — 100` · `Pizza de sexta — 200`.
- Ela pode **criar o próprio prazer** com o próprio preço.
- Ao resgatar, a tela diz: **"Estava no seu plano."** Nunca "você saiu da dieta".

**5. EU** — progresso (gráfico do índice, sintomas), Mapa de Tolerância, ciclo,
perfil, assinatura.

---

## 4. O BROTO (o personagem)

**A ideia:** o app já tem jardim, sementes e níveis (`lib/garden.ts`:
semente → broto → planta → florada). O personagem não é invenção nova: é o
jardim que existe virando **uma criatura-brotinho** que mora na home.

- **Nível** (semente → broto → planta → florada) vem das sementes **acumuladas na
  vida** — nunca diminui quando ela gasta na loja.
- **Humor de hoje** vem do cuidado de hoje: 0 tarefas = desanimado · 1–2 = neutro
  · 3+ = animado · dia fechado = comemorando.
- **Nunca adoece, nunca morre, nunca some.** A pesquisa de gamificação é dura:
  punição visível vira ansiedade e a pessoa abandona o app. O Finch, que é o
  maior do mundo nisso, não pune ninguém. O nosso desanima, no máximo.
- Ele fala uma frase curta por dia, do conteúdo local (custo zero de IA).

**Produção da arte:** 4 estágios × 3 humores = 12 poses, geradas no MUAPI com
prompt travado (vetor plano, paleta da marca, fundo transparente), limpas e
salvas em `public/img/broto/`. Uma pose só na primeira leva para aprovação do
Ruyter antes de gerar as 12.

---

## 5. A ECONOMIA DE SEMENTES

**Ganha semente cuidando** (não é caloria, é cuidado):

| Ação | Sementes |
|---|---|
| Check-in do dia | 10 |
| Aula do dia | 10 |
| Água do dia | 5 |
| Cada tarefa do dia | 5 |
| Foto de refeição (máx. 2/dia) | 5 |
| Passar o dia sem o gatilho dela | 15 |
| Fechar o dia | 20 |
| Fechar a semana inteira | 50 |

Média de quem faz tudo: ~60–70/dia. Uma taça de vinho (80) sai em pouco mais de
um dia bem feito; a pizza (200) exige três dias.

**Gasta em prazer real.** Regras que vêm do WeightWatchers:
- O prazer **está no plano** — a tela nunca chama de recaída.
- Existe um teto semanal sugerido ("seu prazer da semana"), para não virar
  compulsão financiada por pontos.
- Resgatou? O check-in do dia seguinte pergunta como o corpo reagiu — e isso
  vira dado do Mapa de Tolerância. **O prazer também ensina.**

---

## 6. A NOTA DESINFLAMA (a foto do prato)

Resposta à pergunta do Ruyter: **sim, a foto tem que mostrar o quanto aquilo
inflama ELA** — é o nome do app, é o que nenhum contador de caloria faz, e é o
que a gente consegue personalizar de verdade.

**Como funciona (e por que é melhor que a ZOE para o nosso caso):**
- A IA só faz o que IA faz bem: **identificar os alimentos** da foto e a que grupo
  FODMAP cada um pertence.
- A **nota é calculada por nós**, no aparelho, com regra determinística:

```
nota = 100
para cada alimento identificado:
    peso = peso_do_grupo_FODMAP
    fator = sensibilidade dela àquele grupo   (Mapa de Tolerância:
              reagiu forte = 1,0 · moderou = 0,6 · tolerou = 0,15 ·
              não testado = 0,5)
    ajuste = perfil dela  (fermentação → frutano/GOS pesam mais;
              retenção → sódio/ultraprocessado; lentidão → pouca fibra;
              estresse → cafeína e refeição apressada)
    nota -= peso × fator × ajuste
```

- Faixas: **80–100** "Cai bem pra você" · **50–79** "Depende da porção" ·
  **0–49** "Esse costuma te inchar".
- Vantagens: mesma foto dá sempre a mesma nota; dá para explicar de onde veio;
  não paga token para calcular; e **a nota muda conforme ela descobre as próprias
  tolerâncias** — a ZOE não faz isso, a nota deles é do alimento, a nossa é dela.

**Sobre microbiota (a outra pergunta):** o que a ZOE tem de teste de fezes exige
laboratório e kit — a gente **não pode prometer isso hoje**, seria mentira. O que
dá para fazer, e é honesto, é o **"Perfil do seu intestino"**: um retrato montado
com os dados dela (tipo de inchaço, testes de reintrodução, sintomas ao longo do
tempo). Se um dia fizer sentido, um laboratório parceiro no Brasil vira upsell —
decisão do Ruyter, não requisito do plano.

---

## 7. A SEÇÃO DE COMUNIDADE / EFEITO MANADA (I am)

O que faz o I am ter 12,5 milhões de downloads não é a frase: é **a frase virar
imagem bonita que a pessoa posta**, com a marca junto.

**No Desinflama:**
- **Frase do dia** na home, sobre imagem bonita, com **logo + @desinflama** no
  canto. Um toque compartilha no Stories (a lib `html-to-image` já está no
  projeto).
- **Cards de conquista**, que são o que ela realmente quer postar:
  *"7 dias sem inchaço"* · *"Descobri meu gatilho: lactose"* ·
  *"Meu prato hoje: nota 92"* · *"Dia 14 concluído"*.
- Biblioteca de frases por momento: manhã, TPM, dia difícil, vitória, recaída.
- **Widget de tela de bloqueio** é o motor de crescimento deles — exige código
  nativo (Capacitor não entrega de graça). Fica para depois de as fases 1–4
  estarem de pé; é a maior alavanca de retorno diário que existe neste plano.

---

## 8. IDENTIDADE VISUAL — "deixar bonito"

O diagnóstico do feio: tudo é cartão branco sobre creme, com 5% de saturação,
sem foto e sem hierarquia. A referência que resolve isso para este público é o
**I am**: bege quente, serifada grande, foto de verdade, muito ar.

**Direção (o esqueleto é do I am, a identidade continua nossa):**
- **Base**: bege/creme quente (o creme atual serve) com **contraste bem maior** no
  texto — hoje o texto principal está claro demais.
- **Um verde só, escuro e sério** (o `sage-dark` atual) para o campo de cor e a
  marca; o coral vira acento **raro** (uma coisa por tela).
- **Fraunces** (serifada, já instalada) grande nos títulos — é o que dá cara de
  revista em vez de painel; Inter só em dado e rótulo.
- **Foto de verdade** nas receitas, no cardápio e nos cards de compartilhar — o
  projeto já tem `public/img/recipe-*.jpg`.
- **Ilustração** só no Broto e no cenário da home.
- Sombra suave e quente (já existe em `--shadow-*`), zero gradiente arco-íris,
  zero emoji na interface (regra travada do `~/.claude/DESIGN.md`).

**Portão de qualidade, por tela:** abrir no Chrome DevTools a 390px, comparar com
a referência correspondente em `docs/referencia/`, medir espaçamento e tamanho no
CSS computado, corrigir, printar. Nenhuma tela é dada por pronta sem print.

---

## 9. ORDEM DE EXECUÇÃO (as fases, na ordem)

> Cada fase termina com: `npm run typecheck`, `npx eslint` nos arquivos tocados,
> `npm run build`, print de cada tela no navegador e um commit com a prova.
> Sessão de dev: `rm -rf .next && npm run dev` (o cache do Turbopack já serviu
> paleta velha — ver `desinflama-ambiente-dev` na memória).

### FASE 0 — Fundação visual (a que mata o "tá feio")
1. Reescrever os tokens em `src/app/globals.css`: contraste do texto, escala
   tipográfica com a Fraunces grande, um acento só.
2. Restaurar os componentes base (`src/components/ui/*`) na nova régua.
3. **Passar em TODAS as telas**, começando pelas de entrada: `/` (landing),
   `/auth`, `/entrar`, `/onboarding`, `/paywall`. Depois as internas.
4. Critério de aceite: nenhuma tela com o visual antigo; print de cada uma.

### FASE 1 — Hoje + Broto
1. Gerar 1 pose do Broto no MUAPI, mostrar ao Ruyter, então gerar as 12.
2. Refazer `/inicio` no esqueleto do Finch (cenário + cartão do dia).
3. Ligar humor do Broto ao cuidado do dia; nível às sementes acumuladas.
4. Aposentar `/jardim` como destino; migrar o que tem valor para a home.
5. Aceite: os três humores e os quatro níveis aparecem na tela; print de cada.

### FASE 2 — Prato (e o fim da "Nutri IA")
1. Apagar a aba `/nutri`, o nome, a escolha de estilo e o chat de bolhas.
2. Criar `/prato`: medidor do dia + refeições com nota.
3. Câmera no botão central; cartão da refeição no esqueleto da ZOE.
4. Implementar a **Nota Desinflama** em `src/lib/notaPrato.ts` (regra da seção 6)
   com teste unitário das faixas.
5. A IA passa a devolver só alimentos + grupos; o texto vira "o que trocar".
6. Aceite: mesma foto → mesma nota; nota muda quando o Mapa de Tolerância muda.

### FASE 3 — Prazeres (sementes e loja)
1. Separar no modelo: `sementesSaldo` (gasta) e `sementesTotais` (nível).
2. Tabela de ganho da seção 5 aplicada onde as ações já acontecem.
3. Tela `/prazeres` no esqueleto do Habitica + prazer personalizado dela.
4. Resgate com a frase "estava no seu plano" + pergunta no check-in seguinte.
5. Aceite: ciclo completo ganhar → resgatar → registrar reação, com print.

### FASE 4 — Compartilhar (efeito manada)
1. Frase do dia na home com imagem, logo e @.
2. Gerador de card de conquista (`html-to-image`) para os 4 marcos da seção 7.
3. Botão de compartilhar no Stories.
4. Aceite: imagem gerada aberta no navegador, com marca legível.

### FASE 5 — Promessa e vitrine
1. Aplicar a promessa da seção 0 na landing, no onboarding e no paywall.
2. Reescrever `STORE_SUBMISSION.md` com o texto novo e as capturas novas.
3. **Parar e trazer ao Ruyter** antes de publicar qualquer promessa.

### Depois (não entra agora)
Widget de tela de bloqueio (nativo), comunidade real (grupo), laboratório
parceiro para microbiota, sincronização entre aparelhos.

---

## 10. RISCOS E LIMITES (ditos antes, não depois)

1. **`ANTHROPIC_API_KEY` não está na máquina.** A identificação dos alimentos por
   foto não roda de ponta a ponta sem ela. A Nota Desinflama, por ser regra
   local, roda e é testável sem IA — por isso ela vem primeiro na Fase 2.
2. **Promessa de saúde no Brasil** (CFN/ANVISA): nada que soe a tratamento, e
   nenhuma IA no papel de profissional. A palavra final é do Ruyter.
3. **Arte do Broto tem custo** (MUAPI) e precisa de consistência entre as 12
   poses; se sair inconsistente, o plano B é ilustração vetorial simples feita em
   código, mais barata e mais fria.
4. **Widget nativo** exige Swift/Kotlin dentro do projeto Capacitor — é a peça
   mais cara do plano inteiro, por isso ficou fora das cinco fases.
5. **Cache do Turbopack** já serviu paleta antiga e fez parecer bug de código.
   Começar toda sessão com `rm -rf .next`.

---

## 11. COMO A PRÓXIMA SESSÃO COMEÇA

```bash
cd ~/desinflama
git log --oneline -3          # confere onde parou
rm -rf .next && npm run dev   # sobe o app (porta 3000 costuma estar ocupada)
```

1. Ler este arquivo e `docs/MECANICAS-VALIDADAS.md`.
2. Abrir `docs/referencia/finch-02.jpg`, `zoe-02.jpg`, `zoe-03.jpg`,
   `iam-01.jpg`, `iam-03.jpg`, `habitica-rewards.jpg` — são o alvo visual.
3. Começar pela **FASE 0**, tela por tela, com print de cada uma.
4. Não inventar funcionalidade fora deste plano. Se aparecer ideia nova, ela
   entra como proposta ao Ruyter — não como código.
