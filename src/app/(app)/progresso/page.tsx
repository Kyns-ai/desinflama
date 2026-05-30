"use client";

import Link from "next/link";
import { LineChart } from "lucide-react";
import { EmptyState, buttonStyles, Card } from "@/components/ui";

export default function Progresso() {
  return (
    <div className="space-y-5">
      <header className="pt-5">
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink">
          Seu progresso
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          A prova de que está funcionando — no seu corpo.
        </p>
      </header>

      <Card elevation="card" className="px-0">
        <EmptyState
          icon={LineChart}
          title="Seus gráficos aparecem aqui"
          description="Assim que você fizer alguns registros, mostramos seu Gut Score no tempo, a queda do inchaço e seus melhores e piores dias."
          action={
            <Link href="/registrar" className={buttonStyles({ size: "md" })}>
              Fazer meu 1º registro
            </Link>
          }
        />
      </Card>
    </div>
  );
}
