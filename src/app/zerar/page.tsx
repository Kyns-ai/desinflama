"use client";

import Link from "next/link";

/**
 * /zerar — ferramenta de teste: apaga TODOS os dados locais (conta mock,
 * progresso, flags) e volta pro início, como uma compradora nova.
 * Alcançável só por URL direta; pede confirmação.
 */
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

export default function Zerar() {
  const [busy, setBusy] = useState(false);

  async function zerar() {
    setBusy(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs.map(
            (d) =>
              new Promise<void>((resolve) => {
                if (!d.name) return resolve();
                const req = indexedDB.deleteDatabase(d.name);
                req.onsuccess = req.onerror = req.onblocked = () => resolve();
              })
          )
        );
      } else {
        // Safari antigo não lista DBs — apaga o conhecido
        await new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase("keyval-store");
          req.onsuccess = req.onerror = req.onblocked = () => resolve();
        });
      }
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-cream px-8 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-coral-tint">
        <RotateCcw className="size-8 text-coral-dark" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
        Zerar tudo e recomeçar?
      </h1>
      <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-soft">
        Apaga a conta de teste e todo o progresso salvo NESTE aparelho. Você
        volta pra tela inicial como uma usuária nova.
      </p>
      <Button
        fullWidth
        size="lg"
        className="mt-8 max-w-xs"
        loading={busy}
        onClick={zerar}
      >
        Zerar e recomeçar do início
      </Button>
      <Link href="/" className="mt-4 text-sm font-medium text-ink-faint">
        Cancelar — voltar sem apagar
      </Link>
    </div>
  );
}
