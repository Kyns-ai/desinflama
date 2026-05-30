/**
 * Implementação real do SubscriptionService via RevenueCat — fonte única de
 * "é premium", unificando Web Billing (Stripe), Apple IAP e Google Play Billing.
 *
 * Seleciona o SDK por plataforma (import dinâmico para não misturar bundles):
 *  - nativo  → @revenuecat/purchases-capacitor (StoreKit / Play Billing)
 *  - web     → @revenuecat/purchases-js (Web Billing)
 *
 * Regra de reconciliação: logIn(userId = id do Supabase) ANTES de qualquer
 * paywall/compra, para que uma compra na web seja reconhecida no app e vice-versa.
 *
 * As chaves entram por env; sem chaves, a composition root usa o mock.
 */
import type { PlanId, Subscription } from "@/types/domain";
import { FREE_SUBSCRIPTION } from "@/types/domain";
import { env } from "@/lib/env";
import {
  OFFERINGS,
  type SubPackage,
  type SubscriptionService,
} from "./SubscriptionService";

/** Forma mínima do customerInfo que usamos (compatível entre os dois SDKs). */
interface RCEntitlement {
  productIdentifier?: string;
  store?: string;
  expirationDate?: string | null;
  willRenew?: boolean;
}
interface RCCustomerInfo {
  entitlements: { active: Record<string, RCEntitlement> };
  managementURL?: string | null;
}

function planFromProduct(id?: string): PlanId {
  if (!id) return "monthly";
  if (/annual|year|ano|anual/i.test(id)) return "annual";
  if (/month|mes|mensal/i.test(id)) return "monthly";
  return "monthly";
}

function sourceFromStore(store?: string): Subscription["source"] {
  if (!store) return "web";
  const s = store.toLowerCase();
  if (s.includes("app_store") || s.includes("apple")) return "ios";
  if (s.includes("play") || s.includes("google")) return "android";
  return "web";
}

function toSubscription(ci: RCCustomerInfo): Subscription {
  const active = Object.values(ci.entitlements.active ?? {});
  const ent = ci.entitlements.active?.[env.revenuecat.entitlementId] ?? active[0];
  if (!ent) return { ...FREE_SUBSCRIPTION };
  return {
    isPremium: true,
    plan: planFromProduct(ent.productIdentifier),
    source: sourceFromStore(ent.store),
    renewsAt: ent.expirationDate ?? null,
    managementUrl: ci.managementURL ?? null,
  };
}

export class RevenueCatSubscriptionService implements SubscriptionService {
  private listeners = new Set<(s: Subscription) => void>();
  private configured = false;

  private async loadNative() {
    const mod = await import("@revenuecat/purchases-capacitor");
    return mod.Purchases;
  }
  private async loadWeb() {
    const mod = await import("@revenuecat/purchases-js");
    return mod.Purchases;
  }

  private async isNative() {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  }

  private emit(s: Subscription) {
    this.listeners.forEach((cb) => cb(s));
  }

  async init(userId: string) {
    if (await this.isNative()) {
      const apiKey = await this.platformKey();
      // Falha alto se a chave da plataforma faltar — pega misconfig na QA,
      // não no usuário pagante.
      if (!apiKey) {
        console.error(
          "[RevenueCat] chave da plataforma nativa ausente (Apple/Google)."
        );
        return;
      }
      const Purchases = await this.loadNative();
      if (!this.configured) {
        await Purchases.configure({ apiKey });
        this.configured = true;
      }
      await Purchases.logIn({ appUserID: userId });
      // listener de atualização de entitlement
      Purchases.addCustomerInfoUpdateListener((ci) =>
        this.emit(toSubscription(ci as unknown as RCCustomerInfo))
      );
    } else {
      if (!env.revenuecat.webKey) {
        console.error(
          "[RevenueCat] NEXT_PUBLIC_REVENUECAT_WEB_KEY ausente — checkout web indisponível."
        );
        return;
      }
      const Purchases = await this.loadWeb();
      Purchases.configure(env.revenuecat.webKey, userId);
      this.configured = true;
    }
  }

  private async platformKey(): Promise<string | undefined> {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.getPlatform() === "android"
      ? env.revenuecat.googleKey
      : env.revenuecat.appleKey;
  }

  async getStatus(): Promise<Subscription> {
    try {
      if (await this.isNative()) {
        const Purchases = await this.loadNative();
        const { customerInfo } = await Purchases.getCustomerInfo();
        return toSubscription(customerInfo as unknown as RCCustomerInfo);
      } else {
        const Purchases = await this.loadWeb();
        const ci = await Purchases.getSharedInstance().getCustomerInfo();
        return toSubscription(ci as unknown as RCCustomerInfo);
      }
    } catch {
      return { ...FREE_SUBSCRIPTION };
    }
  }

  async getOfferings(): Promise<SubPackage[]> {
    // As labels de preço reais vêm do RevenueCat em produção; mantemos a
    // estrutura ancorada do anual como base/fallback.
    return OFFERINGS;
  }

  async purchase(packageId: SubPackage["id"]): Promise<Subscription> {
    if (await this.isNative()) {
      const Purchases = await this.loadNative();
      const offerings = await Purchases.getOfferings();
      const pkgs = offerings.current?.availablePackages ?? [];
      const target =
        pkgs.find((p) =>
          packageId === "annual"
            ? /ANNUAL/i.test(p.packageType)
            : /MONTHLY/i.test(p.packageType)
        ) ?? pkgs[0];
      if (!target) throw new Error("Plano indisponível.");
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: target,
      });
      const sub = toSubscription(customerInfo as unknown as RCCustomerInfo);
      this.emit(sub);
      return sub;
    } else {
      const Purchases = await this.loadWeb();
      const offerings = await Purchases.getSharedInstance().getOfferings();
      const pkgs = offerings.current?.availablePackages ?? [];
      const target =
        pkgs.find((p) =>
          packageId === "annual"
            ? /annual|year/i.test(p.identifier)
            : /month/i.test(p.identifier)
        ) ?? pkgs[0];
      if (!target) throw new Error("Plano indisponível.");
      await Purchases.getSharedInstance().purchase({ rcPackage: target });
      const sub = await this.getStatus();
      this.emit(sub);
      return sub;
    }
  }

  async restore(): Promise<Subscription> {
    if (await this.isNative()) {
      const Purchases = await this.loadNative();
      const { customerInfo } = await Purchases.restorePurchases();
      const sub = toSubscription(customerInfo as unknown as RCCustomerInfo);
      this.emit(sub);
      return sub;
    }
    const sub = await this.getStatus();
    this.emit(sub);
    return sub;
  }

  async signOut() {
    try {
      if (await this.isNative()) {
        const Purchases = await this.loadNative();
        await Purchases.logOut();
      }
    } catch {
      /* sem sessão */
    }
  }

  onStatusChange(cb: (s: Subscription) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}
