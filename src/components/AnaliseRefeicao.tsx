"use client";

/**
 * A análise da refeição — o momento em que o app prova que vale o dinheiro.
 *
 * Estrutura copiada da tela de feedback do app Simple (docs/referencia/simple-4.jpg):
 * indicador que muda de cor conforme o resultado, veredito escrito com a parte
 * importante em negrito, botões de "acertou/não acertou", perguntas prontas para
 * o próximo passo e a decomposição do prato item a item. A diferença é o assunto:
 * lá é caloria e macro, aqui é o que incha o intestino DELA.
 */

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  Leaf,
  Loader2,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { prepararFoto } from "@/lib/imagem";
import {
  LimiteDiarioAtingido,
  nutriApi,
  type ContextoNutri,
  type DadosDaAnalise,
} from "@/lib/nutriApi";

type Estado = "vazio" | "analisando" | "pronto" | "erro";

const SEMAFORO = {
  calma: {
    rotulo: "Cai bem pra você",
    Icone: Leaf,
    anel: "text-sage-deep",
    fundo: "bg-sage-tint",
    borda: "border-sage/40",
  },
  atencao: {
    rotulo: "Depende da porção",
    Icone: TriangleAlert,
    anel: "text-gold",
    fundo: "bg-gold-tint",
    borda: "border-gold/40",
  },
  inflama: {
    rotulo: "Esse costuma te inchar",
    Icone: Flame,
    anel: "text-coral-deep",
    fundo: "bg-coral-tint",
    borda: "border-coral/40",
  },
} as const;

export interface AnaliseRefeicaoProps {
  contexto: ContextoNutri;
  /** Chamado quando a primeira análise termina com sucesso. */
  aoConcluir?: (dados: DadosDaAnalise | null) => void;
  /** Texto do botão quando ainda não há foto. */
  chamada?: string;
  className?: string;
}

export function AnaliseRefeicao({
  contexto,
  aoConcluir,
  chamada = "Fotografar minha refeição",
  className,
}: AnaliseRefeicaoProps) {
  const [estado, setEstado] = useState<Estado>("vazio");
  const [previa, setPrevia] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState<DadosDaAnalise | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [voto, setVoto] = useState<"sim" | "nao" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const analisar = useCallback(
    async (arquivo: File) => {
      setEstado("analisando");
      setTexto("");
      setDados(null);
      setErro(null);
      setVoto(null);

      try {
        const dataUrl = await prepararFoto(arquivo);
        setPrevia(dataUrl);

        const resultado = await nutriApi.analisarFoto(dataUrl, contexto, (pedaco) => {
          // O bloco de dados é para o app, não para ela ler.
          setTexto((atual) => (atual + pedaco).split("<<<DADOS>>>")[0] ?? "");
        });

        setTexto(resultado.texto);
        setDados(resultado.dados);
        setEstado("pronto");
        aoConcluir?.(resultado.dados);
      } catch (e) {
        if (e instanceof LimiteDiarioAtingido) {
          setErro(
            "Você já usou suas análises de hoje. Amanhã tem mais — e o chat continua aberto.",
          );
        } else {
          setErro(
            e instanceof Error && e.message.length < 120
              ? e.message
              : "Não consegui analisar agora. Tenta de novo?",
          );
        }
        setEstado("erro");
      }
    },
    [contexto, aoConcluir],
  );

  const semaforo = dados ? SEMAFORO[dados.semaforo] : null;

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
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

      {/* -------------------------------- vazio ------------------------------- */}
      {estado === "vazio" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-3xl border border-dashed border-sage/50 bg-sage-tint/40 px-6 py-10 text-center transition active:scale-[0.99]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-card">
            <Camera className="h-6 w-6 text-sage-deep" />
          </span>
          <span className="font-display text-lg text-ink">{chamada}</span>
          <span className="max-w-[16rem] text-sm text-ink-soft">
            Pode ser o prato, a geladeira ou o cardápio do restaurante.
          </span>
        </button>
      )}

      {/* ------------------------------ analisando ---------------------------- */}
      {estado === "analisando" && (
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
          {previa && (
            <div className="relative h-40 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previa} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink/20" />
            </div>
          )}
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin text-sage-deep" />
              {texto ? "Analisando…" : "Olhando o seu prato…"}
            </div>
            {texto && (
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                <TextoComNegrito texto={texto} />
              </p>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------- pronto ------------------------------ */}
      {estado === "pronto" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "overflow-hidden rounded-3xl border bg-surface shadow-card",
            semaforo?.borda ?? "border-line",
          )}
        >
          {previa && (
            <div className="h-40 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previa} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          {semaforo && (
            <div className={cn("flex items-center gap-3 px-5 py-3", semaforo.fundo)}>
              <semaforo.Icone className={cn("h-5 w-5", semaforo.anel)} />
              <span className="font-display text-[17px] text-ink">{semaforo.rotulo}</span>
            </div>
          )}

          <div className="px-5 py-5">
            <p className="text-[15px] leading-relaxed text-ink">
              <TextoComNegrito texto={texto} />
            </p>

            {dados?.troca && (
              <div className="mt-4 rounded-2xl bg-cream-deep px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Troca de hoje
                </p>
                <p className="mt-1 text-[15px] text-ink">{dados.troca}</p>
              </div>
            )}

            {!!dados?.itens?.length && (
              <ul className="mt-4 space-y-2">
                {dados.itens.map((item, i) => {
                  const cor = SEMAFORO[item.nivel] ?? SEMAFORO.atencao;
                  return (
                    <li
                      key={`${item.nome}-${i}`}
                      className="flex items-center justify-between gap-3 border-b border-line-soft pb-2 last:border-0"
                    >
                      <span className="text-[15px] text-ink">{item.nome}</span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          cor.fundo,
                          cor.anel,
                        )}
                      >
                        {item.grupo ?? cor.rotulo}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* acertou? — vira material para a nutri afinar o prompt */}
            <div className="mt-5 flex items-center gap-2">
              <span className="text-xs text-ink-faint">Isso te ajudou?</span>
              <button
                type="button"
                aria-label="Sim, ajudou"
                onClick={() => setVoto("sim")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition",
                  voto === "sim"
                    ? "border-sage bg-sage-tint text-sage-deep"
                    : "border-line text-ink-faint",
                )}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Não ajudou"
                onClick={() => setVoto("nao")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition",
                  voto === "nao"
                    ? "border-coral bg-coral-tint text-coral-deep"
                    : "border-line text-ink-faint",
                )}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-5 flex items-center gap-2 text-sm font-medium text-sage-dark"
            >
              <RefreshCw className="h-4 w-4" />
              Analisar outra refeição
            </button>
          </div>
        </motion.div>
      )}

      {/* --------------------------------- erro ------------------------------- */}
      {estado === "erro" && (
        <div className="rounded-3xl border border-line bg-surface px-5 py-6 text-center shadow-card">
          <p className="text-[15px] text-ink">{erro}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setEstado("vazio");
              setErro(null);
            }}
          >
            Tentar de novo
          </Button>
        </div>
      )}

      {/* perguntas prontas — a cliente nunca encara um campo em branco */}
      {estado === "pronto" && !!dados?.perguntas?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {dados.perguntas.slice(0, 3).map((p) => (
            <a
              key={p}
              href={`/nutri?p=${encodeURIComponent(p)}`}
              className="rounded-full border border-sage/40 bg-surface px-3.5 py-2 text-sm text-sage-dark"
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Renderiza **negrito** sem trazer uma biblioteca de markdown. */
function TextoComNegrito({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
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

/** Marca visual de "análise concluída" para o placar do Dia 0. */
export function SeloAnalise() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage-tint px-2.5 py-1 text-xs font-medium text-sage-deep">
      <Check className="h-3 w-3" />
      analisada
    </span>
  );
}
