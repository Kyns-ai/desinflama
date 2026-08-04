# Handoff — 04/08/2026

> Escrito no fim de uma sessão longa, para a próxima começar sem depender da
> conversa. Leia isto **antes** do `docs/PLANO.md`: o plano é de 02/08 e várias
> decisões mudaram depois dele.

## Como entrar e testar em 5 segundos

```
https://desinflama-production.up.railway.app/demo          # entra direto, dados semeados
https://desinflama-production.up.railway.app/demo?zerar=1  # apaga tudo e cai no onboarding
```

Rodando local: `rm -rf .next && npm run dev -- -p 3210` e depois `/demo`.
A porta 3000 costuma estar ocupada por outro projeto do Ruyter.

## O que este produto é

App que **desinflama o intestino**. Emagrecer é consequência, não a promessa.

Duas regras que já custaram retrabalho e continuam valendo:

1. **Não é "uma nutricionista de IA".** A IA é função dentro do app (ler a foto
   do prato, tirar dúvida) e nunca se apresenta como profissional — é risco de
   CFN e é o oposto do posicionamento.
2. **Promessa, marca e preço são decisão do Ruyter.** Implementação é sua.

## Decisões do Ruyter que o PLANO.md não tem

| Decisão | Consequência |
|---|---|
| **A marca é ROSA** | rosa amora `#A8446A`/`#6A2440` sobre bege `#F5ECE8`. Onde o plano diz verde, leia rosa |
| **21 dias, não 14** | "14 é muito pouco". O arco é 14 (mapear gatilhos) + Reset de 21 (montar rotina) |
| **O quiz de venda é EXTERNO** | este app começa DEPOIS do login. Não construa funil de venda aqui |
| **Conversar com a nutri existe** | mas como FUNÇÃO (`/duvida`), entrando por dúvida concreta — nunca aba com nome e personalidade |
| **Cardápio pessoal** | ideia dele, e validada: o Homemade Method faz "gosto / não é pra mim" antes de mostrar o plano |

## Como ele trabalha (o que mais economiza tempo saber)

- **"Copie o que der certo."** Não invente e peça pra ele escolher. Abra
  `docs/referencia/` e responda "o que os que deram certo fazem aqui?". Errei
  isso nesta sessão inventando três logos; a resposta certa estava no
  `iam-01.jpg`.
- **Nunca declare pronto sem prova real.** Rode, veja a tela, cheque o dado.
  Vários defeitos desta sessão (`/desafios` em 404, ilustrações desligadas no
  onboarding, barra cobrindo "Restaurar compra") só apareceram olhando.
- **Avise do problema antes que ele descubra.** Ele reage muito pior a
  descobrir sozinho do que a ser avisado.
- Mensagens dele vêm corridas, várias ideias emendadas. Decomponha antes de agir.

## Estado do produto

**Feito e provado no navegador:** fundação visual em rosa · Hoje com o Broto
(esqueleto do Finch) · Prato com a Nota Desinflama (ZOE) · Prazeres (Habitica +
WeightWatchers) · cards de compartilhar (I am) · cardápio pessoal · admin com
21 rotas espelhando o app · deploy dos 3 serviços no Railway.

**Onde estão as coisas:**

| O quê | Onde |
|---|---|
| Regra da nota do prato | `src/lib/notaPrato.ts` (+ 15 testes ao lado) |
| Personagem | `src/lib/broto.ts` e `src/components/broto/Broto.tsx` |
| Cardápio pessoal | `src/lib/cardapioPessoal.ts` |
| Economia de sementes | `src/lib/garden.ts` (só a tabela) |
| Promessa — **fonte única** | `src/content/promise.ts` |
| Admin | `admin/` (importa `../src` via `externalDir`) |

## Armadilhas desta base

1. **`sage` → `rose`**: a paleta foi renomeada. Um `sed` sem `\b` corrompe
   "message"/"mensagem" — já aconteceu aqui. Use fronteira de palavra.
2. **O campo `emoji` em `src/content/*` NÃO é para exibir** — é chave de busca
   da arte em `cards-art.json`. Um hook barra emoji em UI.
3. **O admin não pode ter root `admin/` no Railway**: importa `../src`.
4. **`tsconfig.json` da raiz exclui `api/` e `admin/`** — são projetos Node
   separados. Incluir de volta quebra o build em máquina limpa.
5. **Cache do Turbopack já serviu paleta velha.** Comece com `rm -rf .next`.
6. **Railway: NÃO use o CLI nem o MCP** (estão deslogados de propósito). Use
   `node ~/.claude/scripts/railway.mjs`. Está no CLAUDE.md global; eu ignorei e
   perdi tempo.
7. **Status de deploy não prova que entrou.** Confira o HTML servido — quase
   declarei pronto com o `<meta description>` antigo no ar.

## O que falta — separado por quem trava

**Trava no Ruyter (não decida por ele):**
- Aprovar a ficha das lojas (Seção 11 do `STORE_SUBMISSION.md`)
- Prova social e garantia no paywall — números reais ou nada
- Fotografia real de mulher (I am e Reverse Health usam; a gente não tem
  nenhuma). É o que mais separa de "app bonito genérico"

**Trava em chave/infra:**
- `ANTHROPIC_API_KEY` na `api` — sem ela a foto não identifica nada
- Supabase nos três serviços — **sem ele o app não sincroniza entre aparelhos**
  (persistência local, por arquitetura) e a `api` guarda acessos em MEMÓRIA,
  que somem a cada restart
- RevenueCat — a compra hoje é simulada

**Pode seguir sem ninguém:**
- Capturas novas para as lojas (as antigas são da paleta verde)
- `/aprender`, `/ciencia`, `/registrar` e mais 5 telas: funcionam e estão em
  rosa, mas ainda empilham card. A receita que resolveu `/mapa` e `/progresso`
  está lá: campo de cor no topo com o que ela veio ver, UM cartão em destaque,
  resto em faixa compacta
- Widget de tela de bloqueio (nativo) — a maior alavanca de retorno diário do
  plano, e a peça mais cara

## Comandos

```
npm run typecheck && npx eslint src/ && npm test && npm run build
cd admin && npx tsc --noEmit && npm run build
node ~/.claude/scripts/railway.mjs deploys desinflama
node ~/.claude/scripts/railway.mjs esperar desinflama
```

Antes de dar qualquer coisa por pronta: os quatro de cima, mais o print da tela.
