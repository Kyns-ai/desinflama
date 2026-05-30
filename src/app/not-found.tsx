"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-cream px-8 text-center">
      <span className="text-5xl">🌿</span>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
        Não encontramos esta página
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Talvez ela tenha mudado de lugar. Vamos te levar de volta.
      </p>
      <Link href="/inicio" className={buttonStyles({ size: "lg", className: "mt-7" })}>
        Voltar ao início
      </Link>
    </div>
  );
}
