/**
 * Quem comprou no funil já pagou — o app não pode pedir de novo.
 *
 * Este serviço embrulha o serviço de assinatura normal (RevenueCat ou mock):
 * se existe um acesso liberado pelo funil neste aparelho, a pessoa é premium,
 * ponto. Se não existe, tudo segue como antes.
 *
 * Fica aqui, e não numa flag solta dentro do AppData, porque o AppData é
 * recarregado a cada login — e a assinatura seria apagada junto.
 */

import { kv } from "@/data/storage";
import type { Subscription } from "@/types/domain";
import type { SubPackage, SubscriptionService } from "./SubscriptionService";

const CHAVE_ACESSO = "desinflama:acesso:premium";

export interface AcessoDoFunil {
  plano: "monthly" | "annual";
  email: string;
  liberadoEm: string;
}

export async function registrarAcessoDoFunil(acesso: AcessoDoFunil): Promise<void> {
  await kv.set(CHAVE_ACESSO, acesso);
}

export async function lerAcessoDoFunil(): Promise<AcessoDoFunil | null> {
  return kv.get<AcessoDoFunil>(CHAVE_ACESSO);
}

export async function limparAcessoDoFunil(): Promise<void> {
  await kv.remove(CHAVE_ACESSO);
}

export class AcessoFunilSubscription implements SubscriptionService {
  constructor(private base: SubscriptionService) {}

  async init(userId: string): Promise<void> {
    await this.base.init(userId);
  }

  async getStatus(): Promise<Subscription> {
    const doFunil = await lerAcessoDoFunil();
    if (doFunil) {
      return {
        isPremium: true,
        plan: doFunil.plano,
        source: "web",
        renewsAt: null,
        managementUrl: null,
      };
    }
    return this.base.getStatus();
  }

  getOfferings(): Promise<SubPackage[]> {
    return this.base.getOfferings();
  }

  purchase(packageId: SubPackage["id"]): Promise<Subscription> {
    return this.base.purchase(packageId);
  }

  restore(): Promise<Subscription> {
    return this.base.restore();
  }

  async signOut(): Promise<void> {
    // O acesso do funil pertence a quem comprou, não à sessão: sair da conta
    // não devolve o produto. Só o /zerar apaga.
    await this.base.signOut();
  }

  onStatusChange(cb: (s: Subscription) => void): () => void {
    return this.base.onStatusChange(cb);
  }
}
