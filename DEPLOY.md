# Deploy no Railway

São **três serviços** no mesmo projeto, todos apontando para este repositório.
As configurações estão versionadas em `railway.*.json` — cada serviço aponta
para o seu arquivo no campo **Config-as-code path** das settings.

| Serviço | Root directory | Config | O que é |
|---|---|---|---|
| `app` | `/` | `railway.app.json` | O app da cliente (export estático servido por `serve`) |
| `admin` | `/` | `railway.admin.json` | O painel interno |
| `api` | `/` | `railway.api.json` | Nutri IA, acesso por código do funil e webhook de compra |

## Por que o admin NÃO pode ter root directory `admin/`

O painel importa o conteúdo real do app (`../src/content`, `../src/lib`) em vez
de manter cópia — é o que impede o catálogo do admin de divergir do app. Com
root directory em `admin/`, o build não enxerga `../src` e quebra.

Por isso os três serviços têm root `/` e o comando de build entra na pasta:
`cd admin && npm ci && npm run build`.

---

## 1. Login (você precisa fazer, é interativo)

```
railway login
```

## 2. Variáveis por serviço

### `app` — atenção ao momento

O app é **export estático**: as `NEXT_PUBLIC_*` são embutidas no BUILD, não
lidas em runtime. Mudar uma delas exige **redeploy**, não só reiniciar.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_REVENUECAT_WEB_KEY=
NEXT_PUBLIC_REVENUECAT_ENTITLEMENT=premium
NEXT_PUBLIC_API_URL=https://<url-do-servico-api>
```

Sem nenhuma delas o app sobe e funciona em modo mock (auth simulada, premium
simulado, dados locais). Serve para mostrar; não serve para vender.

### `admin` — sem `ADMIN_PASSWORD` o painel NÃO ABRE

```
ADMIN_PASSWORD=<senha forte>       # OBRIGATÓRIA em produção
ADMIN_SECRET=<hex de 32 bytes>     # assina o cookie
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=         # service-role: agrega todas as usuárias
```

Isso é de propósito. Em produção sem `ADMIN_PASSWORD` o login recusa todo
mundo e diz por quê. É melhor um deploy que não entra do que um painel aberto
na internet — que era exatamente o que aconteceria antes desta trava, porque
sem Supabase o admin caía na senha de demonstração.

A `SERVICE_ROLE_KEY` ignora RLS por natureza. Ela só pode viver aqui, nunca
numa variável `NEXT_PUBLIC_*`.

### `api`

```
ANTHROPIC_API_KEY=                 # sem ela, foto e dúvida ficam desligadas
MODELO_IA=claude-sonnet-5
LIMITE_ANALISES_DIA=5
SEGREDO_TOKEN=<hex de 32 bytes>    # obrigatório
SEGREDO_WEBHOOK=<segredo do checkout>
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ORIGENS_PERMITIDAS=https://<url-do-app>
```

Gerar os segredos:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Domínios

Gere um domínio para cada serviço, e depois volte para preencher:
- `NEXT_PUBLIC_API_URL` no `app` (com a URL da `api`) — **e refaça o deploy do
  app**, porque essa variável é embutida no build;
- `ORIGENS_PERMITIDAS` na `api` (com a URL do `app`).

---

## O que ainda não funciona depois de subir — e por quê

Dito antes para você não descobrir sozinho:

1. **O app não sincroniza entre aparelhos.** A persistência é local
   (IndexedDB/Preferences). Se a cliente trocar de celular, perde tudo. É
   decisão de arquitetura (offline-first), não bug — ligar o Supabase de
   verdade é trabalho real, não só preencher a chave.
2. **Sem `SUPABASE_URL` na `api`, os acessos do funil ficam em MEMÓRIA.** Todo
   restart do serviço derruba quem já validou o código. Isso é aceitável para
   testar e inaceitável para vender.
3. **Sem `ANTHROPIC_API_KEY`**, a foto do prato não identifica nada (a tela
   avisa e manda montar à mão) e a tela de dúvida diz que não está ligada.
4. **O admin mostra dados de demonstração** enquanto não houver Supabase —
   a própria tela `/sistema` diz isso em cima, para ninguém decidir em cima de
   número inventado.
