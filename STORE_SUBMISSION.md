# Guia de Submissão — Desinflama (App Store + Google Play)

Passo a passo para publicar o Desinflama nas lojas. O app é um **codebase único**
(Next.js estático + Capacitor) que roda em Web/PWA, iOS e Android. A assinatura é
unificada pelo **RevenueCat**.

---

## 0. Pré-requisitos

- **macOS + Xcode 16+** (iOS) e **Android Studio + JDK 17 + Android SDK** (Android).
- **Node 20+/22**, dependências instaladas (`npm install`).
- Contas: **Apple Developer** (US$99/ano), **Google Play Console** (US$25 único),
  **RevenueCat**, **Supabase**, e (para o funil web) **Stripe**.
- CocoaPods não é necessário — o Capacitor 8 usa **Swift Package Manager**.

## 1. Variáveis de ambiente (produção)

Copie `.env.example` → `.env.local` e preencha. Como o build é estático
(`output: 'export'`), as `NEXT_PUBLIC_*` são **embutidas no build** — gere o build
de produção com as chaves presentes:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_REVENUECAT_WEB_KEY=...      # Web Billing (Stripe)
NEXT_PUBLIC_REVENUECAT_APPLE_KEY=...    # Apple
NEXT_PUBLIC_REVENUECAT_GOOGLE_KEY=...   # Google
NEXT_PUBLIC_REVENUECAT_ENTITLEMENT=premium
```

Sem chaves, o app roda em mock — **nunca** publique um build mock (entitlement
simulado seria reprovado e é um risco de "premium falso").

## 2. Build e sincronização

```bash
npm run build          # gera ./out (estático)
npx cap sync           # copia out/ + plugins para ios/ e android/
npm run ios            # abre o Xcode
npm run android        # abre o Android Studio
```

**Importante (release):** confirme que `capacitor.config.ts` **não** tem
`server.url` (a env `CAP_SERVER_URL` é só para live-reload em DEV). Um build de
release apontando para o laptop é reprovado e quebra.

## 3. iOS — App Store Connect

1. **Bundle ID:** `com.desinflama.app` (Identifiers no developer.apple.com).
2. No Xcode: selecione o time de assinatura, ajuste `MARKETING_VERSION` (ex. 1.0.0)
   e `CURRENT_PROJECT_VERSION` (build).
3. **Capabilities:** Push (se for usar remoto — não obrigatório; usamos
   notificações **locais**), In-App Purchase.
4. **Permissões (já no Info.plist):** câmera e galeria (fotos de progresso),
   `ITSAppUsesNonExemptEncryption=false`.
5. **Ícones/splash:** já gerados por `@capacitor/assets` (Assets.xcassets).
6. **Product → Archive → Distribute App → App Store Connect.**
7. Em App Store Connect: ficha do app, screenshots (ver §6), descrição, política
   de privacidade (URL), classificação etária, e **Privacy Nutrition Labels** (§7).

### Assinaturas (Apple IAP via RevenueCat)
- Crie um **Subscription Group** e dois produtos: **Mensal** e **Anual**
  (auto-renewable). IDs sugeridos: `desinflama_monthly`, `desinflama_annual`.
- No RevenueCat: cadastre os produtos, crie a **Offering** `default` com os dois
  pacotes e o **Entitlement** `premium`. Cole a **Apple API key** no app.
- Preço do IAP pode ser maior que o web (absorve a comissão). O **anual é a âncora**.

## 4. Android — Google Play Console

1. **Application ID:** `com.desinflama.app`.
2. Em `android/app/build.gradle`, ajuste `versionCode`/`versionName`.
3. **Assinatura:** gere uma keystore de upload e configure (ou use Play App Signing).
4. **Build → Generate Signed Bundle (AAB).**
5. No Play Console: crie o app, suba o **.aab**, preencha ficha, screenshots,
   classificação de conteúdo (questionário), **Data Safety** (§7), e a política de
   privacidade (URL).

### Assinaturas (Google Play Billing via RevenueCat)
- Crie os produtos de assinatura **Mensal** e **Anual** no Play Console.
- No RevenueCat: cadastre os produtos, vincule à Offering `default` e ao
  Entitlement `premium`. Cole a **Google API key** + **Service Account** no RevenueCat.
- Permissão `com.android.vending.BILLING` já está no manifest.

## 5. Web (funil) — RevenueCat Web Billing + Stripe

- Conecte o **Stripe** ao RevenueCat (Web Billing), crie os mesmos produtos e a
  Offering. Cole a **Web Billing key** (`NEXT_PUBLIC_REVENUECAT_WEB_KEY`).
- O checkout web roda no próprio site (não é "compra externa" — é o canal web).
- Hospede o `out/` (Vercel/Netlify/qualquer estático). O mesmo build serve o PWA.

## 6. Screenshots (capturar)

Telas recomendadas (mobile ~390px): **Welcome**, **Mapa de Inchaço**, **Dashboard
(Gut Score)**, **Dia da Jornada**, **Registrar**, **Progresso (gráficos)**,
**Paywall**. Tamanhos: iPhone 6.7"/6.5" e (opcional) iPad; Android phone/tablet.

## 7. Privacidade (labels)

- **Dados coletados:** nome, e-mail (conta); dados de saúde/sintomas e uso (para
  funcionalidade). **Fotos ficam no aparelho/armazenamento privado.**
- **Não vendemos dados.** Pagamento processado por loja/Stripe (sem dados de cartão
  no app).
- Publique a **Política de Privacidade** (telas `/privacidade` e `/termos` já
  existem; exponha também numa URL pública do site).

## 8. ✅ Checklist de COMPLIANCE (onde apps são reprovados)

- [x] **IAP nativo de verdade** (StoreKit/Play Billing via RevenueCat) — sem isso a
      Apple reprova por "nada para comprar".
- [x] **App não é paywall morto:** tier grátis funcional (Dias 1–3) + login + IAP.
- [x] **Login de quem comprou na web** libera no app (RevenueCat App User ID =
      id do Supabase; entitlement reconhecido — regra "reader/account").
- [x] **Sem link de compra externa no iOS** fora de EUA/UE (`canShowExternalPurchase`
      = web; `EXTERNAL_PURCHASE_ENABLED = false`). Ativável por storefront depois.
- [x] **Restaurar compra** visível (paywall e /plano).
- [x] **Exclusão de conta in-app** (/plano → Excluir conta).
- [x] **Disclosures de assinatura** (preço, renovação automática, cancelar, Termos,
      Privacidade) no paywall.
- [x] **Cancelamento transparente** (/plano explica e aponta para a loja).
- [ ] **Conteúdo de saúde revisado pela nutricionista** (ver `content/SOURCES.md`)
      e disclaimer de "não substitui acompanhamento médico" visível.
- [ ] Política de privacidade publicada numa URL.
- [ ] Produtos de assinatura criados e aprovados nas duas lojas + RevenueCat.

## 9. Notificações

Usamos **notificações locais** (sem servidor/APNs) — passam na review sem a
superfície de push remoto. Permissão pedida com contexto (Perfil → Notificações).
Para push remoto futuro: Supabase Edge Function + FCM/APNs.

## 10. Backend (Supabase) — opcional para o MVP

O app funciona offline-first. Para sync multi-device e contas reais:
- Crie o projeto Supabase, configure Auth (e-mail + provedores sociais) e as
  **redirect URLs** (inclua o esquema `com.desinflama.app://` para deep-link de
  OAuth no nativo).
- A exclusão definitiva de conta usa uma **Edge Function** com service role
  (apaga o usuário); o app já chama o fluxo de exclusão.
- Configure um **webhook do RevenueCat → Edge Function** se quiser cache
  server-side do entitlement (a fonte da verdade continua sendo o RevenueCat).

---

## 11. Ficha das lojas — RASCUNHO, pendente de aprovação do Ruyter

> **NÃO SUBMETER SEM ELE APROVAR.** Texto de loja é promessa pública: entra em
> print, em anúncio e no radar do CFN/ANVISA. O Ruyter decide a palavra final —
> aqui está a versão derivada de `src/content/promise.ts`, que é a fonte única
> da promessa dentro do app. Se ele mudar aqui, mudar lá também (e vice-versa),
> senão a loja promete uma coisa e o app entrega outra.

### App Store

**Nome (30 car.)**
`Desinflama: seu intestino`

**Subtítulo (30 car.)**
`Coma para desinflamar`

**Descrição**

```
Inchaço quase nunca é gordura — é gás.

Certos carboidratos chegam ao intestino sem serem digeridos, viram comida para
as bactérias e estufam a barriga. Por isso comer menos não resolve. E por isso
não é falta de força de vontade.

O Desinflama é um programa de 21 dias que descobre o que incha VOCÊ.

• CARDÁPIO SEU, DE VERDADE
  Você marca o que gosta e o que não come. O cardápio se monta em cima disso —
  e dá pra trocar qualquer refeição.

• NOTA DESINFLAMA
  Registre o prato e veja uma nota de 0 a 100 calculada para o SEU corpo. A
  mesma comida vale notas diferentes para pessoas diferentes, porque ela usa o
  seu Mapa de Tolerância.

• SEU MAPA DE TOLERÂNCIA
  A cada teste de reintrodução, um grupo de alimento se acende na sua lista
  pessoal: o que você tolera, o que modera e o que evita.

• UM BROTO QUE NUNCA TE PUNE
  Ele reage ao seu cuidado do dia. No pior dia, fica desanimado. Nunca adoece,
  nunca morre, nunca some.

• PRAZERES QUE ESTÃO NO PLANO
  Cuidar rende sementes. Sementes viram chocolate, vinho, pizza — sem culpa,
  porque estava no seu plano.

Mulheres que fizeram o programa relatam barriga mais leve e mais disposição.
Não é tratamento, não é garantia — é um método para você descobrir o seu
padrão. Não substitui consulta com nutricionista ou médico.
```

**Palavras-chave (100 car.)**
`inchaço,intestino,fodmap,digestão,barriga,inchada,gases,dieta,nutrição,bem-estar`

### Google Play

**Descrição curta (80 car.)**
`Descubra o que incha VOCÊ. Cardápio seu, nota do prato e 21 dias sem sofrer.`

**Descrição completa:** a mesma da App Store.

### Capturas (7, na ordem)

Refazer TODAS — as antigas são da paleta verde e da estrutura anterior.

| # | Tela | Legenda sugerida |
|---|---|---|
| 1 | Hoje (Broto animado + cartão do dia) | Um broto que reage ao seu cuidado |
| 2 | Prato com a nota | A foto do prato vira nota — pro SEU corpo |
| 3 | Cardápio pessoal | Montado com a comida que você já gosta |
| 4 | Mapa de Tolerância | O que VOCÊ tolera, descoberto por você |
| 5 | Prazeres | Cuidar rende. E rende chocolate |
| 6 | Progresso (Índice) | A prova de que está funcionando |
| 7 | Frase do dia | Para postar |

### O que ainda falta antes de submeter

- [ ] Ruyter aprovar o texto acima
- [ ] Prova social e garantia no paywall (números reais — não podem ser inventados)
- [ ] Capturas novas, nas 7 telas acima, em 6.7" e 6.5"
- [ ] `ANTHROPIC_API_KEY` no servidor, se a análise por foto entrar na v1
- [ ] Política de privacidade cobrindo foto de refeição (fica local, mas o
      texto precisa dizer isso)
