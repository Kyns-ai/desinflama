"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Sprout,
  Shield,
  ShieldCheck,
  Wind,
  Anchor,
  BookOpen,
  Camera,
  HeartPulse,
  Info,
  ListChecks,
  Lock,
  Check,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  Sparkles,
  UtensilsCrossed,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { ScoreRing, Card, Badge, IconCircle, Button, buttonStyles } from "@/components/ui";
import { SeedMeter } from "@/components/SeedMeter";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { Tracker72h, CommitmentStrip } from "@/components/Tracker72h";
import { ProjectionTimeline } from "@/components/ProjectionTimeline";
import { weeklyRecap, closedWeeks } from "@/lib/recap";
import { Confetti } from "@/components/Confetti";
import { Art } from "@/components/Art";
import { artId } from "@/content/cardArt";
import { haptic } from "@/lib/haptics";
import { useAppStore } from "@/store/useAppStore";
import { currentScore, scoreMicrocopy } from "@/lib/score";
import { leveledUp, type GardenLevel } from "@/lib/garden";
import { phaseForDay, totalDays } from "@/lib/journey";
import { getDay } from "@/content/journey";
import { MONTHLY_CHALLENGES } from "@/content/challenges";
import { BLOAT_PROFILES } from "@/content/onboarding";
import { todayKey, diffDays } from "@/lib/date";
import { cycleInfo, RITUAL_ANCHORS } from "@/lib/cycle";
import { MAX_SHIELDS } from "@/types/domain";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Inicio() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const completeDay = useAppStore((s) => s.completeDay);
  const { user, progress, streak, seeds } = data;

  const score = currentScore(data);
  const day = progress?.currentDay ?? 1;
  const challenge = progress?.challengeType ?? "main14";
  const phase = phaseForDay(day, challenge);
  const total = totalDays(challenge);
  const totalLabel = Number.isFinite(total) ? total : 21;
  const firstName = (user?.name ?? "você").split(" ")[0];

  const content = getDay(day);
  const today = todayKey();
  const aulaDone = !!data.lessonsDone[day];
  const calmariaDone = !!data.flags[`calmaria:${today}`];
  const checkinDone = data.logs.some((l) => l.date === today);
  const checklistTotal = content?.checklist.length ?? 0;
  const checklistChecked = data.checklists[day]?.length ?? 0;
  const tarefasDone = checklistTotal > 0 && checklistChecked >= checklistTotal;
  const dayCompleted = progress?.completedDays.includes(day) ?? false;

  const steps: {
    icon: LucideIcon;
    label: string;
    sub: string;
    done: boolean;
    href: string;
    tone: "sage" | "coral" | "sky";
  }[] = [
    {
      icon: BookOpen,
      label: "Aula do dia",
      sub: aulaDone
        ? "Concluída"
        : `${content?.lesson.durationMin ?? 2} min · ${content?.lesson.title ?? ""}`,
      done: aulaDone,
      href: `/jornada/${day}/aula`,
      tone: "sage",
    },
    {
      icon: HeartPulse,
      label: "Check-in de hoje",
      sub: checkinDone ? "Registrado" : "Como você está? 30 segundos",
      done: checkinDone,
      href: "/registrar",
      tone: "coral",
    },
    {
      icon: ListChecks,
      label: "Tarefas e refeições",
      sub: tarefasDone
        ? "Tudo feito"
        : checklistTotal
          ? `${checklistChecked} de ${checklistTotal} tarefas`
          : "Ver o dia",
      done: tarefasDone,
      href: `/jornada/${day}`,
      tone: "sky",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  const [celebratingDay, setCelebratingDay] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [levelUp, setLevelUp] = useState<GardenLevel | null>(null);

  // 1 conclusão por dia-calendário: se outro dia já foi fechado hoje, o
  // próximo abre amanhã (sem isso, o programa de 14 dias vira 14 cliques)
  const closedTodayAlready = Object.entries(
    progress?.completedAt ?? {}
  ).some(([k, date]) => Number(k) !== day && date === today);

  // fim do programa sem próximo passo escolhido → não pode virar beco sem saída
  const programDone =
    (challenge === "main14" || challenge === "reset21") &&
    (progress?.completedDays.includes(totalLabel) ?? false);

  const bonusUnlocked = progress?.completedDays.includes(7) ?? false;

  async function concluirDia() {
    setBusy(true);
    const before = useAppStore.getState().data.seeds;
    // congela o dia ANTES de concluir: completeDay avança currentDay e a
    // celebração re-renderizaria com a mensagem do dia SEGUINTE (off-by-one)
    const concluded = day;
    const { blocked } = await completeDay(concluded);
    setBusy(false);
    if (blocked) return;
    const after = useAppStore.getState().data.seeds;
    setLevelUp(leveledUp(before, after));
    void haptic("success");
    setCelebratingDay(concluded);
  }

  // Modo Manutenção tem seu próprio fluxo
  if (challenge === "maintenance") {
    return <MaintenanceHome firstName={firstName} streak={streak.current} seeds={seeds} flags={data.flags} score={score} />;
  }

  const celebratedContent =
    celebratingDay !== null ? getDay(celebratingDay) : null;
  if (celebratingDay !== null && celebratedContent) {
    const isFinal = celebratingDay >= totalLabel;
    return (
      <DayCelebration
        message={celebratedContent.completionMessage}
        milestone={celebratedContent.milestone}
        levelUp={levelUp}
        onDone={() => {
          setCelebratingDay(null);
          setLevelUp(null);
          if (isFinal) router.replace("/concluir");
        }}
      />
    );
  }

  return (
    <div>
      {/* CAMPO DE COR — o topo da tela pertence à marca.
          Antes: creme sobre branco com acentos a 5% de saturação; tudo virava
          card branco sobre off-white e a tela lia como rascunho. Agora o verde
          primário aparece em força total num campo que sangra até o topo, e o
          conteúdo sobe por cima numa folha creme. É o esqueleto de Reverse
          Health (campo colorido + folha branca) com a cor que já é nossa. */}
      <div className="-mx-5 -mt-safe bg-sage-dark px-5 pt-safe">
        <div className="pb-14 pt-5">
          <header className="flex items-start justify-between">
            <div>
              <p className="text-[15px] text-white/70">{saudacao()},</p>
              <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-white">
                {firstName}
              </h1>
              {user?.onboarding?.bloatType && (
                <Link
                  href="/mapa"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white transition-transform active:scale-95"
                >
                  {BLOAT_PROFILES[user.onboarding.bloatType].name}
                  <ChevronRight className="-mr-1 size-3.5 opacity-70" />
                </Link>
              )}
            </div>
            {/* Contadores + entrada do Perfil. As sementes saíram daqui: elas
                já têm o SeedMeter logo abaixo, e o Perfil precisava de porta
                depois que a Nutri IA assumiu o lugar dele na barra de abas. */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-sm font-semibold text-white">
                <Flame className="size-4" /> {streak.current}
              </span>
              <Link
                href="/jardim"
                title="Escudos: cada um perdoa um dia perdido sem zerar sua sequência"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-sm font-semibold text-white transition-transform active:scale-95"
              >
                <Shield className="size-4" /> {streak.shields ?? MAX_SHIELDS}
              </Link>
              <Link
                href="/perfil"
                aria-label="Seu perfil"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-semibold uppercase text-white transition-transform active:scale-95"
              >
                {firstName.slice(0, 1)}
              </Link>
            </div>
          </header>

          {/* O número da tela, dentro do campo de cor */}
          <div className="mt-7 flex flex-col items-center">
            <ScoreRing
              value={score.value}
              from={Math.max(0, score.value - score.delta)}
              delta={score.delta}
              size={188}
              label="Índice Intestinal"
              tone="onColor"
            />
            <p className="mt-4 max-w-[17rem] text-center text-[15px] leading-relaxed text-white/80">
              {scoreMicrocopy(score.value, score.delta)}
            </p>
          </div>
        </div>
      </div>

      {/* A folha creme sobe por cima do campo — é o degrau que dá profundidade */}
      <div className="relative -mx-5 -mt-14 space-y-5 rounded-t-[2rem] bg-cream px-5 pt-6">
        {/* Faixa da semana */}
        <WeekStrip day={day} total={totalLabel} completed={progress?.completedDays ?? []} />

      {/* Programa fechado sem próximo passo escolhido → caminho pra /concluir
          (sem isso, quem sai da celebração nunca mais acha Reset/Manutenção) */}
      {programDone && (
        <Link href="/concluir" className="block">
          <Card
            elevation="lift"
            className="flex items-center gap-4 border border-gold/30 bg-gold-tint/40 transition-transform active:scale-[0.99]"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-white">
              <Trophy className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold tracking-tight text-ink">
                Você fechou o programa 🎉
              </h3>
              <p className="text-sm text-ink-soft">
                Escolha seu próximo passo: Reset Profundo ou Manutenção
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-ink-faint" />
          </Card>
        </Link>
      )}

      {/* Ordem da home (espelha Simple e Reverse Health): campo de cor com o
          número → régua de dias → a ação de hoje. Contexto, expectativa e
          conteúdo extra vêm depois — antes, a cliente rolava 11 cards para
          achar o que fazer. */}
      <ShieldSavedBanner />
      <WeeklyRecapBanner />

      {/* Quem fechou o app antes da 1ª Calmaria: o Dia 0 recomeça pelo alívio */}
      {!data.flags.primeiroAlivio &&
        progress?.startedAt &&
        diffDays(today, todayKey(new Date(progress.startedAt))) <= 2 && (
          <Link href="/calmaria" className="block">
            <Card
              elevation="lift"
              className="flex items-center gap-4 border border-sage/30 bg-gradient-to-br from-sage-tint/60 to-cream transition-transform active:scale-[0.99]"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage text-white shadow-[var(--shadow-sage)]">
                <Wind className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold tracking-tight text-ink">
                  Comece pelo alívio, não pela dieta
                </h3>
                <p className="text-sm text-ink-soft">
                  1 minuto de respiração guiada pra sentir a diferença agora
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-ink-faint" />
            </Card>
          </Link>
        )}

      {/* Seu dia de hoje — o ritual */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <Card elevation="lift" className="p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Dia {day} de {totalLabel} · {phase.phase}
              </p>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Seu dia de hoje
              </h2>
            </div>
            <DayRing done={doneCount} total={steps.length} />
          </div>

          <ul className="divide-y divide-line">
            {steps.map((s) => (
              <li key={s.label}>
                <button
                  onClick={() => router.push(s.href)}
                  className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-cream-deep/40"
                >
                  <StepIcon icon={s.icon} done={s.done} tone={s.tone} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-semibold tracking-tight",
                        s.done ? "text-ink-faint line-through" : "text-ink"
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="truncate text-sm text-ink-soft">{s.sub}</p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>

          {!dayCompleted && closedTodayAlready && (
            <div className="flex items-center justify-center gap-2 p-4 text-center text-sm text-ink-soft">
              Um dia por dia 💛 O Dia {day} abre pra concluir amanhã — hoje
              você já fechou o seu.
            </div>
          )}
          {!dayCompleted && !closedTodayAlready && (
            <div className="p-4">
              <Button
                fullWidth
                size="lg"
                loading={busy}
                variant={allDone ? "primary" : "secondary"}
                onClick={concluirDia}
              >
                {allDone ? `Concluir Dia ${day} 🎉` : `Fechar o dia mesmo assim`}
                {allDone && <ArrowRight className="size-5" />}
              </Button>
              {!allDone && (
                <p className="mt-2 text-center text-xs text-ink-faint">
                  Faltam {steps.length - doneCount} de {steps.length} — mas pode
                  fechar sem culpa 💛
                </p>
              )}
            </div>
          )}
          {dayCompleted && (
            <div className="flex items-center justify-center gap-2 p-4 text-sm font-semibold text-sage-dark">
              <Check className="size-4" strokeWidth={3} /> Dia {day} concluído
            </div>
          )}
        </Card>
      </motion.div>

      {/* A nutri fala primeiro (esqueleto do card COACH AVO em simple-1.jpg):
          o coach não espera pergunta — ele puxa conversa e mostra que está
          acompanhando. Fica logo abaixo da ação de hoje. */}
      <NutriProativa dia={day} fase={phase.phase} />

      {/* Calmaria — pilar Mente-Intestino (alívio sentido na hora) */}
      <Link href="/calmaria" className="block">
        <Card
          elevation="soft"
          className={cn(
            "flex items-center gap-4 transition-transform active:scale-[0.99]",
            calmariaDone
              ? "bg-sage-tint/40"
              : "border border-sage/25 bg-gradient-to-br from-sage-tint/50 to-cream"
          )}
        >
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl",
              calmariaDone ? "bg-sage text-white" : "bg-sage-tint text-sage-deep"
            )}
          >
            {calmariaDone ? (
              <Check className="size-6" strokeWidth={3} />
            ) : (
              <Wind className="size-6" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Calmaria de hoje
            </h3>
            <p className="text-sm text-ink-soft">
              {calmariaDone
                ? "Feita — seu intestino agradece 💚"
                : "1 min de respiração que acalma o intestino"}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Daqui pra baixo: contexto e conteúdo — nada disputa com a ação de hoje */}
      <CommitmentStrip />
      <Tracker72h />
      <ProjectionTimeline />
      <CicloCard />

      {/* Jardim / nível */}
      <SeedMeter />

      {/* Refeições de hoje */}
      {content && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-ink">
            <UtensilsCrossed className="size-4 text-sage-deep" /> Refeições de hoje
          </h2>
          <Link href={`/jornada/${day}`} className="block">
            <Card elevation="soft" className="space-y-2.5 transition-transform active:scale-[0.99]">
              {(
                [
                  ["meal-cafe", "☕", "Café", content.meals.cafe[0]],
                  ["meal-almoco", "🍽️", "Almoço", content.meals.almoco[0]],
                  ["meal-jantar", "🌙", "Jantar", content.meals.jantar[0]],
                ] as const
              ).map(([id, emoji, label, meal]) => (
                <div key={label} className="flex items-center gap-3 text-[15px]">
                  <Art id={id} emoji={emoji} className="size-8 shrink-0 rounded-lg text-lg" />
                  <span className="w-16 shrink-0 text-sm font-medium text-ink-faint">
                    {label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">{meal}</span>
                </div>
              ))}
            </Card>
          </Link>
        </section>
      )}

      {/* Bônus do Dia 7 — âncora de futuro visível desde o Dia 0 */}
      <Link href="/bonus" className="block">
        <Card
          elevation="soft"
          className={cn(
            "flex items-center gap-4 transition-transform active:scale-[0.99]",
            bonusUnlocked
              ? "border border-gold/30 bg-gold-tint/30"
              : "border border-line"
          )}
        >
          <Art
            id="bonus-comerfora"
            emoji="🍽️"
            className="size-12 shrink-0 rounded-2xl text-2xl"
          />
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 font-semibold tracking-tight text-ink">
              Bônus do Dia 7
              {!bonusUnlocked && <Lock className="size-3.5 text-ink-faint" />}
            </h3>
            <p className="text-sm text-ink-soft">
              {bonusUnlocked
                ? "Comer fora sem inchar — desbloqueado 🎉"
                : "Comer fora sem inchar: restaurante, churrasco, pizza e bar. Desbloqueia quando você fechar o Dia 7."}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Biblioteca */}
      <Link href="/aprender" className="block">
        <Card
          elevation="soft"
          className="flex items-center gap-4 transition-transform active:scale-[0.99]"
        >
          <IconCircle icon={BookOpen} tone="plum" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Aprender com a nutri
            </h3>
            <p className="text-sm text-ink-soft">Aulas, gatilhos, trocas e receitas</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Cardápio + lista de compras */}
      <Link href="/cardapio" className="block">
        <Card
          elevation="soft"
          className="flex items-center gap-4 transition-transform active:scale-[0.99]"
        >
          <IconCircle icon={UtensilsCrossed} tone="sage" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Cardápio da semana
            </h3>
            <p className="text-sm text-ink-soft">
              Seu menu seg–dom + lista de compras
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

        {/* Âncora de hábito e a nossa promessa honesta: importam, mas são
            leitura — ficam no fim, não na frente do que ela veio fazer. */}
        <RitualCard />
        <HonestWelcome />
      </div>
    </div>
  );
}

/* ----------------------------- subcomponentes ----------------------------- */

/** Relatório da Semana na home: aparece uma vez quando a semana fecha
 *  (dia 8, 15…) — a vitória tangível que preenche o vale das semanas 1–3. */
function WeeklyRecapBanner() {
  const data = useAppStore((s) => s.data);
  const update = useAppStore((s) => s.update);
  const { progress, logs, scores } = data;

  const startedAt = progress?.startedAt ?? null;
  const week = startedAt ? closedWeeks(startedAt) : 0;
  const dismissed = !!data.flags[`recapVisto:${week}`];
  const recap = useMemo(
    () =>
      startedAt && week >= 1 && !dismissed
        ? weeklyRecap(logs, scores, startedAt, week)
        : null,
    [logs, scores, startedAt, week, dismissed]
  );
  if (!recap) return null;

  return (
    <div className="relative">
      <WeeklyRecap recap={recap} />
      <button
        aria-label="Dispensar relatório"
        onClick={() =>
          void update((d) => {
            d.flags[`recapVisto:${week}`] = true;
          })
        }
        className="absolute right-3 top-3 rounded-full bg-cream-deep/80 p-1.5 text-ink-faint transition-colors active:bg-black/5"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/** Anel do Índice + explicador honesto: deixa claro que o número é um placar
 *  pessoal de progresso, não um exame clínico. */
function ScoreCard({ score }: { score: { value: number; delta: number } }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="flex flex-col items-center py-6" elevation="card">
      <ScoreRing
        value={score.value}
        from={Math.max(0, score.value - score.delta)}
        delta={score.delta}
        size={180}
        label="Índice Intestinal"
      />
      <p className="mt-3 max-w-[16rem] text-center text-[15px] leading-relaxed text-ink-soft">
        {scoreMicrocopy(score.value, score.delta)}
      </p>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition-colors active:text-ink-soft"
      >
        <Info className="size-3.5" /> O que é esse número?
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <p className="mt-2 max-w-[18rem] rounded-2xl bg-cream-deep/60 px-4 py-3 text-center text-[13px] leading-relaxed text-ink-soft">
              Seu placar pessoal: combina seus hábitos no app com a evolução
              dos seus sintomas. Não é um exame — é o termômetro do seu
              progresso aqui dentro.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/** A Nutri IA se apresentando na home, com uma frase que muda por fase e dois
 *  atalhos reais (conversar / fotografar o prato). Sem custo de IA: o texto é
 *  local; a conta só começa quando ela toca. */
function NutriProativa({ dia, fase }: { dia: number; fase: string }) {
  const fala: Record<string, string> = {
    Choque: `Nos próximos 3 dias eu vou aprender o seu padrão pra afinar o seu protocolo. Me conta como você acordou hoje.`,
    Remoção: `Nesta fase o inchaço começa a ceder. Se bater dúvida na hora de comer, me pergunta antes — é pra isso que eu estou aqui.`,
    Reintrodução: `Cada teste desta fase vale ouro. Me conta como você reagiu ao de hoje que eu te ajudo a ler o resultado.`,
    Reparo: `A partir daqui a gente devolve comida à sua mesa, no seu ritmo. Não corte nada por medo antes de falar comigo.`,
    Reequilíbrio: `Você já sabe o que te incha. Agora é viver com isso sem virar prisão — me pergunta o que quiser.`,
  };

  return (
    <Card elevation="soft" className="border border-sage/20 p-0">
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-sage-tint text-sage-dark">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Nutri IA · dia {dia}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">
            {fala[fase] ??
              "Estou aqui com o seu histórico na mão — o que você comeu, como tem acordado e o que já descobrimos que te incha."}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-2xl border-t border-line bg-line">
        <Link
          href="/nutri"
          className="flex items-center justify-center gap-2 bg-surface py-3 text-sm font-semibold text-sage-dark transition-colors active:bg-sage-tint/40"
        >
          <MessageCircle className="size-4" /> Falar com ela
        </Link>
        <Link
          href="/nutri?camera=1"
          className="flex items-center justify-center gap-2 bg-surface py-3 text-sm font-semibold text-sage-dark transition-colors active:bg-sage-tint/40"
        >
          <Camera className="size-4" /> Analisar meu prato
        </Link>
      </div>
    </Card>
  );
}

/** Aviso gentil e dispensável quando um escudo cobriu um dia perdido. Reforça
 *  que um deslize não quebra o progresso (anti-vergonha, pró-retenção). */
function ShieldSavedBanner() {
  const shown = useAppStore((s) => s.data.flags.shieldJustUsed);
  const update = useAppStore((s) => s.update);
  if (!shown) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-2xl border border-sage/30 bg-sage-tint/60 px-4 py-3"
    >
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sage-deep" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Seu escudo salvou a sequência 🛡️</p>
        <p className="text-sm text-ink-soft">
          Você faltou um dia — e tudo bem. Um deslize não apaga seu progresso.
          Bora de novo hoje.
        </p>
      </div>
      <button
        aria-label="Dispensar"
        onClick={() => void update((d) => { d.flags.shieldJustUsed = false; })}
        className="shrink-0 rounded-full p-1 text-ink-faint transition-colors active:bg-black/5"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

/** Boas-vindas honestas (uma vez): valida a usuária e define expectativas reais
 *  antes de prometer demais — o maior gesto anti-"furada"/anti-reembolso. */
function HonestWelcome() {
  const seen = useAppStore((s) => !!s.data.flags.honestoVisto);
  const update = useAppStore((s) => s.update);
  if (seen) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-coral/20 bg-gradient-to-br from-coral-tint/40 to-cream"
    >
      <div className="flex items-start gap-3 p-4">
        <HeartPulse className="mt-0.5 size-5 shrink-0 text-coral-dark" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold tracking-tight text-ink">
            Seus sintomas são reais — e a gente é honesto com você
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Sem detox milagroso, sem “barriga chapada em 14 dias”. Veja o que
            estes dias podem e o que não podem fazer, com as fontes. E a gente
            só te pede uma coisa:{" "}
            <strong className="font-semibold text-ink">
              faça 7 check-ins antes de decidir se isso funciona pra você
            </strong>
            .
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/ciencia"
              className={buttonStyles({ size: "sm" })}
              onClick={() => void update((d) => { d.flags.honestoVisto = true; })}
            >
              Ver a verdade
            </Link>
            <button
              onClick={() => void update((d) => { d.flags.honestoVisto = true; })}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-faint transition-colors active:bg-black/5"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Ritual "se-então" (implementation intention): a usuária ancora o hábito a um
 *  momento que já existe. Maior efeito por feature na adesão (Gollwitzer 2006). */
function RitualCard() {
  const anchor = useAppStore((s) => s.data.ritualAnchor);
  const setRitual = useAppStore((s) => s.setRitual);

  if (anchor) {
    return (
      <Card elevation="soft" className="flex items-center gap-3 bg-sage-tint/30">
        <Anchor className="size-5 shrink-0 text-sage-deep" />
        <p className="min-w-0 flex-1 text-[15px] text-ink">
          <span className="font-semibold">{anchor}</span>, eu cuido do meu
          intestino.
        </p>
        <button
          onClick={() => void setRitual("")}
          className="shrink-0 text-sm font-semibold text-ink-faint underline-offset-4 active:underline"
        >
          Mudar
        </button>
      </Card>
    );
  }

  return (
    <Card elevation="soft" className="border border-sage/20">
      <div className="flex items-start gap-3">
        <Anchor className="mt-0.5 size-5 shrink-0 text-sage-deep" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold tracking-tight text-ink">Crie seu gatilho</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            Quem ancora o hábito a um momento que já existe tem muito mais chance
            de manter. Escolha o seu:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {RITUAL_ANCHORS.map((a) => (
              <button
                key={a}
                onClick={() => void setRitual(a)}
                className="rounded-full bg-cream-deep px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors active:bg-sage-tint"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Ciclo × inchaço: normaliza a oscilação hormonal (diferencial feminino). */
function CicloCard() {
  const cycleStart = useAppStore((s) => s.data.cycleStart);
  const setCycleStart = useAppStore((s) => s.setCycleStart);
  const [open, setOpen] = useState(false);
  const info = cycleStart ? cycleInfo(cycleStart) : null;

  return (
    <Card elevation="soft" className="border border-coral/15 bg-coral-tint/20">
      <div className="flex items-start gap-3">
        <Art
          id="ciclo-lua"
          emoji="🌙"
          className="mt-0.5 size-10 shrink-0 rounded-xl text-xl"
        />
        <div className="min-w-0 flex-1">
          {info ? (
            <>
              <p className="font-semibold tracking-tight text-ink">
                Ciclo · fase {info.label} (dia {info.dayOfCycle})
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                {info.note}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold tracking-tight text-ink">
                Seu inchaço acompanha o ciclo?
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                Diga quando começou sua última menstruação e a gente te avisa
                quando o inchaço for hormonal — pra você não achar que é recaída.
              </p>
            </>
          )}
          <div className="mt-2.5 flex items-center gap-3">
            <button
              onClick={() => setOpen((o) => !o)}
              className="text-sm font-semibold text-coral-dark underline-offset-4 active:underline"
            >
              {info ? "Atualizar data" : "Registrar minha menstruação"}
            </button>
            {open && (
              <input
                type="date"
                max={todayKey()}
                defaultValue={cycleStart ?? ""}
                onChange={(e) => {
                  if (e.target.value) {
                    void setCycleStart(e.target.value);
                    setOpen(false);
                  }
                }}
                className="rounded-xl border border-line bg-cream px-3 py-1.5 text-sm text-ink"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepIcon({
  icon: Icon,
  done,
  tone,
}: {
  icon: LucideIcon;
  done: boolean;
  tone: "sage" | "coral" | "sky";
}) {
  const tones = {
    sage: "bg-sage-tint text-sage-dark",
    coral: "bg-coral-tint text-coral-dark",
    sky: "bg-sky-tint text-[#3d6f88]",
  };
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
        done ? "bg-sage text-white" : tones[tone]
      )}
    >
      {done ? <Check className="size-5" strokeWidth={2.8} /> : <Icon className="size-5" />}
    </span>
  );
}

function DayRing({ done, total }: { done: number; total: number }) {
  const size = 48;
  const r = 20;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-cream-deep)" strokeWidth="5" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.7, ease }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-ink">
        {done}/{total}
      </span>
    </div>
  );
}

function WeekStrip({
  day,
  total,
  completed,
}: {
  day: number;
  total: number;
  completed: number[];
}) {
  const weekStart = Math.floor((day - 1) / 7) * 7 + 1;
  const days = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(
    (d) => d <= Math.max(total, 7)
  );
  return (
    <div className="flex justify-between gap-1.5">
      {days.map((d) => {
        const done = completed.includes(d);
        const isCurrent = d === day;
        const future = d > day;
        return (
          <div key={d} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full text-sm font-semibold transition-colors",
                done && "bg-sage text-white",
                isCurrent && !done && "bg-coral text-white ring-4 ring-coral-tint",
                future && "bg-cream-deep text-ink-faint"
              )}
            >
              {done ? <Check className="size-4" strokeWidth={2.8} /> : d}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DayCelebration({
  message,
  milestone,
  levelUp,
  onDone,
}: {
  message: string;
  milestone?: string;
  levelUp?: GardenLevel | null;
  onDone: () => void;
}) {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-8 text-center">
      <Confetti />
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
      >
        <Art
          id={milestone ? "celebra-semana1" : "celebra-dia"}
          emoji={milestone ? "🏆" : "🌅"}
          className="size-32 rounded-[2rem] text-6xl shadow-[var(--shadow-soft)]"
        />
      </motion.div>
      {milestone && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-sm font-semibold text-[#9a7322]"
        >
          <Sparkles className="size-4" /> {milestone}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 max-w-sm font-display text-2xl font-semibold leading-snug tracking-tight text-ink"
      >
        {message}
      </motion.h2>

      {levelUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 240, damping: 15 }}
          className="mt-5 rounded-2xl bg-sage-tint px-5 py-3 text-sage-dark"
        >
          <Art
            id={levelUp.art}
            emoji={levelUp.emoji}
            className="mx-auto size-16 rounded-2xl text-3xl"
          />
          <p className="mt-1 font-semibold">Subiu de nível: {levelUp.name}!</p>
          {levelUp.unlock && (
            <p className="text-sm">Desbloqueou: {levelUp.unlock}</p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 w-full max-w-xs"
      >
        <Button fullWidth size="lg" onClick={onDone}>
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}

function MaintenanceHome({
  firstName,
  streak,
  seeds,
  flags,
  score,
}: {
  firstName: string;
  streak: number;
  seeds: number;
  flags: Record<string, boolean>;
  score: { value: number; delta: number };
}) {
  const calmariaDone = !!flags[`calmaria:${todayKey()}`];
  const completedChallenge = useAppStore(
    (s) => s.data.progress?.completedChallenge
  );
  const startResetProfundo = useAppStore((s) => s.startResetProfundo);
  const router = useRouter();
  const [resetBusy, setResetBusy] = useState(false);
  // quem fechou só o main14 ainda pode aprofundar com o Reset (+7 dias)
  const canStillReset = completedChallenge === "main14";

  async function irParaReset() {
    setResetBusy(true);
    await startResetProfundo();
    router.replace("/jornada");
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between pt-5">
        <div>
          <p className="text-[15px] text-ink-soft">{saudacao()},</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1.5 text-sm font-semibold text-sage-dark">
            <Sprout className="size-4" /> {seeds}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-tint px-3 py-1.5 text-sm font-semibold text-coral-dark">
            <Flame className="size-4" /> {streak}
          </span>
        </div>
      </header>

      <ShieldSavedBanner />
      <WeeklyRecapBanner />

      <Card elevation="card" className="bg-gradient-to-br from-sage-deep to-sage-dark text-white">
        <Badge tone="gold" className="bg-white/20 text-white">
          Modo Manutenção
        </Badge>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
          Sua leveza, todo dia
        </h2>
        <p className="mt-1 text-[15px] text-white/85">
          Seu intestino está bem — manutenção é o que impede de voltar. Registre,
          observe e mantenha o ritmo.
        </p>
      </Card>

      <Link href="/registrar" className="block">
        <Card elevation="soft" className="flex items-center gap-4 transition-transform active:scale-[0.99]">
          <IconCircle icon={HeartPulse} tone="sage" size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">Check-in de hoje</h3>
            <p className="text-sm text-ink-soft">30 segundos · mantém seu índice ({score.value})</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      {/* Calmaria continua existindo na Manutenção (era o único link do app) */}
      <Link href="/calmaria" className="block">
        <Card
          elevation="soft"
          className={cn(
            "flex items-center gap-4 transition-transform active:scale-[0.99]",
            calmariaDone
              ? "bg-sage-tint/40"
              : "border border-sage/25 bg-gradient-to-br from-sage-tint/50 to-cream"
          )}
        >
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl",
              calmariaDone ? "bg-sage text-white" : "bg-sage-tint text-sage-deep"
            )}
          >
            {calmariaDone ? (
              <Check className="size-6" strokeWidth={3} />
            ) : (
              <Wind className="size-6" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-ink">
              Calmaria de hoje
            </h3>
            <p className="text-sm text-ink-soft">
              {calmariaDone
                ? "Feita — seu intestino agradece 💚"
                : "1 min de respiração que acalma o intestino"}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-ink-faint" />
        </Card>
      </Link>

      <CicloCard />

      <ScoreCard score={score} />

      <div>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-ink">
          Desafios mensais
        </h2>
        <div className="space-y-3">
          {MONTHLY_CHALLENGES.map((c) => {
            const done = c.dias.filter((d) => flags[`mc:${c.id}:${d.day}`]).length;
            return (
              <Link key={c.id} href={`/desafios/${c.id}`} className="block">
                <Card elevation="soft" className="flex items-center gap-4 transition-transform active:scale-[0.99]">
                  <Art
                    id={artId(c.emoji) ?? ""}
                    emoji={c.emoji}
                    className="size-12 shrink-0 rounded-2xl bg-cream-deep text-3xl"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold tracking-tight text-ink">{c.nome}</h3>
                    <p className="truncate text-sm text-ink-soft">
                      {done > 0 ? `${done}/${c.dias.length} dias` : c.descricao}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-faint" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {canStillReset && (
        <Card elevation="soft" className="border border-sage/25">
          <h3 className="font-semibold tracking-tight text-ink">
            Reset Profundo · +7 dias
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Aprofunda a reintrodução (incluindo o grupo que ficou de fora) e
            ajusta sono, estresse e movimento.
          </p>
          <Button
            variant="secondary"
            size="md"
            className="mt-3"
            loading={resetBusy}
            onClick={irParaReset}
          >
            Começar o Reset <ArrowRight className="size-4" />
          </Button>
        </Card>
      )}

      <Link href="/aprender" className={buttonStyles({ variant: "secondary", size: "lg", fullWidth: true })}>
        Biblioteca da nutri
      </Link>
    </div>
  );
}
