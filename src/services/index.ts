/**
 * Composition root — escolhe implementações real vs mock conforme as envs.
 * A UI importa apenas estes singletons; trocar mock por real não muda a UI.
 */
import { env } from "@/lib/env";
import { LocalRepository, type Repository } from "@/data/Repository";
import {
  MockAuthService,
  SupabaseAuthService,
  type AuthService,
} from "./AuthService";
import {
  MockSubscriptionService,
  type SubscriptionService,
} from "./SubscriptionService";

export const repository: Repository = new LocalRepository();

export const authService: AuthService = env.supabase.configured
  ? new SupabaseAuthService()
  : new MockAuthService();

// O RevenueCat real (web + IAP nativo) é conectado na Fase 10 por trás desta
// mesma interface. Até lá, e quando não há chaves, usamos o mock funcional.
export const subscriptionService: SubscriptionService =
  new MockSubscriptionService();

export type { AuthService, SubscriptionService, Repository };
