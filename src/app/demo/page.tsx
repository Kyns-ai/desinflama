"use client";

/**
 * `/demo` — entrada direta na conta de demonstração.
 *
 * Existe para o Ruyter testar sem atrito: abre a URL e já está dentro, com
 * dados semeados. É favoritável.
 *
 * Por que uma rota própria em vez de deixar o botão grande na landing: a
 * landing é página de VENDA. Um "Ver demonstração" em destaque ali disputa o
 * clique com o "Começar agora" — e o que aparece na página de venda é decisão
 * do Ruyter, não minha. Aqui o atalho existe sem custar conversão.
 *
 * `/demo?zerar=1` apaga tudo antes de entrar, para testar do zero (inclusive
 * o onboarding).
 */
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { repository } from "@/services";

export default function DemoPage() {
  return (
    <Suspense fallback={null}>
      <Demo />
    </Suspense>
  );
}

function Demo() {
  const router = useRouter();
  const params = useSearchParams();
  const enterDemo = useAppStore((s) => s.enterDemo);
  const [erro, setErro] = useState<string | null>(null);
  // StrictMode monta o efeito duas vezes em desenvolvimento; sem a trava, a
  // segunda entrada corre com a primeira e uma sobrescreve os dados da outra.
  const jaRodou = useRef(false);

  useEffect(() => {
    if (jaRodou.current) return;
    jaRodou.current = true;

    (async () => {
      try {
        if (params.get("zerar") === "1") {
          await repository.clear();
        }
        await enterDemo();
        router.replace(params.get("zerar") === "1" ? "/onboarding" : "/inicio");
      } catch {
        setErro(
          "Não consegui abrir a demonstração. Recarregue a página para tentar de novo."
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-dvh place-items-center px-8 text-center">
      {erro ? (
        <div>
          <p className="text-[15px] leading-relaxed text-ink-soft">{erro}</p>
          <button
            onClick={() => location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose px-4 py-2.5 text-sm font-semibold text-white"
          >
            <RotateCcw className="size-4" /> Tentar de novo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-rose" />
          <p className="text-[15px] text-ink-soft">Abrindo a demonstração…</p>
        </div>
      )}
    </div>
  );
}
