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
import { RevenueCatSubscriptionService } from "./RevenueCatService";

export const repository: Repository = new LocalRepository();

export const authService: AuthService = env.supabase.configured
  ? new SupabaseAuthService()
  : new MockAuthService();

// RevenueCat real (Web Billing + Apple IAP + Google Play Billing) quando há
// chaves; caso contrário, mock funcional. A UI não muda — depende da interface.
export const subscriptionService: SubscriptionService = env.revenuecat.configured
  ? new RevenueCatSubscriptionService()
  : new MockSubscriptionService();

export type { AuthService, SubscriptionService, Repository };
