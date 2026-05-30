import { DollarSign, Crown, RefreshCw, TrendingDown } from "lucide-react";
import { getProvider } from "@/data/provider";
import { Card, KpiCard, PageHeader, Badge } from "@/components/ui";
import { LineChart, Donut } from "@/components/charts";
import { fmtMoney, fmtNum, fmtPct } from "@/lib/cn";
import { usingMock } from "@/lib/env";

export default async function Assinaturas() {
  const o = await getProvider().getOverview();
  const arr = o.mrr.value * 12;

  return (
    <div>
      <PageHeader
        title="Assinaturas & receita"
        subtitle="Unificado pelo RevenueCat (Web Billing + Apple IAP + Google Play)."
        right={
          usingMock ? (
            <Badge tone="gold">RevenueCat não conectado</Badge>
          ) : (
            <Badge tone="sage">RevenueCat conectado</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="MRR" value={fmtMoney(o.mrr.value)} delta={o.mrr.delta} icon={DollarSign} tone="coral" />
        <KpiCard label="ARR (projeção)" value={fmtMoney(arr)} icon={TrendingDown} tone="sage" />
        <KpiCard label="Assinantes" value={fmtNum(o.premium.value)} delta={o.premium.delta} icon={Crown} tone="gold" />
        <KpiCard label="Churn" value={fmtPct(o.churn, 1)} icon={RefreshCw} tone="sky" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold tracking-tight text-ink">Receita mensal</h2>
          <LineChart data={o.revenue} color="#E66B52" fmt={(v) => fmtMoney(v)} />
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold tracking-tight text-ink">Planos ativos</h2>
          <Donut data={o.planSplit} />
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-1 font-semibold tracking-tight text-ink">Reconciliação de canais</h2>
        <p className="text-sm text-ink-soft">
          O RevenueCat é a fonte única do entitlement. Uma compra no funil web ou
          no app cai aqui automaticamente (App User ID = id do Supabase).
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Channel label="Web (Stripe)" value="48%" />
          <Channel label="Apple IAP" value="37%" />
          <Channel label="Google Play" value="15%" />
        </div>
      </Card>
    </div>
  );
}

function Channel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas p-4">
      <p className="font-display text-xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
