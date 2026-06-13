"use client";

/**
 * Protocolo da {Nome} — artefato personalizado do Dia 0 (padrão Beyond Body):
 * um card bonito, baixável/compartilhável, gerado das respostas do quiz.
 * Sunk cost tangível: ela já POSSUI algo com o nome dela na primeira sessão.
 */
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Card } from "@/components/ui";
import { Art } from "@/components/Art";
import { useAppStore } from "@/store/useAppStore";
import { BLOAT_PROFILES } from "@/content/onboarding";
import { SEMAFORO } from "@/content/semaforo";
import { nextBloatWindow } from "@/lib/cycle";
import { projectionTimeline } from "@/lib/projection";
import { humanDayMonth, todayKey } from "@/lib/date";
import type { BloatType } from "@/types/domain";

/** Prioridade leve por tipo: o protocolo destaca o que mais pega no perfil. */
const PAUSAR_POR_TIPO: Record<BloatType, string[]> = {
  fermentacao: ["Pão/massa de trigo", "Cebola", "Alho", "Feijão/lentilha", "Adoçante poliól"],
  retencao: ["Adoçante poliól", "Pão/massa de trigo", "Leite/iogurte comum", "Cebola", "Mel"],
  lentidao: ["Pão/massa de trigo", "Leite/iogurte comum", "Adoçante poliól", "Maçã", "Feijão/lentilha"],
  estresse: ["Cebola", "Alho", "Adoçante poliól", "Pão/massa de trigo", "Leite/iogurte comum"],
};

const LIBERADOS = ["Arroz", "Batata", "Frango", "Ovo", "Banana (não madura)"];

export function ProtocoloCard({
  bloatType,
  cycleStart,
}: {
  bloatType: BloatType;
  cycleStart: string | null;
}) {
  const user = useAppStore((s) => s.user);
  const startedAt = useAppStore((s) => s.data.progress?.startedAt);
  const firstName = (user?.name ?? "você").split(" ")[0];
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const p = BLOAT_PROFILES[bloatType];
  const timeline = projectionTimeline(startedAt ?? new Date().toISOString());
  const win = cycleStart ? nextBloatWindow(cycleStart) : null;

  const inflamaFoods = SEMAFORO.find((t) => t.tier === "inflama")?.foods ?? [];
  const calmaFoods = SEMAFORO.find((t) => t.tier === "calma")?.foods ?? [];
  const pausar = PAUSAR_POR_TIPO[bloatType]
    .map((nome) => inflamaFoods.find((f) => f.nome === nome))
    .filter(Boolean)
    .slice(0, 5) as { nome: string; emoji: string }[];
  const liberados = LIBERADOS.map((nome) =>
    calmaFoods.find((f) => f.nome === nome)
  ).filter(Boolean) as { nome: string; emoji: string }[];

  async function baixar() {
    if (!cardRef.current) return;
    setSaving(true);
    setSaveError(false);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#faf7f2",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `protocolo-desinflama-${firstName.toLowerCase()}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (e) {
          if ((e as DOMException)?.name !== "AbortError") {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = file.name;
            a.click();
          }
        }
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = file.name;
        a.click();
      }
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card elevation="lift" className="overflow-hidden p-0">
      <div ref={cardRef} className="bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Desinflama · {humanDayMonth(todayKey())}
            </p>
            <h3 className="mt-1 font-display text-[1.45rem] font-semibold tracking-tight text-ink">
              Protocolo da {firstName}
            </h3>
          </div>
          <Art id="protocolo-selo" emoji="📜" className="size-12 shrink-0 rounded-2xl text-2xl" />
        </div>

        <p className="mt-2 text-sm text-ink-soft">
          <strong className="font-semibold text-ink">{p.name}</strong> — {p.tagline}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-coral-tint/40 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-coral-dark">
              5 pra pausar agora
            </p>
            <ul className="mt-2 space-y-1.5">
              {pausar.map((f) => (
                <li key={f.nome} className="text-[13px] leading-snug text-ink">
                  {f.emoji} {f.nome}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-sage-tint/50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sage-dark">
              5 liberados à vontade
            </p>
            <ul className="mt-2 space-y-1.5">
              {liberados.map((f) => (
                <li key={f.nome} className="text-[13px] leading-snug text-ink">
                  {f.emoji} {f.nome}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {win && (
          <p className="mt-3 rounded-2xl bg-plum-tint/50 px-3.5 py-2.5 text-[13px] leading-snug text-ink">
            🌙 Sua próxima janela de inchaço hormonal:{" "}
            <strong className="font-semibold">
              ~{humanDayMonth(win.start)} – {humanDayMonth(win.end)}
            </strong>{" "}
            <span className="text-ink-soft">— é fase, não recaída.</span>
          </p>
        )}

        <div className="mt-3 flex items-stretch gap-2">
          {timeline.map((x) => (
            <div key={x.when} className="flex-1 rounded-xl bg-cream-deep/60 px-2 py-2 text-center">
              <div className="font-display text-sm font-semibold text-sage-deep">
                {x.when}
              </div>
              <div className="text-[10px] font-semibold text-sage-deep/80">
                {x.dateLabel}
              </div>
              <div className="mt-0.5 text-[10px] leading-tight text-ink-soft">
                {x.label}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-ink-faint">
          Pausar é temporário — tudo volta na reintrodução, testado no SEU corpo.
        </p>
      </div>

      <button
        onClick={baixar}
        disabled={saving}
        className="flex w-full items-center justify-center gap-1.5 border-t border-line py-3 text-sm font-semibold text-sage-deep transition-colors active:bg-sage-tint/40 disabled:opacity-50"
      >
        <Download className="size-4" />
        {saving
          ? "Gerando…"
          : saveError
            ? "Não rolou — tentar de novo"
            : "Baixar meu protocolo"}
      </button>
    </Card>
  );
}
