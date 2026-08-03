"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { alimentosParaEscolher } from "@/lib/cardapioPessoal";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

type Escolha = "gosta" | "evita" | null;

/**
 * "Gosto / não é pra mim".
 *
 * Copiado do onboarding do Homemade Method, que é o padrão dos funis grandes
 * de saúde: a pessoa toca em alimentos ANTES de ver o plano, e aí o plano
 * chega parecendo dela. Plano montado com comida que ela já come é plano que
 * ela segue; plano genérico é o que ela abandona na terça.
 *
 * Só aparecem alimentos que existem de fato nas receitas — perguntar sobre
 * comida que o app nunca vai sugerir é fazer a pessoa trabalhar de graça.
 */
export function Preferencias({ aoFechar }: { aoFechar: () => void }) {
  const definirPreferencias = useAppStore((s) => s.definirPreferencias);
  const atuais = useAppStore((s) => s.data.preferencias);

  const alimentos = useMemo(() => alimentosParaEscolher(), []);
  const [escolhas, setEscolhas] = useState<Record<string, Escolha>>(() => {
    const inicial: Record<string, Escolha> = {};
    for (const a of atuais.gosta) inicial[a] = "gosta";
    for (const a of atuais.evita) inicial[a] = "evita";
    return inicial;
  });
  const [salvando, setSalvando] = useState(false);

  const marcados = Object.values(escolhas).filter(Boolean).length;

  function marcar(alimento: string, valor: Escolha) {
    void haptic("light");
    setEscolhas((c) => ({ ...c, [alimento]: c[alimento] === valor ? null : valor }));
  }

  async function salvar() {
    setSalvando(true);
    await definirPreferencias(
      Object.entries(escolhas).filter(([, v]) => v === "gosta").map(([k]) => k),
      Object.entries(escolhas).filter(([, v]) => v === "evita").map(([k]) => k)
    );
    void haptic("success");
    setSalvando(false);
    aoFechar();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-cream pt-safe"
    >
      <header className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h1 className="font-display text-h2 font-semibold text-ink">
            O que você já come?
          </h1>
          <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">
            Marque o que você gosta e o que não é pra você. O cardápio se monta
            em cima disso — nada de comida que você não ia comer mesmo.
          </p>
        </div>
        <button
          onClick={aoFechar}
          aria-label="Fechar"
          className="mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <X className="size-5" />
        </button>
      </header>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-5 pb-4">
        {alimentos.map((a) => {
          const valor = escolhas[a] ?? null;
          return (
            <li
              key={a}
              className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-2.5"
            >
              <span className="min-w-0 flex-1 text-[15px] text-ink">{a}</span>

              <button
                onClick={() => marcar(a, "gosta")}
                aria-pressed={valor === "gosta"}
                aria-label={`Gosto de ${a}`}
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                  valor === "gosta"
                    ? "bg-rose text-white"
                    : "bg-cream-deep text-ink-faint"
                )}
              >
                <Check className="size-4" strokeWidth={2.8} />
              </button>

              <button
                onClick={() => marcar(a, "evita")}
                aria-pressed={valor === "evita"}
                aria-label={`Não como ${a}`}
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                  valor === "evita"
                    ? "bg-ink text-white"
                    : "bg-cream-deep text-ink-faint"
                )}
              >
                <X className="size-4" strokeWidth={2.8} />
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-line bg-surface px-5 pb-safe pt-3">
        <Button fullWidth size="lg" loading={salvando} onClick={salvar}>
          Montar meu cardápio
        </Button>
        <p className="mt-2 text-center text-xs text-ink-faint">
          {marcados === 0
            ? "Pode pular — dá pra ajustar depois, a qualquer momento."
            : `${marcados} ${marcados === 1 ? "alimento marcado" : "alimentos marcados"}`}
        </p>
        {salvando && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-cream/40">
            <Loader2 className="size-6 animate-spin text-rose" />
          </div>
        )}
      </footer>
    </motion.div>
  );
}
