"use client";

/**
 * Tirar dúvida.
 *
 * Isto NÃO é a volta da aba "Nutri IA". A diferença importa e é dupla:
 *
 * 1. de produto — a IA é uma função dentro do app, não o produto. Ela não tem
 *    nome, não tem personalidade escolhível e não se apresenta como
 *    profissional. Entra-se aqui a partir de uma dúvida concreta (o cardápio,
 *    o prato), com o contexto já carregado, e sai-se com uma resposta;
 * 2. legal — no Brasil, IA no papel de nutricionista é risco de CFN. A
 *    autoridade do programa é a nutricionista real; aqui é orientação
 *    baseada no conteúdo do programa, e a tela diz isso.
 */
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, Loader2, Send } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { nutriApi, ApiIndisponivel } from "@/lib/nutriApi";
import { phaseForDay } from "@/lib/journey";
import { REINTRO_GROUPS } from "@/content/tolerance";
import { cn } from "@/lib/cn";

interface Fala {
  autor: "cliente" | "nutri";
  texto: string;
}

const SUGESTOES: Record<string, string[]> = {
  cardapio: [
    "Posso trocar o jantar de hoje por outra coisa?",
    "O que eu como se estiver na rua?",
    "Dá pra adiantar alguma receita no domingo?",
  ],
  prato: [
    "Por que esse prato tirou tantos pontos?",
    "O que eu troco pra subir a nota?",
    "Essa porção está grande demais?",
  ],
  geral: [
    "Por que eu incho mais à noite?",
    "Posso tomar café em jejum?",
    "Quanto tempo até eu sentir diferença?",
  ],
};

export default function DuvidaPage() {
  return (
    <Suspense fallback={null}>
      <Duvida />
    </Suspense>
  );
}

function Duvida() {
  const router = useRouter();
  const params = useSearchParams();
  const sobre = params.get("sobre") ?? "geral";
  const data = useAppStore((s) => s.data);

  const [falas, setFalas] = useState<Fala[]>([]);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [falas, ocupado]);

  const dia = data.progress?.currentDay ?? 1;
  const fase = phaseForDay(dia, data.progress?.challengeType ?? "main14").phase;

  async function perguntar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa || ocupado) return;

    setErro(null);
    setTexto("");
    const historico: Fala[] = [...falas, { autor: "cliente", texto: limpa }];
    setFalas([...historico, { autor: "nutri", texto: "" }]);
    setOcupado(true);

    try {
      await nutriApi.conversar(
        historico,
        {
          tipoInchaco: data.user?.onboarding?.bloatType,
          diaDoPrograma: dia,
          fase,
          toleraBem: data.tolerance
            .filter((t) => t.reaction === 0)
            .map((t) => REINTRO_GROUPS.find((g) => g.group === t.group)?.nome ?? t.group),
          naoTolera: data.tolerance
            .filter((t) => t.reaction >= 2)
            .map((t) => REINTRO_GROUPS.find((g) => g.group === t.group)?.nome ?? t.group),
        },
        (pedaco) => {
          // streaming: o último balão vai crescendo
          setFalas((atual) => {
            const copia = [...atual];
            copia[copia.length - 1] = {
              autor: "nutri",
              texto: (copia[copia.length - 1]?.texto ?? "") + pedaco,
            };
            return copia;
          });
        }
      );
    } catch (e) {
      // Sem serviço configurado a tela precisa ser HONESTA, não parecer quebrada.
      setFalas(historico);
      setErro(
        e instanceof ApiIndisponivel
          ? "As dúvidas ainda não estão ligadas neste aparelho. Enquanto isso, a Biblioteca responde a maioria delas."
          : "Não consegui responder agora. Tenta de novo em instantes?"
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col pb-2">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-h3 font-semibold text-ink">
          Tirar uma dúvida
        </h1>
      </header>

      {falas.length === 0 && (
        <div className="mt-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Pergunte o que quiser sobre o seu programa. A resposta usa o que a
            gente já sabe de você — o seu dia, a sua fase e o seu Mapa de
            Tolerância.
          </p>

          <ul className="mt-4 space-y-2">
            {(SUGESTOES[sobre] ?? SUGESTOES.geral).map((s) => (
              <li key={s}>
                <button
                  onClick={() => void perguntar(s)}
                  className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-left text-[15px] text-ink transition-colors active:bg-cream-deep"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 min-h-0 flex-1 space-y-3">
        {falas.map((f, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
              f.autor === "cliente"
                ? "ml-auto bg-rose text-white"
                : "bg-surface text-ink"
            )}
          >
            {f.texto || (
              <Loader2 className="size-4 animate-spin text-ink-faint" />
            )}
          </div>
        ))}
        <div ref={fim} />
      </div>

      {erro && (
        <p className="mt-3 rounded-2xl border border-gold/40 bg-gold-tint/50 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          {erro}
        </p>
      )}

      {/* O aviso fica SEMPRE visível, não escondido num rodapé: é o que separa
          "orientação do programa" de "consulta". */}
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Orientação baseada no conteúdo do programa. Não substitui consulta com
        a nutricionista ou com o seu médico.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void perguntar(texto);
        }}
        className="mt-3 flex gap-2 pb-2"
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva sua dúvida…"
          aria-label="Sua dúvida"
          className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim() || ocupado}
          aria-label="Enviar"
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose text-white transition-transform active:scale-95 disabled:opacity-40"
        >
          {ocupado ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </button>
      </form>
    </div>
  );
}
