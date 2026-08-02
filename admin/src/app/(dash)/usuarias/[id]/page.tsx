import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Crown, Flame, Calendar, Camera, NotebookPen, Map,
} from "lucide-react";
import { getProvider } from "@/data/provider";
import { Card, Badge } from "@/components/ui";
import { LineChart } from "@/components/charts";
import { fmtDate } from "@/lib/cn";

export default async function UserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const u = await getProvider().getUser(id);
  if (!u) notFound();

  return (
    <div>
      <Link
        href="/usuarias"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Usuárias
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Perfil */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-rose text-xl font-semibold text-white">
              {u.name[0]}
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-ink">{u.name}</p>
              <p className="truncate text-sm text-ink-soft">{u.email}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={u.isPremium ? "gold" : "neutral"}>
              <Crown className="size-3" /> {u.isPremium ? "Premium" : "Grátis"}
            </Badge>
            <Badge tone="rose">{u.bloatType}</Badge>
          </div>

          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
            <Row icon={Map} label="Objetivo" value={u.goal} />
            <Row icon={Calendar} label="Dia atual" value={`Dia ${u.currentDay} · ${u.challengeType}`} />
            <Row icon={Flame} label="Ofensiva" value={`${u.streak} dias`} />
            <Row icon={NotebookPen} label="Registros" value={String(u.logsCount)} />
            <Row icon={Camera} label="Fotos" value={String(u.photosCount)} />
          </dl>

          <p className="mt-4 text-xs text-ink-faint">
            Entrou em {fmtDate(u.joinedAt)} · ativa {fmtDate(u.lastActive)}
          </p>
        </Card>

        {/* Dados */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold tracking-tight text-ink">Índice Intestinal</h2>
              <span className="font-display text-2xl font-semibold text-rose-deep">
                {u.score}
              </span>
            </div>
            <LineChart data={u.scoreSeries} color="#3C9A71" height={150} />
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold tracking-tight text-ink">Registros recentes</h2>
            <ul className="divide-y divide-line">
              {u.recentLogs.map((l, i) => (
                <li key={i} className="flex items-center gap-4 py-2.5 text-sm">
                  <span className="w-20 shrink-0 text-ink-faint">{fmtDate(l.date)}</span>
                  <span className="flex gap-3">
                    <span>🎈 {l.inchaco}</span>
                    <span>⚡ {l.energia}</span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-soft">
                    {l.meals.join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Ações de suporte */}
          <Card>
            <h2 className="mb-3 font-semibold tracking-tight text-ink">Suporte</h2>
            <div className="flex flex-wrap gap-2">
              <SupportButton label="Conceder premium" />
              <SupportButton label="Reenviar acesso" />
              <SupportButton label="Resetar progresso" />
              <SupportButton label="Exportar dados" />
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              Ações conectam ao Supabase quando o backend estiver ativo.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Map;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-ink-faint" />
      <span className="text-ink-soft">{label}</span>
      <span className="ml-auto text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function SupportButton({ label }: { label: string }) {
  return (
    <button className="rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas">
      {label}
    </button>
  );
}
