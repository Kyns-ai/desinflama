"use client";

import { useState } from "react";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Ilustração da marca (`public/img/{id}.png`).
 *
 * O fallback NÃO é emoji. Antes era: quando a arte faltava, a tela mostrava um
 * emoji no lugar — e emoji em UI é regra travada do padrão de design
 * (~/.claude/DESIGN.md). Pior: o fallback aparecia justamente onde a arte ainda
 * não tinha sido gerada, ou seja, onde a tela já estava mais frágil.
 *
 * Agora o fallback é um azulejo com ícone real — vazio desenhado, não buraco.
 * A prop `emoji` continua aceita porque ~100 chamadas a passam vindas de
 * `src/content/*`; ela é ignorada na renderização, de propósito.
 */
export function Art({
  id,
  className,
  alt = "",
}: {
  id: string;
  /** @deprecated Ignorado — o fallback é ícone, nunca emoji. */
  emoji?: string;
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !id) {
    return (
      <span
        className={cn(
          "grid place-items-center bg-cream-deep text-ink-faint",
          className
        )}
        aria-hidden
      >
        <Sprout className="size-[45%]" strokeWidth={1.75} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/img/${id}.png`}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
