"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Droplets,
  Flame,
  HeartPulse,
  Route,
  ShieldCheck,
  ShieldOff,
  Sprout,
  Trophy,
  UtensilsCrossed,
  Wind,
  X,
} from "lucide-react";
import { Broto } from "@/components/broto/Broto";
import { Cenario } from "@/components/home/Cenario";
import { CartaoDoDia, type LinhaDoDia } from "@/components/home/CartaoDoDia";
import { FraseDoDia } from "@/components/home/FraseDoDia";
import { Confetti } from "@/components/Confetti";
import { RitualCard } from "@/components/RitualCard";
import { WeeklyRecap } from "@/components/WeeklyRecap";
import { Button, Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { estadoBroto, subiuDeNivel, type NivelDef } from "@/lib/broto";
import { falaDoBroto } from "@/content/broto";
import { fraseDoDia, momentoAtual } from "@/content/frases";
import { phaseForDay, totalDays } from "@/lib/journey";
import { getDay } from "@/content/journey";
import { closedWeeks, weeklyRecap } from "@/lib/recap";
import { cycleInfo } from "@/lib/cycle";
import { todayKey } from "@/lib/date";
import { haptic } from "@/lib/haptics";
import { SEEDS } from "@/lib/garden";
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
  const marcarAgua = useAppStore((s) => s.marcarAgua);
  const marcarSemGatilho = useAppStore((s) => s.marcarSemGatilho);

  const { user, progress, streak, seeds, seedsLifetime } = data;
  const hoje = todayKey();
  const dia = progress?.currentDay ?? 1;
  const desafio = progress?.challengeType ?? "main14";
  const fase = phaseForDay(dia, desafio);
  const total = totalDays(desafio);
  const totalRotulo = Number.isFinite(total) ? total : 21;
  const primeiroNome = (user?.name ?? "você").split(" ")[0];
  const conteudo = getDay(dia);

  /* ------------------------------ o dia ------------------------------ */

  const aulaFeita = !!data.lessonsDone[dia];
  const checkinFeito = data.logs.some((l) => l.date === hoje);
  const aguaFeita = !!data.flags[`agua:${hoje}`];
  const semGatilhoFeito = !!data.flags[`semGatilho:${hoje}`];
  const calmariaFeita = !!data.flags[`calmaria:${hoje}`];
  const diaConcluido = progress?.completedDays.includes(dia) ?? false;

  const linhas: LinhaDoDia[] = [
    {
      icone: HeartPulse,
      rotulo: "Check-in de hoje",
      detalhe: checkinFeito ? "Registrado" : "Como você está? 30 segundos",
      feito: checkinFeito,
      href: "/registrar",
      sementes: SEEDS.checkin,
    },
    {
      icone: BookOpen,
      rotulo: "Aula do dia",
      detalhe: aulaFeita
        ? "Concluída"
        : `${conteudo?.lesson.durationMin ?? 2} min · ${conteudo?.lesson.title ?? ""}`,
      feito: aulaFeita,
      href: `/jornada/${dia}/aula`,
      sementes: SEEDS.lesson,
    },
    {
      icone: Wind,
      rotulo: "Calmaria",
      detalhe: calmariaFeita
        ? "Feita"
        : "1 min de respiração que acalma o intestino",
      feito: calmariaFeita,
      href: "/calmaria",
      sementes: SEEDS.calmaria,
    },
    {
      icone: Droplets,
      rotulo: "Água do dia",
      detalhe: aguaFeita ? "Bebida" : "Cerca de 1,5 L — toque para marcar",
      feito: aguaFeita,
      aoMarcar: async () => {
        await marcarAgua();
        void haptic("light");
      },
      sementes: SEEDS.agua,
    },
    {
      icone: ShieldOff,
      rotulo: "Passei sem o meu gatilho",
      detalhe: semGatilhoFeito
        ? "Que dia, hein"
        : "A escolha difícil vale mais sementes",
      feito: semGatilhoFeito,
      aoMarcar: async () => {
        await marcarSemGatilho();
        void haptic("success");
      },
      sementes: SEEDS.semGatilho,
    },
  ];

  const acoesHoje = linhas.filter((l) => l.feito).length;

  /* ---------------------------- o personagem ---------------------------- */

  const broto = estadoBroto(seedsLifetime, acoesHoje, diaConcluido);
  const fala = falaDoBroto(broto.humor, dia);

  /* ------------------------------ a frase ------------------------------ */

  const ciclo = data.cycleStart ? cycleInfo(data.cycleStart) : null;
  const frase = fraseDoDia(
    momentoAtual({
      tpm: ciclo?.phase === "lutea",
      diaFechado: diaConcluido,
      acoesHoje,
      resgatouPrazerOntem: !!data.flags[`prazerResgatado:${hoje}`],
    }),
    dia
  );

  /* ---------------------------- fechar o dia ---------------------------- */

  const [comemorando, setComemorando] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [nivelNovo, setNivelNovo] = useState<NivelDef | null>(null);

  // 1 conclusão por dia-calendário: sem isso, o programa de 14 dias vira 14
  // cliques em dois minutos.
  const fechadoOutroHoje = Object.entries(progress?.completedAt ?? {}).some(
    ([k, d]) => Number(k) !== dia && d === hoje
  );

  const programaFechado =
    (desafio === "main14" || desafio === "reset21") &&
    (progress?.completedDays.includes(totalRotulo) ?? false);

  async function fecharDia() {
    setOcupado(true);
    const antes = useAppStore.getState().data.seedsLifetime;
    // congela o dia ANTES de concluir: completeDay avança currentDay e a
    // celebração renderizaria a mensagem do dia SEGUINTE (off-by-one)
    const fechado = dia;
    const { blocked } = await completeDay(fechado);
    setOcupado(false);
    if (blocked) return;
    const depois = useAppStore.getState().data.seedsLifetime;
    setNivelNovo(subiuDeNivel(antes, depois));
    void haptic("success");
    setComemorando(fechado);
  }

  if (desafio === "maintenance") {
    return <HomeManutencao primeiroNome={primeiroNome} />;
  }

  const conteudoComemorado = comemorando !== null ? getDay(comemorando) : null;
  if (comemorando !== null && conteudoComemorado) {
    const ehFinal = comemorando >= totalRotulo;
    return (
      <Comemoracao
        mensagem={conteudoComemorado.completionMessage}
        marco={conteudoComemorado.milestone}
        nivelNovo={nivelNovo}
        aoFechar={() => {
          setComemorando(null);
          setNivelNovo(null);
          if (ehFinal) router.replace("/concluir");
        }}
      />
    );
  }

  return (
    <div className="pb-2">
      <Cenario nivel={broto.nivel.id} humor={broto.humor}>
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] text-white/65">{saudacao()},</p>
            <h1 className="font-display text-h1 font-semibold text-white">
              {primeiroNome}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Contador icone={Flame} valor={streak.current} rotulo="dias seguidos" />
            <Contador icone={Sprout} valor={seeds} rotulo="sementes" />
            <Link
              href="/perfil"
              aria-label="Seu perfil"
              className="grid size-9 place-items-center rounded-full bg-white/15 text-sm font-semibold uppercase text-white transition-transform active:scale-95"
            >
              {primeiroNome.slice(0, 1)}
            </Link>
          </div>
        </header>
      </Cenario>

      {/* A folha creme sobe por cima do cenário — o degrau que dá profundidade */}
      <div className="relative -mx-5 -mt-2 space-y-4 bg-cream px-5">
        {/* A fala do Broto vem ANTES do cartão: é ele quem recebe ela na tela,
            e a fala é o que faz o boneco parecer vivo em vez de enfeite. */}
        <p className="px-4 text-center text-[15px] leading-relaxed text-ink-soft">
          {fala}
        </p>

        <AvisoEscudo />
        <RelatorioDaSemana />

        <CartaoDoDia
          dia={dia}
          totalDias={totalRotulo}
          fase={fase.phase}
          linhas={linhas}
          diaConcluido={diaConcluido}
          fechadoOutroHoje={fechadoOutroHoje}
          ocupado={ocupado}
          aoFecharDia={fecharDia}
        />

        {programaFechado && (
          <Link href="/concluir" className="block">
            <Card
              elevation="lift"
              className="flex items-center gap-4 border border-gold/40 bg-gold-tint/40 transition-transform active:scale-[0.99]"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-white">
                <Trophy className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold tracking-tight text-ink">
                  Você fechou o programa
                </h3>
                <p className="text-sm text-ink-soft">
                  Escolha o próximo passo: Reset Profundo ou Manutenção
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-ink-faint" />
            </Card>
          </Link>
        )}

        {/* Só aparece enquanto ela não escolheu a âncora do hábito. */}
        <RitualCard />

        <ProgressoDoBroto
          nome={broto.nivel.nome}
          proximo={broto.proximo?.nome ?? null}
          progresso={broto.progresso}
          faltam={broto.faltam}
        />

        <FraseDoDia frase={frase} />

        {/* Atalhos em grade compacta. Antes cada um destes era um cartão
            branco de largura inteira — sete deles em fila é a "sopa de card"
            que fazia a tela inteira ter o mesmo peso. */}
        <nav className="grid grid-cols-2 gap-3 pb-2">
          <Atalho
            href="/jornada"
            icone={Route}
            titulo="Sua trilha"
            detalhe={`Dia ${dia} de ${totalRotulo}`}
          />
          <Atalho
            href="/cardapio"
            icone={UtensilsCrossed}
            titulo="Cardápio"
            detalhe="Semana + compras"
          />
          <Atalho
            href="/aprender"
            icone={BookOpen}
            titulo="Biblioteca"
            detalhe="Aulas e receitas"
          />
          <Atalho
            href="/mapa"
            icone={Sprout}
            titulo="Meu mapa"
            detalhe="O que me incha"
          />
        </nav>
      </div>
    </div>
  );
}

/* ----------------------------- subcomponentes ----------------------------- */

function Contador({
  icone: Icone,
  valor,
  rotulo,
}: {
  icone: typeof Flame;
  valor: number;
  rotulo: string;
}) {
  return (
    <span
      title={rotulo}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-sm font-semibold text-white"
    >
      <Icone className="size-4" />
      {valor}
    </span>
  );
}

function Atalho({
  href,
  icone: Icone,
  titulo,
  detalhe,
}: {
  href: string;
  icone: typeof Route;
  titulo: string;
  detalhe: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 transition-transform active:scale-[0.98]"
    >
      <Icone className="size-5 text-rose-deep" />
      <span>
        <span className="block font-semibold tracking-tight text-ink">
          {titulo}
        </span>
        <span className="block text-sm text-ink-soft">{detalhe}</span>
      </span>
    </Link>
  );
}

/** Barra fina de progresso do personagem — o "por que continuar" do dia. */
function ProgressoDoBroto({
  nome,
  proximo,
  progresso,
  faltam,
}: {
  nome: string;
  proximo: string | null;
  progresso: number;
  faltam: number;
}) {
  return (
    <Link
      href="/prazeres"
      className="block rounded-2xl border border-line bg-surface px-4 py-3.5 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{nome}</p>
        <p className="text-sm text-ink-soft">
          {proximo ? `faltam ${faltam} para ${proximo}` : "nível máximo"}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-deep">
        <motion.div
          className="h-full rounded-full bg-rose"
          initial={{ width: 0 }}
          animate={{ width: `${progresso * 100}%` }}
          transition={{ duration: 0.7, ease }}
        />
      </div>
    </Link>
  );
}

/** Aviso gentil e dispensável quando um escudo cobriu um dia perdido. */
function AvisoEscudo() {
  const mostrar = useAppStore((s) => s.data.flags.shieldJustUsed);
  const update = useAppStore((s) => s.update);
  if (!mostrar) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-2xl border border-rose/25 bg-rose-tint/70 px-4 py-3"
    >
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-rose-deep" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          Seu escudo salvou a sequência
        </p>
        <p className="text-sm text-ink-soft">
          Você faltou um dia — e tudo bem. Um deslize não apaga seu progresso.
        </p>
      </div>
      <button
        aria-label="Dispensar"
        onClick={() =>
          void update((d) => {
            d.flags.shieldJustUsed = false;
          })
        }
        className="shrink-0 rounded-full p-1 text-ink-faint transition-colors active:bg-black/5"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

/** Relatório da Semana: aparece uma vez quando a semana fecha (dia 8, 15…). */
function RelatorioDaSemana() {
  const data = useAppStore((s) => s.data);
  const update = useAppStore((s) => s.update);
  const { progress, logs, scores } = data;

  const inicio = progress?.startedAt ?? null;
  const semana = inicio ? closedWeeks(inicio) : 0;
  const dispensado = !!data.flags[`recapVisto:${semana}`];
  const recap = useMemo(
    () =>
      inicio && semana >= 1 && !dispensado
        ? weeklyRecap(logs, scores, inicio, semana)
        : null,
    [logs, scores, inicio, semana, dispensado]
  );
  if (!recap) return null;

  return (
    <div className="relative">
      <WeeklyRecap recap={recap} />
      <button
        aria-label="Dispensar relatório"
        onClick={() =>
          void update((d) => {
            d.flags[`recapVisto:${semana}`] = true;
          })
        }
        className="absolute right-3 top-3 rounded-full bg-cream-deep/80 p-1.5 text-ink-faint transition-colors active:bg-black/5"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function Comemoracao({
  mensagem,
  marco,
  nivelNovo,
  aoFechar,
}: {
  mensagem: string;
  marco?: string;
  nivelNovo?: NivelDef | null;
  aoFechar: () => void;
}) {
  const seedsLifetime = useAppStore((s) => s.data.seedsLifetime);
  const nivel = estadoBroto(seedsLifetime, 5, true).nivel;

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-8 text-center">
      <Confetti />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
      >
        <BrotoDaComemoracao nivelId={nivel.id} />
      </motion.div>

      {marco && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-sm font-semibold text-gold-dark"
        >
          <Trophy className="size-4" /> {marco}
        </motion.p>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 max-w-sm font-display text-h2 font-semibold text-ink"
      >
        {mensagem}
      </motion.h2>

      {nivelNovo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 240, damping: 16 }}
          className="mt-5 rounded-2xl bg-rose-tint px-5 py-3 text-rose-dark"
        >
          <p className="font-semibold">Seu broto virou {nivelNovo.nome}</p>
          {nivelNovo.abre && (
            <p className="text-sm">Desbloqueou: {nivelNovo.abre}</p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 w-full max-w-xs"
      >
        <Button fullWidth size="lg" onClick={aoFechar}>
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}

function BrotoDaComemoracao({ nivelId }: { nivelId: NivelDef["id"] }) {
  // O Broto sozinho, sem o Cenario: aqui o fundo já é a folha creme, e o céu
  // rosa do cenário brigaria com o confete.
  return <Broto nivel={nivelId} humor="comemorando" size={168} />;
}

/** Modo Manutenção — o "para sempre" do app, sem trilha de dias. */
function HomeManutencao({ primeiroNome }: { primeiroNome: string }) {
  const data = useAppStore((s) => s.data);
  const hoje = todayKey();
  const checkinFeito = data.logs.some((l) => l.date === hoje);
  const calmariaFeita = !!data.flags[`calmaria:${hoje}`];
  const acoes = [checkinFeito, calmariaFeita].filter(Boolean).length;
  const broto = estadoBroto(data.seedsLifetime, acoes, false);

  return (
    <div className="pb-2">
      <Cenario nivel={broto.nivel.id} humor={broto.humor}>
        <header>
          <p className="text-[15px] text-white/65">{saudacao()},</p>
          <h1 className="font-display text-h1 font-semibold text-white">
            {primeiroNome}
          </h1>
          <p className="mt-1 text-sm text-white/70">Modo Manutenção</p>
        </header>
      </Cenario>

      <div className="relative -mx-5 -mt-2 space-y-4 bg-cream px-5">
        <p className="px-2 text-center text-[15px] leading-relaxed text-ink-soft">
          {falaDoBroto(broto.humor, 1)}
        </p>

        <Link href="/registrar" className="block">
          <Card
            elevation="lift"
            className="flex items-center gap-4 transition-transform active:scale-[0.99]"
          >
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-2xl",
                checkinFeito
                  ? "bg-rose text-white"
                  : "bg-rose-tint text-rose-dark"
              )}
            >
              <HeartPulse className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold tracking-tight text-ink">
                Check-in de hoje
              </h3>
              <p className="text-sm text-ink-soft">
                {checkinFeito ? "Registrado" : "30 segundos mantêm seu ritmo"}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-ink-faint" />
          </Card>
        </Link>

        <nav className="grid grid-cols-2 gap-3 pb-2">
          <Atalho
            href="/calmaria"
            icone={Wind}
            titulo="Calmaria"
            detalhe="1 min de respiração"
          />
          <Atalho
            href="/desafios"
            icone={Trophy}
            titulo="Desafios"
            detalhe="Mensais"
          />
          <Atalho
            href="/cardapio"
            icone={UtensilsCrossed}
            titulo="Cardápio"
            detalhe="Semana + compras"
          />
          <Atalho
            href="/aprender"
            icone={BookOpen}
            titulo="Biblioteca"
            detalhe="Aulas e receitas"
          />
        </nav>
      </div>
    </div>
  );
}
