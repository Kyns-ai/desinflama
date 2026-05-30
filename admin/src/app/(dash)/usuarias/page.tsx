import Link from "next/link";
import { Search, ChevronRight, Flame } from "lucide-react";
import { getProvider } from "@/data/provider";
import { Card, PageHeader, Badge, type Tone } from "@/components/ui";
import type { PlanId } from "@/lib/types";

const PLAN_LABEL: Record<PlanId, { label: string; tone: Tone }> = {
  annual: { label: "Anual", tone: "sage" },
  monthly: { label: "Mensal", tone: "sky" },
  trial: { label: "Trial", tone: "gold" },
  free: { label: "Grátis", tone: "neutral" },
};

export default async function Usuarias({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getProvider().listUsers(q);

  return (
    <div>
      <PageHeader
        title="Usuárias"
        subtitle={`${users.length} ${q ? "resultado(s)" : "usuárias"}`}
        right={
          <form className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome ou e-mail…"
              className="h-10 w-64 rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </form>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-faint md:grid">
          <span>Usuária</span>
          <span>Plano</span>
          <span>Progresso</span>
          <span>Índice</span>
          <span>Ativa</span>
          <span />
        </div>
        <ul className="divide-y divide-line">
          {users.map((u) => {
            const plan = PLAN_LABEL[u.plan];
            return (
              <li key={u.id}>
                <Link
                  href={`/usuarias/${u.id}`}
                  className="grid grid-cols-2 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-canvas md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sage text-sm font-semibold text-white">
                      {u.name[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{u.name}</p>
                      <p className="truncate text-xs text-ink-faint">{u.email}</p>
                    </div>
                  </div>
                  <div className="justify-self-end md:justify-self-start">
                    <Badge tone={plan.tone}>{plan.label}</Badge>
                  </div>
                  <span className="hidden text-sm text-ink-soft md:block">
                    Dia {u.currentDay}
                  </span>
                  <span className="hidden text-sm font-semibold text-ink md:block">
                    {u.score}
                  </span>
                  <span className="hidden items-center gap-1 text-sm text-ink-soft md:flex">
                    <Flame className="size-3.5 text-coral" /> {u.streak}
                  </span>
                  <ChevronRight className="hidden size-4 text-ink-faint md:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
