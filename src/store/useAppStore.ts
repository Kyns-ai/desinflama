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
  ItemPrato,
  OnboardingData,
  Prazer,
  ReactionLevel,
  RefeicaoAnalisada,
  Resgate,
  Subscription,
  ToleranceResult,
} from "@/types/domain";
import { calcularNota, type NotaPrato } from "@/lib/notaPrato";
import { emptyAppData } from "@/types/domain";
import { newJourney, phaseForDay, totalDays } from "@/lib/journey";
import { buildDemoData, DEMO_EMAIL } from "@/lib/demo";
import { SEEDS } from "@/lib/garden";
import { initialScore } from "@/lib/score";
import { recomputedScores } from "@/lib/computeGutScore";
import { applyStreak, grantShield } from "@/lib/streak";
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
  /** Define o ritual "se-então" (âncora) e o ciclo, opcionalmente. */
  setRitual: (anchor: string) => Promise<void>;
  /** Compromisso de check-ins (7|14|21) assumido no ritual pós-Mapa. */
  setCommitment: (days: number) => Promise<void>;
  setCycleStart: (dateKey: string) => Promise<void>;
  startJourney: (challenge?: ChallengeType) => Promise<void>;
  /** Entra com a conta de demonstração já populada (modo mock). */
  enterDemo: () => Promise<void>;
  toggleChecklistItem: (day: number, index: number) => Promise<void>;
  /** Marca a água do dia (+5 sementes, uma vez por dia). */
  marcarAgua: () => Promise<{ jaFeito: boolean }>;
  /** Marca "passei o dia sem o meu gatilho" (+15 sementes, uma vez por dia). */
  marcarSemGatilho: () => Promise<{ jaFeito: boolean }>;
  /** Conclui a aula do dia: marca como feita e dá +1 semente (uma vez). */
  completeLesson: (day: number) => Promise<{ alreadyDone: boolean; seeds: number }>;
  /** Conclui a Calmaria (respiração guiada) do dia: +1 semente uma vez por dia,
   *  conta como atividade (ofensiva/score). */
  completeCalmaria: () => Promise<{ alreadyDone: boolean }>;
  completeDay: (day: number) => Promise<{ blocked: boolean }>;
  /** Registra o resultado de um teste de reintrodução (Mapa de Tolerância). */
  addToleranceResult: (result: ToleranceResult) => Promise<void>;
  addLog: (log: DailyLog) => Promise<void>;
  /** Salva uma refeição fotografada e calcula a Nota Desinflama dela. */
  adicionarRefeicao: (entrada: {
    momento: RefeicaoAnalisada["momento"];
    fotoDataUrl?: string;
    nome: string;
    itens: ItemPrato[];
    troca: string;
    temFibra?: boolean;
  }) => Promise<{
    refeicao: RefeicaoAnalisada;
    nota: NotaPrato;
    sementes: number;
  }>;
  removerRefeicao: (id: string) => Promise<void>;
  /** Guarda o "gosto / não é pra mim" que personaliza o cardápio. */
  definirPreferencias: (gosta: string[], evita: string[]) => Promise<void>;
  /** Troca uma refeição do cardápio por outra receita (chave semana:dia:tipo). */
  trocarRefeicao: (chave: string, receitaId: string) => Promise<void>;
  /** Resgata um prazer com sementes do SALDO (o nível do Broto não cai). */
  resgatarPrazer: (prazer: Prazer) => Promise<
    | { resgatado: false; saldo: number }
    | { resgatado: true; saldo: number; resgate: Resgate }
  >;
  criarPrazer: (nome: string, preco: number) => Promise<Prazer>;
  removerPrazer: (id: string) => Promise<void>;
  registrarReacaoDoPrazer: (resgateId: string, reacao: ReactionLevel) => Promise<void>;
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

/**
 * Creditar semente é SEMPRE por aqui.
 *
 * São dois contadores: `seeds` é o saldo (cai quando ela resgata um prazer) e
 * `seedsLifetime` é o acumulado da vida (só sobe, define o nível do Broto).
 * Mexer em `d.seeds` direto foi o que motivou este helper — quem esquecesse o
 * segundo contador faria o personagem regredir quando ela gastasse.
 */
function ganharSementes(d: AppData, quantas: number) {
  d.seeds += quantas;
  d.seedsLifetime += quantas;
}

/** Aplica atividade na ofensiva + repõe 1 escudo a cada 7 dias seguidos (senão,
 *  na Manutenção — o "para sempre" do app — escudo gasto nunca voltaria). */
function touchStreak(d: AppData, today: string) {
  const before = d.streak.current;
  const sr = applyStreak(d.streak, today);
  d.streak = sr.streak;
  if (sr.shieldUsed) d.flags.shieldJustUsed = true;
  if (
    d.streak.current !== before &&
    d.streak.current > 0 &&
    d.streak.current % 7 === 0
  ) {
    d.streak = grantShield(d.streak, 1);
  }
}

/** Dispara notificação local para conquistas recém-desbloqueadas (se ativadas). */
function notifyAchievements(novas: AchievementDef[]) {
  if (!novas.length) return;
  if (!useAppStore.getState().data.flags.notifications) return;
  for (const a of novas) {
    fireMilestoneNotification(
      "Conquista desbloqueada",
      `${a.title} — ${a.description}`
    );
  }
}

export const useAppStore = create<AppState>((set, get) => {
  // Evita hidratação dupla: signIn/signUp chamam hydrateUser diretamente e o
  // onAuthChange pode disparar pro MESMO usuário antes do set() — a segunda
  // hidratação carregaria dados velhos e sobrescreveria escritas recentes.
  //
  // Guardamos a PROMESSA em andamento, não só o id: quem chega depois espera a
  // primeira terminar em vez de seguir em frente. Sem isso, `await signUp(...)`
  // podia resolver antes de `data.user` existir, e a escrita seguinte (ex.: o
  // onboarding vindo do funil) era sobrescrita quando a hidratação terminava.
  let hidratacaoEmCurso: { id: string; promessa: Promise<void> } | null = null;

  /** Após autenticar: troca o namespace, carrega os dados do usuário e hidrata. */
  async function hydrateUser(user: AuthUser) {
    if (hidratacaoEmCurso?.id === user.id) return hidratacaoEmCurso.promessa;

    const promessa = doHydrate(user).finally(() => {
      if (hidratacaoEmCurso?.id === user.id) hidratacaoEmCurso = null;
    });
    hidratacaoEmCurso = { id: user.id, promessa };
    return promessa;
  }

  async function doHydrate(user: AuthUser) {
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
          // A demo se hidrata sozinha em enterDemo — re-hidratar aqui faria o
          // load (vazio) sobrescrever os dados semeados (race).
          if (u?.email === DEMO_EMAIL) return;
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
      const user = await authService.signInWithEmail(DEMO_EMAIL, "demo1234");
      repository.setNamespace(user.id);
      const data = buildDemoData(user);
      // o premium da demo precisa viver no serviço de assinatura (mock),
      // senão o próximo bootstrap lê "free" de lá e rebaixa a demo no reload
      await subscriptionService.init(user.id);
      data.subscription = await subscriptionService.purchase("annual");
      // save ANTES do set: a UI só fica interativa com a semente persistida,
      // senão a 1ª ação da usuária pode ser sobrescrita pelo save atrasado.
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
      // o device não pode continuar disparando nudges da conta que saiu
      await cancelAllNudges();
      await authService.signOut();
      await subscriptionService.signOut();
      repository.setNamespace("anon");
      set({ user: null, data: emptyAppData() });
    },

    deleteAccount: async () => {
      await cancelAllNudges();
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

    setRitual: async (anchor) => {
      await get().update((d) => {
        d.ritualAnchor = anchor;
      });
    },

    setCommitment: async (days) => {
      let novas: AchievementDef[] = [];
      await get().update((d) => {
        d.commitmentDays = days;
        d.commitmentAt = new Date().toISOString();
        // destrava "Primeiro passo" na hora — 1ª conquista da sessão
        const { list, newlyUnlocked } = reconcileAchievements(d, todayKey());
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    setCycleStart: async (dateKey) => {
      await get().update((d) => {
        d.cycleStart = dateKey;
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
        const marcando = !cur.includes(index);
        d.checklists[day] = marcando
          ? [...cur, index]
          : cur.filter((i) => i !== index);
        // A semente da tarefa é paga UMA vez por tarefa, para sempre. Sem essa
        // trava, marcar e desmarcar o mesmo item viraria uma fábrica de
        // sementes — e sementes agora compram prazeres de verdade.
        const pago = `tarefaPaga:${day}:${index}`;
        if (marcando && !d.flags[pago]) {
          d.flags[pago] = true;
          ganharSementes(d, SEEDS.tarefa);
        }
      });
    },

    /**
     * Água do dia — linha própria do cartão do dia.
     *
     * É um toque direto, não um desvio até o check-in: água é a ação de menor
     * atrito do dia e mandá-la preencher um formulário para marcar um copo
     * mataria a linha. O `hydrationOk` do registro continua sendo a fonte do
     * Índice, então quando já existe registro de hoje ele é atualizado junto.
     */
    marcarAgua: async () => {
      const hoje = todayKey();
      const chave = `agua:${hoje}`;
      const jaFeito = !!get().data.flags[chave];
      await get().update((d) => {
        if (d.flags[chave]) return;
        d.flags[chave] = true;
        const pago = `aguaPaga:${hoje}`;
        if (!d.flags[pago]) {
          d.flags[pago] = true;
          ganharSementes(d, SEEDS.agua);
        }
        const log = d.logs.find((l) => l.date === hoje);
        if (log) {
          log.hydrationOk = true;
          d.scores = recomputedScores(d, hoje);
        }
        touchStreak(d, hoje);
      });
      return { jaFeito };
    },

    /** "Passei o dia sem o meu gatilho" — a linha mais valiosa do cartão do
     *  dia (15 sementes), porque é a que exige a escolha difícil. */
    marcarSemGatilho: async () => {
      const hoje = todayKey();
      const chave = `semGatilho:${hoje}`;
      const jaFeito = !!get().data.flags[chave];
      await get().update((d) => {
        if (d.flags[chave]) return;
        d.flags[chave] = true;
        ganharSementes(d, SEEDS.semGatilho);
        touchStreak(d, hoje);
      });
      return { jaFeito };
    },

    completeLesson: async (day) => {
      const alreadyDone = !!get().data.lessonsDone[day];
      await get().update((d) => {
        if (!d.lessonsDone[day]) {
          d.lessonsDone[day] = true;
          ganharSementes(d, SEEDS.lesson);
          // a aula é 1 dos 3 passos do dia — conta como atividade da ofensiva
          touchStreak(d, todayKey());
        }
      });
      return { alreadyDone, seeds: alreadyDone ? 0 : SEEDS.lesson };
    },

    completeCalmaria: async () => {
      const today = todayKey();
      const key = `calmaria:${today}`;
      const alreadyDone = !!get().data.flags[key];
      let novas: AchievementDef[] = [];
      await get().update((d) => {
        if (d.flags[key]) return;
        d.flags[key] = true;
        // primeira Calmaria = a vitória sentida do Dia 0 (conquista + tracker)
        if (!d.flags.primeiroAlivio) d.flags.primeiroAlivio = true;
        ganharSementes(d, SEEDS.calmaria);
        // conta como atividade do dia (ofensiva perdoável + score)
        touchStreak(d, today);
        d.scores = recomputedScores(d, today, { otherActivity: true });
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
      return { alreadyDone };
    },

    completeDay: async (day) => {
      let novas: AchievementDef[] = [];
      let blocked = false;
      await get().update((d) => {
        if (!d.progress) return;
        const today = todayKey();
        const isNew = !d.progress.completedDays.includes(day);
        // 1 conclusão por dia-calendário: o programa é diário de verdade —
        // sem isso, dá pra "fechar" os 14 dias em 2 minutos de cliques.
        const otherDayClosedToday = Object.entries(
          d.progress.completedAt
        ).some(([k, date]) => Number(k) !== day && date === today);
        if (isNew && otherDayClosedToday) {
          blocked = true;
          return;
        }
        if (isNew) {
          d.progress.completedDays.push(day);
          d.progress.completedAt[day] = today;
          ganharSementes(d, SEEDS.completeDay);
          if (day === 7 || day === 14 || day === 21) {
            ganharSementes(d, SEEDS.milestone);
            // marcos repõem um escudo (só na 1ª conclusão)
            d.streak = grantShield(d.streak, 1);
          }
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
        // ofensiva (perdoável: escudo cobre 1 dia perdido)
        touchStreak(d, today);
        // Índice Intestinal: recomputa o ponto do dia (motor da Fase 8)
        d.scores = recomputedScores(d, today);
        // conquistas
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
      // nudges falam "Seu Dia N te espera" — reagenda com o dia novo
      if (!blocked && get().data.flags.notifications) {
        await scheduleRetentionNudges(
          get().data.progress?.currentDay ?? 1,
          get().data.user?.name?.split(" ")[0]
        );
      }
      return { blocked };
    },

    addLog: async (log) => {
      let novas: AchievementDef[] = [];
      const today = todayKey();
      await get().update((d) => {
        // hadLog DENTRO do mutator: toque duplo no salvar não pode dar 2 sementes
        const hadLog = d.logs.some((l) => l.date === log.date);
        // substitui o registro do dia, se já existir
        d.logs = [...d.logs.filter((l) => l.date !== log.date), log];
        // check-in dá semente uma vez por dia
        if (!hadLog) ganharSementes(d, SEEDS.checkin);
        // Água é uma linha separada do cartão do dia (tabela da Seção 5), então
        // paga separado — e só uma vez, mesmo que ela reedite o registro.
        const aguaPaga = `aguaPaga:${log.date}`;
        if (log.hydrationOk && !d.flags[aguaPaga]) {
          d.flags[aguaPaga] = true;
          d.flags[`agua:${log.date}`] = true;
          ganharSementes(d, SEEDS.agua);
        }
        // a ofensiva só conta atividade de HOJE — editar um dia passado não
        // deve regredir nem inflar a streak atual.
        if (log.date === today) {
          touchStreak(d, today);
        }
        // Índice Intestinal: recomputa o ponto do dia (motor da Fase 8)
        d.scores = recomputedScores(d, log.date);
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    addToleranceResult: async (result) => {
      let novas: AchievementDef[] = [];
      const today = todayKey();
      await get().update((d) => {
        // re-tocar o mesmo grupo no mesmo dia substitui (não duplica)
        const firstForGroup = !d.tolerance.some((t) => t.group === result.group);
        d.tolerance = [
          ...d.tolerance.filter(
            (t) =>
              !(t.group === result.group && t.dateTested === result.dateTested)
          ),
          result,
        ];
        // semente uma vez por grupo testado
        if (firstForGroup) ganharSementes(d, SEEDS.checkin);
        const { list, newlyUnlocked } = reconcileAchievements(d, today);
        d.achievements = list;
        novas = newlyUnlocked;
      });
      notifyAchievements(novas);
    },

    /**
     * Salva uma refeição fotografada e PONTUA na hora.
     *
     * A nota nunca vem da IA — a IA só entrega os itens e os grupos. Aqui a
     * gente aplica `calcularNota` com o Mapa de Tolerância e o perfil DELA,
     * que é o que faz o mesmo prato valer notas diferentes para pessoas
     * diferentes (e para a mesma pessoa em momentos diferentes da jornada).
     */
    adicionarRefeicao: async (entrada) => {
      const hoje = todayKey();
      const estado = get().data;

      const nota = calcularNota(entrada.itens, {
        tolerancia: estado.tolerance,
        perfil: estado.user?.onboarding?.bloatType ?? null,
        temFibra: entrada.temFibra,
      });

      let fotoRef: string | undefined;
      if (entrada.fotoDataUrl) {
        const id = `refeicao-${hoje}-${uid()}`;
        fotoRef = await blobStore.save(id, entrada.fotoDataUrl);
      }

      const refeicao: RefeicaoAnalisada = {
        id: uid(),
        date: hoje,
        momento: entrada.momento,
        fotoRef,
        nome: entrada.nome,
        itens: entrada.itens,
        nota: nota.nota,
        troca: entrada.troca,
        createdAt: new Date().toISOString(),
      };

      let sementes = 0;
      await get().update((d) => {
        d.refeicoes.push(refeicao);
        // Teto de 2 fotos pagas por dia (Seção 5): sem teto, fotografar o
        // mesmo prato dez vezes viraria a forma mais barata de comprar pizza.
        const pagasHoje = d.refeicoes.filter(
          (r) => r.date === hoje && d.flags[`fotoPaga:${r.id}`]
        ).length;
        if (pagasHoje < 2) {
          d.flags[`fotoPaga:${refeicao.id}`] = true;
          ganharSementes(d, SEEDS.foto);
          sementes = SEEDS.foto;
        }
        touchStreak(d, hoje);
      });

      return { refeicao, nota, sementes };
    },

    removerRefeicao: async (id) => {
      const alvo = get().data.refeicoes.find((r) => r.id === id);
      if (alvo?.fotoRef) await blobStore.remove(alvo.fotoRef);
      await get().update((d) => {
        d.refeicoes = d.refeicoes.filter((r) => r.id !== id);
      });
    },

      /* ---------------------------- Cardápio ---------------------------- */

    /**
     * Guarda o "gosto / não é pra mim". Substitui em vez de somar: se ela
     * refaz a seleção, o que ficou de fora é porque ela tirou.
     */
    definirPreferencias: async (gosta, evita) => {
      await get().update((d) => {
        d.preferencias = { gosta, evita };
      });
    },

    /** Troca uma refeição do cardápio da semana por outra receita. */
    trocarRefeicao: async (chave, receitaId) => {
      await get().update((d) => {
        d.trocasCardapio[chave] = receitaId;
      });
    },

    /* ---------------------------- Prazeres ---------------------------- */

    /**
     * Resgata um prazer. Gasta SÓ o saldo — `seedsLifetime` não é tocado, então
     * o Broto nunca regride por ela ter se dado um prazer.
     *
     * Marca também o dia SEGUINTE: é lá que o check-in pergunta como o corpo
     * reagiu, e é isso que faz o prazer virar dado do Mapa de Tolerância em
     * vez de só uma recompensa que sai do sistema sem ensinar nada.
     */
    resgatarPrazer: async (prazer) => {
      const hoje = todayKey();
      if (get().data.seeds < prazer.preco) {
        return { resgatado: false as const, saldo: get().data.seeds };
      }

      const resgate: Resgate = {
        id: uid(),
        prazerId: prazer.id,
        nome: prazer.nome,
        preco: prazer.preco,
        grupo: prazer.grupo,
        date: hoje,
      };

      await get().update((d) => {
        if (d.seeds < prazer.preco) return;
        d.seeds -= prazer.preco;
        d.resgates.push(resgate);
        d.flags[`prazerResgatado:${hoje}`] = true;
      });

      return { resgatado: true as const, saldo: get().data.seeds, resgate };
    },

    criarPrazer: async (nome, preco) => {
      const prazer: Prazer = {
        id: `proprio-${uid()}`,
        nome: nome.trim(),
        preco: Math.max(5, Math.round(preco)),
        proprio: true,
      };
      await get().update((d) => {
        d.prazeresProprios.push(prazer);
      });
      return prazer;
    },

    removerPrazer: async (id) => {
      await get().update((d) => {
        d.prazeresProprios = d.prazeresProprios.filter((p) => p.id !== id);
      });
    },

    /**
     * Registra como o corpo reagiu ao prazer resgatado — e, quando o prazer
     * tem grupo FODMAP, ALIMENTA O MAPA DE TOLERÂNCIA com isso.
     *
     * É esta última parte que cumpre a promessa da Seção 5 ("o prazer também
     * ensina"). Sem ela, a pergunta do dia seguinte seria só uma pergunta: a
     * resposta sairia do sistema sem mudar nada. Com ela, comer a pizza de
     * sexta e relatar a reação melhora a Nota Desinflama de todos os pratos
     * com frutano dali pra frente.
     */
    registrarReacaoDoPrazer: async (resgateId, reacao) => {
      await get().update((d) => {
        const r = d.resgates.find((x) => x.id === resgateId);
        if (!r) return;
        r.reacao = reacao;

        if (r.grupo) {
          // Substitui um teste do MESMO grupo na MESMA data (ela pode
          // corrigir a resposta), mas preserva o histórico dos outros dias.
          d.tolerance = [
            ...d.tolerance.filter(
              (t) => !(t.group === r.grupo && t.dateTested === r.date)
            ),
            {
              group: r.grupo,
              reaction: reacao,
              dateTested: r.date,
              notes: `Resgate na loja: ${r.nome}`,
            },
          ];
        }
      });
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
        await scheduleRetentionNudges(
          get().data.progress?.currentDay ?? 1,
          get().data.user?.name?.split(" ")[0]
        );
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
          // guarda o programa fechado — a Manutenção não pode ser sem volta
          if (d.progress.challengeType !== "maintenance") {
            d.progress.completedChallenge =
              d.progress.challengeType === "reset21" ? "reset21" : "main14";
          }
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
          d.progress.phase = "Reequilíbrio";
        }
      });
    },

    completeChallengeDay: async (challengeId, day) => {
      let novas: AchievementDef[] = [];
      const today = todayKey();
      await get().update((d) => {
        d.flags[`mc:${challengeId}:${day}`] = true;
        touchStreak(d, today);
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
