"use client";

/**
 * Store global (Zustand). Mantém o usuário, a assinatura e o documento AppData,
 * persistindo via Repository. As fases seguintes adicionam ações semânticas
 * (onboarding, concluir dia, registrar, etc.) sobre `update()`.
 */
import { create } from "zustand";
import type {
  AppData,
  ChallengeType,
  DailyLog,
  OnboardingData,
  Subscription,
} from "@/types/domain";
import { emptyAppData } from "@/types/domain";
import { newJourney, phaseForDay, totalDays } from "@/lib/journey";
import { buildDemoData } from "@/lib/demo";
import { initialScore } from "@/lib/score";
import { recomputedScores } from "@/lib/computeGutScore";
import { bumpStreak } from "@/lib/streak";
import {
  reconcileAchievements,
  type AchievementDef,
} from "@/lib/achievements";
import {
  requestNotifPermission,
  scheduleRetentionNudges,
  fireMilestoneNotification,
  cancelAllNudges,
} from "@/lib/notifications";
import { todayKey } from "@/lib/date";
import { loadOrInit } from "@/data/Repository";
import { blobStore } from "@/data/storage";
import { authService, repository, subscriptionService } from "@/services";
import type { AuthUser, OAuthProvider } from "@/services/AuthService";
import type { SubPackage } from "@/services/SubscriptionService";

interface AppState {
  ready: boolean;
  user: AuthUser | null;
  data: AppData;

  bootstrap: () => Promise<void>;

  /** Aplica uma mutação imutável no AppData e persiste. */
  update: (mutator: (draft: AppData) => void) => Promise<void>;

  // Auth
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;

  setOnboarding: (onboarding: OnboardingData) => Promise<void>;
  startJourney: (challenge?: ChallengeType) => Promise<void>;
  /** Entra com a conta de demonstração já populada (modo mock). */
  enterDemo: () => Promise<void>;
  toggleChecklistItem: (day: number, index: number) => Promise<void>;
  /** Conclui a aula do dia: marca como feita e dá +1 semente (uma vez). */
  completeLesson: (day: number) => Promise<{ alreadyDone: boolean; seeds: number }>;
  completeDay: (day: number) => Promise<void>;
  addLog: (log: DailyLog) => Promise<void>;
  addPhoto: (dataUrl: string) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;

  // Retenção
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  enterMaintenance: () => Promise<void>;
  startResetProfundo: () => Promise<void>;
  completeChallengeDay: (challengeId: string, day: number) => Promise<void>;

  // Assinatura
  refreshSubscription: () => Promise<void>;
  purchase: (planId: SubPackage["id"]) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

/** Sementes ganhas ao concluir uma aula (gamificação — ver lib/garden na F3). */
const SEEDS_PER_LESSON = 1;

function clone<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));
}

/** Fila serial de escrita: garante que dois update() nunca corram em paralelo e
 *  sobrescrevam um ao outro (cada um re-clona o estado mais recente). */
let writeChain: Promise<void> = Promise.resolve();

/** Handles para desinscrever listeners ao trocar de usuário / sair. */
let unsubscribeStatus: (() => void) | null = null;
let unsubscribeAuth: (() => void) | null = null;

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Math.abs((Date.now() ^ (Math.floor(performance.now?.() ?? 0))) >>> 0)}`;
}

/** Dispara notificação local para conquistas recém-desbloqueadas (se ativadas). */
function notifyAchievements(novas: AchievementDef[]) {
  if (!novas.length) return;
  if (!useAppStore.getState().data.flags.notifications) return;
  for (const a of novas) {
    fireMilestoneNotification(
      `Conquista desbloqueada ${a.emoji}`,
      `${a.title} — ${a.description}`
    );
  }
}

export const useAppStore = create<AppState>((set, get) => {
  /** Após autenticar: troca o namespace, carrega os dados do usuário e hidrata. */
  async function hydrateUser(user: AuthUser) {
    repository.setNamespace(user.id);
    const data = await loadOrInit(repository);
    data.user = data.user ?? {
      id: user.id,
      name: user.name,
      email: user.email,
      onboarding: null,
      createdAt: new Date().toISOString(),
    };
    await subscriptionService.init(user.id);
    data.subscription = await subscriptionService.getStatus();
    await repository.save(data);
    set({ user, data, ready: true });
  }

  return {
    ready: false,
    user: null,
    data: emptyAppData(),

    bootstrap: async () => {
      try {
        const user = await authService.getCurrentUser();
        repository.setNamespace(user?.id ?? "anon");
        const data = await loadOrInit(repository);

        if (user) {
          data.user = data.user ?? {
            id: user.id,
            name: user.name,
            email: user.email,
            onboarding: null,
            createdAt: new Date().toISOString(),
          };
          await subscriptionService.init(user.id);
          data.subscription = await subscriptionService.getStatus();
          await repository.save(data);
        }

        set({ user, data });

        // Reage a mudanças de entitlement (compra concluída em outro device).
        // Ignora emissões quando não há usuária logada (evita vazar premium
        // para o namespace anon / próxima conta).
        unsubscribeStatus?.();
        unsubscribeStatus = subscriptionService.onStatusChange((sub) => {
          if (!get().user) return;
          get().update((d) => {
            d.subscription = sub;
          });
        });

        // Reage a mudanças de sessão (OAuth nativo via deep-link, refresh, abas).
        unsubscribeAuth?.();
        unsubscribeAuth = authService.onAuthChange((u) => {
          const current = get().user;
          if (u && u.id !== current?.id) {
            void hydrateUser(u);
          } else if (!u && current) {
            repository.setNamespace("anon");
            set({ user: null, data: emptyAppData() });
          }
        });
      } catch {
        // Falha de storage/sessão não pode travar o app no splash para sempre.
        repository.setNamespace("anon");
        set({ user: null, data: emptyAppData() });
      } finally {
        set({ ready: true });
      }
    },

    update: (mutator) => {
      // Serializa: cada mutação re-clona o estado mais recente e persiste em fila.
      const result = writeChain.then(async () => {
        const draft = clone(get().data);
        mutator(draft);
        set({ data: draft });
        await repository.save(draft);
      });
      writeChain = result.catch(() => {});
      return result;
    },

    signUp: async (email, password, name) => {
      const user = await authService.signUpWithEmail(email, password, name);
      await hydrateUser(user);
    },

    signIn: async (email, password) => {
      const user = await authService.signInWithEmail(email, password);
      await hydrateUser(user);
    },

    enterDemo: async () => {
      const user = await authService.signInWithEmail(
        "demo@desinflama.app",
        "demo1234"
      );
      repository.setNamespace(user.id);
      const data = buildDemoData(user);
      await repository.save(data);
      set({ user, data, ready: true });
    },

    signInWithProvider: async (provider) => {
      await authService.signInWithProvider(provider);
      const user = await authService.getCurrentUser();
      if (user) await hydrateUser(user);
    },

    signOut: async () => {
      // Para de ouvir entitlement antes de limpar, pra um push tardio não
      // reescrever a assinatura na conta anon.
      unsubscribeStatus?.();
      unsubscribeStatus = null;
      await authService.signOut();
      await subscriptionService.signOut();
      repository.setNamespace("anon");
      set({ user: null, data: emptyAppData() });
    },

    deleteAccount: async () => {
      await authService.deleteAccount();
      await repository.clear();
      repository.setNamespace("anon");
      set({ user: null, data: emptyAppData() });
    },

    setOnboarding: async (onboarding) => {
      await get().update((d) => {
        if (d.user) d.user.onboarding = onboarding;
      });
    },

    startJourney: async (challenge = "main14") => {
      await get().update((d) => {
        if (!d.progress) d.progress = newJourney(challenge);
        // semente do Índice Intestinal: baseline a partir do onboarding
        if (d.scores.length === 0) {
          d.scores.push({
            date: todayKey(),
            value: initialScore(d.user?.onboarding ?? null),
            delta: 0,
          });
        }
      });
    },

    toggleChecklistItem: async (day, index) => {
      await get().update((d) => {
        const cur = d.checklists[day] ?? [];
        d.checklists[day] = cur.includes(index)
          ? cur.filter((i) => i !== index)
          : [...cur, index];
      });
    },

    completeLesson: async (day) => {
      const alreadyDone = !!get().data.lessonsDone[day];
      await get().update((d) => {
        if (!d.lessonsDone[day]) {
          d.lessonsDone[day] = true;
          d.seeds += SEEDS_PER_LESSON;
        }
      });
      return { alreadyDone, seeds: alreadyDone ? 0 : SEEDS_PER_LESSON };
    },

    completeDay: async (day) => {
      let novas: AchievementDef[] = [];
      await get().update((d) => {
        if (!d.progress) return;
        const today = todayKey();
        if (!d.progress.completedDays.includes(day)) {
          d.progress.completedDays.push(day);
          d.progress.completedAt[day] = today;
        }
        // avança para o próximo dia (se houver)
        const total = totalDays(d.progress.challengeType);
        if (d.progress.currentDay === day && day < total) {
          d.progress.currentDay = day + 1;
          d.progress.phase = phaseForDay(
            d.progress.currentDay,
            d.progress.challengeType
          ).phase;
        }
        // ofensiva
        d.streak = bumpStreak(d.streak, today);
        // Índice Intestinal: recomputa o ponto do dia (motor da Fase 8)
        d.scores = recomputedScores(d, today);
        // conquistas
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    addLog: async (log) => {
      let novas: AchievementDef[] = [];
      const today = todayKey();
      await get().update((d) => {
        // substitui o registro do dia, se já existir
        d.logs = [...d.logs.filter((l) => l.date !== log.date), log];
        // a ofensiva só conta atividade de HOJE — editar um dia passado não
        // deve regredir nem inflar a streak atual.
        if (log.date === today) d.streak = bumpStreak(d.streak, today);
        // Índice Intestinal: recomputa o ponto do dia (motor da Fase 8)
        d.scores = recomputedScores(d, log.date);
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    addPhoto: async (dataUrl) => {
      const id = `photo-${todayKey()}-${uid()}`;
      const ref = await blobStore.save(id, dataUrl);
      let novas: AchievementDef[] = [];
      await get().update((d) => {
        d.photos.push({ id, date: todayKey(), ref, private: true });
        const { list, newlyUnlocked } = reconcileAchievements(d, todayKey());
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    removePhoto: async (id) => {
      const photo = get().data.photos.find((p) => p.id === id);
      if (photo) await blobStore.remove(photo.ref);
      await get().update((d) => {
        d.photos = d.photos.filter((p) => p.id !== id);
      });
    },

    enableNotifications: async () => {
      const granted = await requestNotifPermission();
      if (granted) {
        await scheduleRetentionNudges(get().data.progress?.currentDay ?? 1);
      }
      await get().update((d) => {
        d.flags.notifications = granted;
      });
      return granted;
    },

    disableNotifications: async () => {
      await cancelAllNudges();
      await get().update((d) => {
        d.flags.notifications = false;
      });
    },

    enterMaintenance: async () => {
      await get().update((d) => {
        if (d.progress) {
          d.progress.challengeType = "maintenance";
          d.progress.phase = "Manutenção";
        }
      });
    },

    startResetProfundo: async () => {
      await get().update((d) => {
        if (d.progress) {
          d.progress.challengeType = "reset21";
          d.progress.currentDay = Math.max(15, d.progress.currentDay);
          d.progress.phase = "Rebalance";
        }
      });
    },

    completeChallengeDay: async (challengeId, day) => {
      let novas: AchievementDef[] = [];
      const today = todayKey();
      await get().update((d) => {
        d.flags[`mc:${challengeId}:${day}`] = true;
        d.streak = bumpStreak(d.streak, today);
        // concluir um dia de desafio mensal conta como atividade do dia.
        d.scores = recomputedScores(d, today, { otherActivity: true });
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    refreshSubscription: async () => {
      const sub: Subscription = await subscriptionService.getStatus();
      await get().update((d) => {
        d.subscription = sub;
      });
    },

    purchase: async (planId) => {
      const sub = await subscriptionService.purchase(planId);
      await get().update((d) => {
        d.subscription = sub;
      });
    },

    restorePurchases: async () => {
      const sub = await subscriptionService.restore();
      await get().update((d) => {
        d.subscription = sub;
      });
    },
  };
});
