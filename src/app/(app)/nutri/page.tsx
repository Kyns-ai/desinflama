"use client";

/**
 * A Nutri IA — a aba fixa da nutricionista.
 *
 * Esqueleto copiado do Coach do app Simple (docs/referencia/simple-1.jpg e
 * simple-4.jpg): a coach FALA PRIMEIRO sem ser perguntada, cada resposta vem
 * com perguntas prontas embaixo (a cliente nunca encara um campo em branco) e
 * a foto do prato vira um veredito colorido dentro da própria conversa. A cor,
 * a fonte e o assunto são nossos: lá é caloria e macro, aqui é o que incha o
 * intestino DELA.
 *
 * O contexto dela (tipo de inchaço, dia do programa, mapa de tolerância,
 * últimos check-ins) vai junto de cada pergunta — ver lib/nutriContexto.ts.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Camera,
  Flame,
  Leaf,
  Loader2,
  MessageCircle,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { kv } from "@/data/storage";
import { prepararFoto } from "@/lib/imagem";
import { haptic } from "@/lib/haptics";
import { phaseForDay } from "@/lib/journey";
import { useContextoNutri, useEstiloNutri } from "@/lib/nutriContexto";
import {
  ApiIndisponivel,
  ESTILOS_NUTRI,
  LimiteDiarioAtingido,
  nutriApi,
  type DadosDaAnalise,
  type EstiloNutri,
} from "@/lib/nutriApi";
import { cn } from "@/lib/cn";

const CHAVE_CONVERSA = "desinflama:nutri:conversa";
const ease = [0.22, 1, 0.36, 1] as const;

interface Mensagem {
  id: string;
  autor: "cliente" | "nutri";
  texto: string;
  /** Quando a mensagem é o resultado de uma foto. */
  analise?: { previa: string; dados: DadosDaAnalise | null };
  /** Perguntas prontas que acompanham a resposta. */
  sugestoes?: string[];
}

/** Semáforo — os mesmos três níveis de content/semaforo.ts, aqui em cor. */
const SEMAFORO = {
  calma: {
    rotulo: "Cai bem pra você",
    Icone: Leaf,
    texto: "text-sage-dark",
    fundo: "bg-sage-tint",
    borda: "border-sage/40",
  },
  atencao: {
    rotulo: "Depende da porção",
    Icone: TriangleAlert,
    texto: "text-[#9a7322]",
    fundo: "bg-gold-tint",
    borda: "border-gold/40",
  },
  inflama: {
    rotulo: "Esse costuma te inchar",
    Icone: Flame,
    texto: "text-coral-dark",
    fundo: "bg-coral-tint",
    borda: "border-coral/40",
  },
} as const;

/** `useSearchParams` obriga um limite de Suspense sob `output: 'export'` — sem
 *  ele o build quebra (a rota é pré-renderizada e a query só existe no cliente). */
export default function NutriIAPage() {
  return (
    <Suspense fallback={<AberturaCarregando />}>
      <NutriIA />
    </Suspense>
  );
}

function AberturaCarregando() {
  return (
    <div className="flex items-center gap-2.5 pt-8 text-[15px] text-ink-soft">
      <Loader2 className="size-4 animate-spin text-sage-deep" />
      Abrindo sua conversa…
    </div>
  );
}

function NutriIA() {
  const params = useSearchParams();
  const { estilo, escolher, carregando: carregandoEstilo } = useEstiloNutri();
  const contexto = useContextoNutri(estilo);
  const user = useAppStore((s) => s.data.user);
  const dia = useAppStore((s) => s.data.progress?.currentDay ?? 1);
  const desafio = useAppStore((s) => s.data.progress?.challengeType ?? "main14");
  const primeiroNome = (user?.name ?? "você").split(" ")[0];

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [pensando, setPensando] = useState(false);
  const [parcial, setParcial] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [temAcesso, setTemAcesso] = useState<boolean | null>(null);
  const [trocandoEstilo, setTrocandoEstilo] = useState(false);

  const fotoRef = useRef<HTMLInputElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const conversaCarregada = useRef(false);

  const fase = phaseForDay(dia, desafio).phase;

  /* ---------------------------- carga inicial ---------------------------- */

  useEffect(() => {
    void (async () => {
      setTemAcesso(Boolean(await nutriApi.token()));
      const guardada = await kv.get<Mensagem[]>(CHAVE_CONVERSA);
      if (guardada?.length) setMensagens(guardada);
      conversaCarregada.current = true;
    })();
  }, []);

  // guarda a conversa (ela volta amanhã e a nutri lembra do que falaram)
  useEffect(() => {
    if (!conversaCarregada.current) return;
    void kv.set(CHAVE_CONVERSA, mensagens.slice(-40));
  }, [mensagens]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens, parcial, pensando]);

  /* ------------------------------ conversa ------------------------------- */

  async function perguntar(texto: string) {
    const limpo = texto.trim();
    if (!limpo || pensando) return;

    const minha: Mensagem = { id: `c-${Date.now()}`, autor: "cliente", texto: limpo };
    const historico = [...mensagens, minha];
    setMensagens(historico);
    setRascunho("");
    setErro(null);
    setPensando(true);
    setParcial("");
    void haptic("light");

    try {
      const resposta = await nutriApi.conversar(
        historico
          .filter((m) => !m.analise)
          .map((m) => ({ autor: m.autor, texto: m.texto })),
        contexto,
        (pedaco) => setParcial((atual) => atual + pedaco),
      );
      setMensagens((atual) => [
        ...atual,
        {
          id: `n-${Date.now()}`,
          autor: "nutri",
          texto: resposta.texto,
          sugestoes: resposta.sugestoes,
        },
      ]);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setPensando(false);
      setParcial("");
    }
  }

  /* ------------------------------ foto ----------------------------------- */

  async function analisar(arquivo: File) {
    setErro(null);
    setPensando(true);
    setParcial("");
    void haptic("light");

    try {
      const previa = await prepararFoto(arquivo);
      setMensagens((atual) => [
        ...atual,
        {
          id: `f-${Date.now()}`,
          autor: "cliente",
          texto: "Olha essa refeição.",
          analise: { previa, dados: null },
        },
      ]);

      const resultado = await nutriApi.analisarFoto(previa, contexto, (pedaco) =>
        // o bloco <<<DADOS>>> é para o app, não para ela ler
        setParcial((atual) => (atual + pedaco).split("<<<DADOS>>>")[0] ?? ""),
      );

      setMensagens((atual) => [
        ...atual,
        {
          id: `n-${Date.now()}`,
          autor: "nutri",
          texto: resultado.texto,
          analise: { previa, dados: resultado.dados },
          sugestoes: resultado.dados?.perguntas,
        },
      ]);
      void haptic("success");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setPensando(false);
      setParcial("");
    }
  }

  /* --------- pergunta que chegou de outra tela (?p=) e ?camera=1 ---------- */

  const perguntaDaUrl = params.get("p");
  const abrirCamera = params.get("camera");
  const jaUsou = useRef(false);

  useEffect(() => {
    if (jaUsou.current || temAcesso !== true || !estilo) return;
    jaUsou.current = true;
    // fora do corpo do efeito: disparar a pergunta aqui dentro mudaria o
    // estado no meio da renderização (cascata de renders).
    const t = setTimeout(() => {
      if (perguntaDaUrl) void perguntar(perguntaDaUrl);
      else if (abrirCamera) fotoRef.current?.click();
    }, 0);
    return () => clearTimeout(t);
    // `perguntar` muda a cada mensagem nova; o guard `jaUsou` é quem controla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaDaUrl, abrirCamera, temAcesso, estilo]);

  /* ------------------------------ estados -------------------------------- */

  // Ela ainda não escolheu como quer ser tratada (ou pediu para trocar).
  if (!carregandoEstilo && (!estilo || trocandoEstilo)) {
    return (
      <EscolhaDeEstilo
        atual={estilo}
        primeiroNome={primeiroNome}
        aoEscolher={async (novo) => {
          await escolher(novo);
          setTrocandoEstilo(false);
        }}
      />
    );
  }

  if (!nutriApi.configurada() || temAcesso === false) {
    return <SemAcesso configurada={nutriApi.configurada()} />;
  }

  const abertura = mensagemDeAbertura(primeiroNome, dia, fase);
  const sugestoesAtuais =
    [...mensagens].reverse().find((m) => m.autor === "nutri")?.sugestoes ??
    abertura.sugestoes;

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      {/* Campo de cor — mesma linguagem da home: a marca ocupa o topo */}
      <header className="-mx-5 -mt-safe bg-sage-dark px-5 pt-safe">
        <div className="flex items-center gap-3 py-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-white">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-semibold tracking-tight text-white">
              Nutri IA
            </h1>
            <p className="truncate text-[13px] text-white/70">
              Dia {dia} · fase {fase}
            </p>
          </div>
          <button
            onClick={() => setTrocandoEstilo(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold text-white transition-transform active:scale-95"
          >
            <SlidersHorizontal className="size-3.5" />
            {ESTILOS_NUTRI.find((e) => e.id === estilo)?.titulo ?? "Estilo"}
          </button>
        </div>
      </header>

      {/* justify-end: com uma conversa curta as bolhas ficam junto do campo,
          como em qualquer app de mensagem — sem um vazio de meia tela no meio. */}
      <div className="flex flex-1 flex-col justify-end space-y-4 pt-5">
        {/* Ela fala primeiro — sem custo de IA e sem campo em branco */}
        <BalaoNutri>
          <p className="text-[15px] leading-relaxed text-ink">{abertura.texto}</p>
        </BalaoNutri>

        {mensagens.map((m) =>
          m.autor === "cliente" ? (
            <BalaoCliente key={m.id} mensagem={m} />
          ) : (
            <BalaoNutri key={m.id}>
              <RespostaDaNutri mensagem={m} />
            </BalaoNutri>
          ),
        )}

        {pensando && (
          <BalaoNutri>
            {parcial ? (
              <p className="text-[15px] leading-relaxed text-ink">
                <TextoComNegrito texto={parcial} />
              </p>
            ) : (
              <span className="flex items-center gap-2 text-[15px] text-ink-soft">
                <Loader2 className="size-4 animate-spin text-sage-deep" />
                Pensando no seu caso…
              </span>
            )}
          </BalaoNutri>
        )}

        {erro && (
          <div className="rounded-2xl border border-coral/30 bg-coral-tint/50 px-4 py-3">
            <p className="text-[15px] text-ink">{erro}</p>
            <button
              onClick={() => setErro(null)}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-coral-dark"
            >
              <RefreshCw className="size-4" /> Fechar e tentar de novo
            </button>
          </div>
        )}

        {/* scroll-mb: sem isso o rolar automático para a última mensagem
            para com ela escondida atrás do campo de digitar. */}
        <div ref={fimRef} className="scroll-mb-56" />
      </div>

      {/* Perguntas prontas + campo — fixos acima da TabBar */}
      <div className="sticky bottom-16 -mx-5 mt-4 border-t border-line/70 bg-cream/95 px-5 pb-3 pt-3 backdrop-blur-xl">
        {/* quebra em linhas em vez de rolar na horizontal: chip cortado na
            borda lê como tela quebrada, e são no máximo três. */}
        {!pensando && !!sugestoesAtuais?.length && (
          <div className="mb-2.5 flex flex-wrap gap-2">
            {sugestoesAtuais.slice(0, 2).map((s) => (
              <button
                key={s}
                onClick={() => void perguntar(s)}
                className="rounded-full border border-sage/40 bg-surface px-3.5 py-2 text-sm font-medium text-sage-dark transition-transform active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void perguntar(rascunho);
          }}
          className="flex items-end gap-2"
        >
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) void analisar(arquivo);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            aria-label="Analisar a foto do meu prato"
            disabled={pensando}
            onClick={() => fotoRef.current?.click()}
            className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-sage-dark transition-transform active:scale-95 disabled:opacity-50"
          >
            <Camera className="size-5" />
          </button>
          <input
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            placeholder="Pergunte qualquer coisa…"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
          <button
            type="submit"
            aria-label="Enviar"
            disabled={pensando || !rascunho.trim()}
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sage text-white shadow-[var(--shadow-sage)] transition-transform active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            <ArrowUp className="size-5" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ subcomponentes ----------------------------- */

function BalaoNutri({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      className="flex gap-2.5"
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-sage-tint text-sage-dark">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-surface p-4 shadow-[var(--shadow-soft)]">
        {children}
      </div>
    </motion.div>
  );
}

function BalaoCliente({ mensagem }: { mensagem: Mensagem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tr-md bg-sage-tint">
        {mensagem.analise?.previa && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mensagem.analise.previa}
            alt="Foto da refeição que você enviou"
            className="h-40 w-full object-cover"
          />
        )}
        <p className="px-4 py-3 text-[15px] leading-relaxed text-sage-dark">
          {mensagem.texto}
        </p>
      </div>
    </motion.div>
  );
}

/** Resposta da nutri: quando veio de uma foto, ganha o veredito colorido, a
 *  troca e a decomposição por item (esqueleto de simple-4.jpg). */
function RespostaDaNutri({ mensagem }: { mensagem: Mensagem }) {
  const [voto, setVoto] = useState<"sim" | "nao" | null>(null);
  const dados = mensagem.analise?.dados ?? null;
  const semaforo = dados ? SEMAFORO[dados.semaforo] : null;

  return (
    <div>
      {semaforo && (
        <div
          className={cn(
            "-mx-4 -mt-4 mb-3 flex items-center gap-2 rounded-t-2xl px-4 py-2.5",
            semaforo.fundo,
          )}
        >
          <semaforo.Icone className={cn("size-4", semaforo.texto)} />
          <span className={cn("text-sm font-semibold", semaforo.texto)}>
            {semaforo.rotulo}
          </span>
        </div>
      )}

      <p className="text-[15px] leading-relaxed text-ink">
        <TextoComNegrito texto={mensagem.texto} />
      </p>

      {dados?.troca && (
        <div className="mt-3 rounded-xl bg-cream-deep px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            A troca de hoje
          </p>
          <p className="mt-0.5 text-[15px] text-ink">{dados.troca}</p>
        </div>
      )}

      {!!dados?.itens?.length && (
        <ul className="mt-3 divide-y divide-line-soft">
          {dados.itens.map((item, i) => {
            const cor = SEMAFORO[item.nivel] ?? SEMAFORO.atencao;
            return (
              <li
                key={`${item.nome}-${i}`}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink">
                  {item.nome}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    cor.fundo,
                    cor.texto,
                  )}
                >
                  {item.grupo ?? cor.rotulo}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* acertou? — material para afinar o prompt da nutri depois */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-ink-faint">Isso te ajudou?</span>
        <button
          aria-label="Sim, ajudou"
          onClick={() => setVoto("sim")}
          className={cn(
            "grid size-8 place-items-center rounded-full border transition-colors",
            voto === "sim"
              ? "border-sage bg-sage-tint text-sage-dark"
              : "border-line text-ink-faint",
          )}
        >
          <ThumbsUp className="size-3.5" />
        </button>
        <button
          aria-label="Não ajudou"
          onClick={() => setVoto("nao")}
          className={cn(
            "grid size-8 place-items-center rounded-full border transition-colors",
            voto === "nao"
              ? "border-coral bg-coral-tint text-coral-dark"
              : "border-line text-ink-faint",
          )}
        >
          <ThumbsDown className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Escolha do estilo — "Pick your Coach personality" do Simple (simple-2.jpg),
 *  com o assunto nosso. Muda uma linha do prompt e muda a sensação de "é a
 *  MINHA nutri". */
function EscolhaDeEstilo({
  atual,
  primeiroNome,
  aoEscolher,
}: {
  atual: EstiloNutri | null;
  primeiroNome: string;
  aoEscolher: (estilo: EstiloNutri) => Promise<void>;
}) {
  const [salvando, setSalvando] = useState<EstiloNutri | null>(null);

  return (
    <div className="pt-6">
      <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink">
        Como você quer que eu fale com você, {primeiroNome}?
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        Não tem resposta certa — e você pode mudar quando quiser.
      </p>

      <div className="mt-6 space-y-3">
        {ESTILOS_NUTRI.map((e) => (
          <button
            key={e.id}
            disabled={!!salvando}
            onClick={async () => {
              setSalvando(e.id);
              void haptic("light");
              await aoEscolher(e.id);
            }}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left transition-transform active:scale-[0.99] disabled:opacity-60",
              atual === e.id ? "border-sage bg-sage-tint/40" : "border-line",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold tracking-tight text-ink">{e.titulo}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                {e.descricao}
              </p>
            </div>
            {salvando === e.id && (
              <Loader2 className="size-5 shrink-0 animate-spin text-sage-deep" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Sem API configurada ou sem acesso liberado: nada de campo de conversa que
 *  não conversa. Diz o que é e qual é o próximo passo. */
function SemAcesso({ configurada }: { configurada: boolean }) {
  return (
    <div className="pt-4">
      <EmptyState
        icon={MessageCircle}
        title="Sua nutri ainda não está ligada aqui"
        description={
          configurada
            ? "A Nutri IA responde com o seu histórico na mão — mas precisa do acesso que veio com a sua compra. Valide seu código e ela abre."
            : "A Nutri IA depende do serviço do Desinflama, que ainda não está configurado neste aparelho."
        }
        action={
          configurada ? (
            <Link href="/entrar">
              <Button size="md">Validar meu acesso</Button>
            </Link>
          ) : undefined
        }
      />
      <Card elevation="soft" className="mt-2">
        <p className="text-sm leading-relaxed text-ink-soft">
          Enquanto isso, o programa inteiro continua funcionando: as aulas do
          dia, o check-in, o cardápio e o Mapa de Tolerância não dependem da
          Nutri IA.
        </p>
      </Card>
    </div>
  );
}

/* --------------------------------- apoio ---------------------------------- */

/** A abertura sai daqui — local, sem custo de IA e sem espera. */
function mensagemDeAbertura(nome: string, dia: number, fase: string) {
  const porFase: Record<string, { texto: string; sugestoes: string[] }> = {
    Choque: {
      texto: `Oi, ${nome}. Estou com o seu Dia ${dia} na mão. Nos próximos 3 dias eu vou aprender o seu padrão pra afinar o seu protocolo — me conta como você acordou hoje, ou me mostra o que você vai comer.`,
      sugestoes: ["Por que eu inchei hoje?", "O que eu como no café da manhã?", "Posso tomar café?"],
    },
    Remoção: {
      texto: `Oi, ${nome}. Nesta fase a gente tira o que fermenta e o inchaço começa a ceder. Se bater dúvida na hora de comer, me pergunta antes — é pra isso que eu estou aqui.`,
      sugestoes: [
        "O que peço no restaurante hoje?",
        "Estou com vontade de doce, o que faço?",
        "Posso comer pão sem glúten?",
      ],
    },
    Reintrodução: {
      texto: `Oi, ${nome}. Agora cada teste vale ouro: é assim que você descobre o que é SEU gatilho e o que nunca foi. Me conta como você reagiu ao teste de hoje.`,
      sugestoes: ["Como sei se reagi ao teste?", "Reagi forte, e agora?", "Posso testar dois juntos?"],
    },
    Reparo: {
      texto: `Oi, ${nome}. A partir daqui a gente devolve comida à sua mesa, no seu ritmo. Me pergunta antes de cortar qualquer coisa por medo.`,
      sugestoes: ["Como volto com o que eu tolero?", "Quanto de feijão posso comer?", "O que levo pra viagem?"],
    },
    Reequilíbrio: {
      texto: `Oi, ${nome}. Você já sabe o que te incha. Meu trabalho agora é te ajudar a viver com isso sem virar prisão.`,
      sugestoes: ["Como não voltar a inchar?", "Posso beber no fim de semana?", "O que faço se inchar de novo?"],
    },
  };

  return (
    porFase[fase] ?? {
      texto: `Oi, ${nome}. Estou aqui com o seu histórico na mão — o que você comeu, como você tem acordado e o que já descobrimos que te incha. Pergunta o que quiser, ou me mostra a foto do seu prato.`,
      sugestoes: ["O que eu como hoje?", "Voltei a inchar, por quê?", "Posso testar um alimento novo?"],
    }
  );
}

function mensagemDeErro(e: unknown): string {
  if (e instanceof LimiteDiarioAtingido) {
    return "Você já usou suas análises de foto de hoje. Amanhã tem mais — e a conversa continua aberta.";
  }
  if (e instanceof ApiIndisponivel) {
    return "Não consegui falar com o serviço agora. Confira sua conexão e tente de novo.";
  }
  return e instanceof Error && e.message.length < 140
    ? e.message
    : "Deu um problema aqui. Tenta de novo em instantes?";
}

/** Renderiza **negrito** sem trazer uma biblioteca de markdown. */
function TextoComNegrito({ texto }: { texto: string }) {
  const partes = useMemo(() => texto.split(/(\*\*[^*]+\*\*)/g), [texto]);
  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith("**") && parte.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {parte.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{parte}</span>
        ),
      )}
    </>
  );
}
