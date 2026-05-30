"use client";

import { Button } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-cream px-8 text-center">
      <span className="text-5xl">🌿</span>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
        Algo saiu do lugar
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Tivemos um probleminha. Tente de novo — seus dados estão salvos.
      </p>
      <Button size="lg" className="mt-7" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
