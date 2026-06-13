"use client";

/**
 * Card "Oi da nutri" — rosto humano por trás do programa. Mostra o vídeo de
 * boas-vindas quando ele existe (NUTRI.videoUrl); enquanto não existe, mostra
 * a saudação escrita como conteúdo principal (sem player morto). O founder só
 * preenche o videoUrl em content/nutri.ts e o player aparece sozinho.
 */
import { NUTRI } from "@/content/nutri";
import { Card } from "@/components/ui";

function iniciais(nome: string): string {
  const limpo = nome.trim();
  if (!limpo || limpo === "sua nutri") return "🩺";
  return limpo
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export function NutriWelcome() {
  const temVideo = NUTRI.videoUrl.trim().length > 0;
  const titulo =
    NUTRI.nome && NUTRI.nome !== "sua nutri"
      ? `Oi, eu sou a ${NUTRI.nome}`
      : "Oi da sua nutri";

  return (
    <Card elevation="soft" className="overflow-hidden p-0">
      {temVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={NUTRI.videoUrl}
          poster={NUTRI.poster || undefined}
          controls
          playsInline
          className="aspect-video w-full bg-cream-deep object-cover"
        />
      ) : null}

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          {NUTRI.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={NUTRI.foto}
              alt={NUTRI.nome}
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sage text-lg font-semibold text-white">
              {iniciais(NUTRI.nome)}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
              {titulo}
            </h3>
            {NUTRI.credencial && (
              <p className="text-xs text-ink-faint">{NUTRI.credencial}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {NUTRI.saudacao.map((par, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink-soft">
              {par}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}
