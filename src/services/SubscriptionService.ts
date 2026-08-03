/**
 * SubscriptionService — entitlement premium atrás de interface.
 *
 * Fonte única da verdade (em produção): RevenueCat, unificando Web Billing,
 * Apple IAP e Google Play Billing. Em modo dev sem chaves, MockSubscriptionService
 * simula o entitlement localmente para o app rodar end-to-end.
 *
 * A integração real do RevenueCat (web checkout + IAP nativo) é conectada na
 * Fase 10, por trás desta mesma interface — a UI não muda.
 */
import type { PlanId, Subscription } from "@/types/domain";
import { FREE_SUBSCRIPTION } from "@/types/domain";
import { kv } from "@/data/storage";

export interface SubPackage {
  id: Extract<PlanId, "monthly" | "annual">;
  title: string;
  priceLabel: string;
  /** Preço normalizado por mês (âncora do anual). */
  pricePerMonthLabel: string;
  /**
   * Preço por DIA — é o número que vai em destaque.
   *
   * Padrão dos funis grandes de assinatura de saúde (Fastic mostra
   * US$0,22–0,86/dia): a mesma quantia lida como pequena por dia e como
   * decisão por mês. Não muda o preço, muda a unidade de comparação — o
   * cérebro compara R$0,55 com um café, e R$16,65 com uma conta.
   */
  pricePerDayLabel: string;
  period: "month" | "year";
  badge?: string;
  highlight?: boolean;
}

export interface SubscriptionService {
  /** Associa o usuário (RevenueCat App User ID = id do usuário). */
  init(userId: string): Promise<void>;
  getStatus(): Promise<Subscription>;
  getOfferings(): Promise<SubPackage[]>;
  /** Inicia compra (IAP nativo no mobile, checkout web no web). */
  purchase(packageId: SubPackage["id"]): Promise<Subscription>;
  restore(): Promise<Subscription>;
  signOut(): Promise<void>;
  onStatusChange(cb: (s: Subscription) => void): () => void;
}

/** Ofertas exibidas no paywall. O anual é a âncora (menor preço/mês). */
export const OFFERINGS: SubPackage[] = [
  {
    id: "annual",
    title: "Anual",
    priceLabel: "R$ 199,90/ano",
    pricePerMonthLabel: "R$ 16,65/mês",
    pricePerDayLabel: "R$ 0,55",
    period: "year",
    badge: "ECONOMIZE 58%",
    highlight: true,
  },
  {
    id: "monthly",
    title: "Mensal",
    priceLabel: "R$ 39,90/mês",
    pricePerMonthLabel: "R$ 39,90/mês",
    pricePerDayLabel: "R$ 1,33",
    period: "month",
  },
];

function planToSubscription(plan: SubPackage["id"]): Subscription {
  const now = new Date();
  const renews = new Date(now);
  if (plan === "annual") renews.setFullYear(now.getFullYear() + 1);
  else renews.setMonth(now.getMonth() + 1);
  return {
    isPremium: true,
    plan,
    source: "web",
    renewsAt: renews.toISOString(),
    managementUrl: null,
  };
}

/* --------------------------------- Mock --------------------------------- */

const SUB_KEY = "desinflama:subscription";

export class MockSubscriptionService implements SubscriptionService {
  private listeners = new Set<(s: Subscription) => void>();

  private emit(s: Subscription) {
    this.listeners.forEach((cb) => cb(s));
  }

  async init(_userId: string) {
    /* no-op no mock; em produção faria Purchases.logIn(userId). */
  }

  async getStatus(): Promise<Subscription> {
    return (await kv.get<Subscription>(SUB_KEY)) ?? { ...FREE_SUBSCRIPTION };
  }

  async getOfferings(): Promise<SubPackage[]> {
    return OFFERINGS;
  }

  async purchase(packageId: SubPackage["id"]): Promise<Subscription> {
    const sub = planToSubscription(packageId);
    await kv.set(SUB_KEY, sub);
    this.emit(sub);
    return sub;
  }

  async restore(): Promise<Subscription> {
    const sub = await this.getStatus();
    this.emit(sub);
    return sub;
  }

  async signOut() {
    // Mantém a "compra" associada ao dispositivo no mock.
  }

  onStatusChange(cb: (s: Subscription) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}
