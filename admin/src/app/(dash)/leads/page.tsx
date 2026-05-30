import { getProvider } from "@/data/provider";
import { Card, PageHeader, Badge, type Tone } from "@/components/ui";
import { fmtDate } from "@/lib/cn";
import type { LeadStatus } from "@/lib/types";

const STATUS: Record<LeadStatus, { label: string; tone: Tone }> = {
  novo: { label: "Novo", tone: "coral" },
  contatado: { label: "Contatado", tone: "sky" },
  fechado: { label: "Fechado", tone: "sage" },
  perdido: { label: "Perdido", tone: "neutral" },
};

export default async function Leads() {
  const leads = await getProvider().listLeads();
  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Leads de acompanhamento"
        subtitle="Quem pediu avaliação individual — priorize por contexto."
      />

      <div className="mb-4 grid grid-cols-4 gap-3">
        {(Object.keys(STATUS) as LeadStatus[]).map((s) => (
          <Card key={s} className="text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              {counts[s] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">{STATUS[s].label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-line">
          {leads.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-tint text-sm font-semibold text-[#9a7322]">
                {l.userName[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{l.userName}</p>
                <p className="text-xs text-ink-faint">{l.userEmail}</p>
              </div>
              <p className="min-w-0 flex-1 text-sm text-ink-soft">{l.context}</p>
              <span className="text-xs text-ink-faint">{fmtDate(l.createdAt)}</span>
              <Badge tone={STATUS[l.status].tone}>{STATUS[l.status].label}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
