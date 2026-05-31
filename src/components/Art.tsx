"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Ilustração da marca (gerada via MUAPI em public/img/{id}.png). Se a imagem
 * não existir/carregar, cai no emoji — então é seguro usar antes de gerar tudo.
 */
export function Art({
  id,
  emoji,
  className,
  alt = "",
}: {
  id: string;
  emoji: string;
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={cn("grid place-items-center leading-none", className)} aria-hidden>
        {emoji}
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
