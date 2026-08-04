# Desinflama 🌿

## No ar (Railway)

| Serviço | URL |
|---|---|
| App da cliente | https://desinflama-production.up.railway.app |
| Painel admin | https://desinflama-admin-production.up.railway.app |
| API (Nutri IA, funil, webhook) | https://desinflama-api-production.up.railway.app |

Os três deployam sozinhos a cada push na `main`. Configuração versionada em
`railway.app.json`, `railway.admin.json` e `railway.api.json`; passo a passo e
variáveis em `DEPLOY.md`.

**O painel não abre sem `ADMIN_PASSWORD`** — em produção, sem ela, o login
recusa todo mundo de propósito.


Produto de saúde intestinal para mulheres (PT-BR). **Um codebase → Web/PWA +
iOS (App Store) + Android (Google Play)**, com **Next.js (static export) +
Capacitor**. Guia a usuária por um **Desafio Desincha de 14 dias** (Low FODMAP /
5R), extensão **Reset 21 dias**, e **Modo Manutenção** com desafios mensais —
focado em **sintomas** (inchaço, gases, digestão, energia, pele), nunca calorias.

## Stack

- **Next.js 16** (App Router, `output: 'export'`) + **React 19** + **TypeScript**
- **Tailwind v4** (design tokens) · **Inter** (UI) + **Fraunces** (serif emocional)
- **Capacitor 8** (iOS via SwiftPM + Android) — Preferences, Filesystem, Camera,
  Haptics, Local Notifications, Network, App
- **Zustand** (estado) · **framer-motion** (animação) · **lucide-react** (ícones)
- **Supabase** (auth + dados) · **RevenueCat** (assinatura unificada: Web Billing/
  Stripe + Apple IAP + Google Play Billing)

## Rodando

```bash
npm install
npm run dev            # web (http://localhost:3000)
npm run build          # gera ./out (estático)
npx cap sync           # copia para ios/ e android/
npm run ios            # abre Xcode
npm run android        # abre Android Studio
```

**Modo dev sem chaves:** sem `.env.local`, o app roda 100% em mocks (auth,
assinatura e dados locais). Copie `.env.example` → `.env.local` e preencha para
ativar Supabase/RevenueCat reais — a UI não muda (tudo atrás de interfaces de
serviço).

## Arquitetura

- **SPA client-rendered** sob `output: 'export'` (sem route handlers, server
  actions, middleware ou APIs de runtime no servidor). Tudo interativo é `'use client'`.
- **Serviços atrás de interfaces** (`src/services`): `AuthService`,
  `SubscriptionService`, `Repository`. Uma *composition root* (`services/index.ts`)
  escolhe real vs mock por env.
- **Persistência** (`src/data`): Preferences/Filesystem (nativo) vs IndexedDB
  (web). Documento `AppData` por usuário; fotos como blobs separados.
- **Estado** (`src/store/useAppStore.ts`): hidrata, persiste e expõe ações
  semânticas (onboarding, concluir dia, registrar, conquistas, assinatura).
- **Motor Gut Score** (`src/lib/computeGutScore.ts`): pesos + regra anti-despenque,
  recomputado por dia.
- **Conteúdo** (`src/content`): jornada, desafios, aulas, gatilhos, trocas,
  receitas — em PT-BR, base FODMAP/5R, com fontes em `SOURCES.md` (revisão da nutri).

## Monetização & compliance

Venda no funil web (Stripe) **e** in-app (IAP), unificadas pelo **RevenueCat**
(App User ID = id do Supabase). App **não é paywall morto** (Dias 1–3 grátis +
login + IAP), **sem link de compra externa no iOS** fora de EUA/UE, com
**Restaurar compra**, **exclusão de conta** e cancelamento transparente.
Ver **`STORE_SUBMISSION.md`** para o passo a passo de publicação.

## Estrutura

```
src/
  app/              rotas (welcome, auth, onboarding, (app)/abas, legais)
  components/       UI (design system em ui/), shell, gráficos, paywall
  content/          conteúdo do programa (+ SOURCES.md)
  data/             storage + Repository
  services/         Auth / Subscription / RevenueCat
  store/            Zustand
  lib/              score, streak, journey, analytics, notifications, etc.
```
