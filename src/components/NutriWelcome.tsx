"use client";

/**
 * Card "Oi da nutri" — o rosto humano por trás do programa.
 *
 * Mostra o vídeo de boas-vindas quando ele existe (NUTRI.videoUrl); enquanto
 * não existe, mostra a saudação escrita (sem player morto). O founder só
 * preenche o videoUrl em content/nutri.ts e o player aparece sozinho.
 *
 * Duas correções feitas vendo a tela:
 *  - o avatar ficava um DISCO ROSA VAZIO enquanto a nutri não tem nome
 *    (`iniciais()` devolve string vazia para o placeholder "sua nutri").
 *    Círculo vazio lê como falha de carregamento;
 *  - a saudação inteira empurrava a biblioteca inteira para baixo, e ela é um
 *    texto que se lê UMA vez. Agora abre no primeiro parágrafo.
 */
import { useState } from "react";
import { ChevronDown, Stethoscope } from "lucide-react";
import { NUTRI } from "@/content/nutri";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

function iniciais(nome: string): string {
  const limpo = nome.trim();
  if (!limpo || limpo === "sua nutri") return "";
  return limpo
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export function NutriWelcome() {
  const temVideo = NUTRI.videoUrl.trim().length > 0;
  const iniciaisNutri = iniciais(NUTRI.nome);
  const titulo = iniciaisNutri
    ? `Oi, eu sou a ${NUTRI.nome}`
    : "Oi da sua nutri";

  const [aberto, setAberto] = useState(false);
  const paragrafos = NUTRI.saudacao;
  const visiveis = aberto ? paragrafos : paragrafos.slice(0, 1);
  const temMais = paragrafos.length > 1;

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
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-rose-tint text-rose-dark">
              {iniciaisNutri ? (
                <span className="text-lg font-semibold">{iniciaisNutri}</span>
              ) : (
                <Stethoscope className="size-6" />
              )}
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
          {visiveis.map((par) => (
            <p key={par} className="text-[15px] leading-relaxed text-ink-soft">
              {par}
            </p>
          ))}
        </div>

        {temMais && (
          <button
            onClick={() => setAberto((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-dark"
          >
            {aberto ? "Mostrar menos" : "Continuar lendo"}
            <ChevronDown
              className={cn("size-4 transition-transform", aberto && "rotate-180")}
            />
          </button>
        )}
      </div>
    </Card>
  );
}
