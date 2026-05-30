import { Users, Crown, DollarSign, TrendingUp } from "lucide-react";
import { getProvider } from "@/data/provider";
import { Card, KpiCard, PageHeader, Badge } from "@/components/ui";
import { BarChart, LineChart, Donut } from "@/components/charts";
import { fmtMoney, fmtNum, fmtPct } from "@/lib/cn";

export default async function Overview() {
  const o = await getProvider().getOverview();

  return (
    <div>
      <PageHeader
        title="Visão geral"
        subtitle="Como o Desinflama está indo — usuárias, receita e retenção."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Usuárias" value={fmtNum(o.users.value)} delta={o.users.delta} icon={Users} tone="sage" />
        <KpiCard label="Assinantes" value={fmtNum(o.premium.value)} delta={o.premium.delta} icon={Crown} tone="gold" />
        <KpiCard label="MRR" value={fmtMoney(o.mrr.value)} delta={o.mrr.delta} icon={DollarSign} tone="coral" />
        <KpiCard label="Conversão" value={fmtPct(o.conversion.value, 1)} delta={o.conversion.delta} icon={TrendingUp} tone="sky" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-ink">Novos cadastros</h2>
            <Badge tone="neutral">14 dias</Badge>
          </div>
          <BarChart data={o.signups} color="#3C9A71" />
        </Card>
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-ink">Receita mensal</h2>
            <Badge tone="neutral">6 meses</Badge>
          </div>
          <LineChart data={o.revenue} color="#E66B52" fmt={(v) => fmtMoney(v)} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold tracking-tight text-ink">Funil de conversão</h2>
          <ul className="space-y-2.5">
            {o.funnel.map((f, i) => {
              const pct = f.valor / o.funnel[0].valor;
              return (
                <li key={f.etapa}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{f.etapa}</span>
                    <span className="font-semibold text-ink">
                      {fmtNum(f.valor)} <span className="text-ink-faint">· {fmtPct(pct)}</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct * 100}%`,
                        background: i === o.funnel.length - 1 ? "#3C9A71" : "#9DC9B4",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold tracking-tight text-ink">Distribuição de planos</h2>
          <Donut data={o.planSplit} />
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
            <Stat label="Retenção D7" value={fmtPct(o.retentionD7)} />
            <Stat label="Retenção D30" value={fmtPct(o.retentionD30)} />
            <Stat label="Churn" value={fmtPct(o.churn, 1)} tone="coral" />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-4 font-semibold tracking-tight text-ink">
          Conclusão do desafio por dia
        </h2>
        <div className="flex items-end gap-2">
          {o.challengeCompletion.map((c) => (
            <div key={c.dia} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-sage/80"
                  style={{ height: `${c.pct * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-ink">{fmtPct(c.pct)}</span>
              <span className="text-[11px] text-ink-faint">Dia {c.dia}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "coral" }) {
  return (
    <div>
      <p className={`font-display text-xl font-semibold ${tone === "coral" ? "text-coral-dark" : "text-sage-deep"}`}>
        {value}
      </p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
