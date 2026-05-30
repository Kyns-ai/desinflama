import { Pencil } from "lucide-react";
import { getProvider } from "@/data/provider";
import { Card, PageHeader, Badge, type Tone } from "@/components/ui";
import { fmtDate } from "@/lib/cn";

const STATUS_TONE: Record<string, Tone> = {
  publicado: "sage",
  rascunho: "neutral",
  "em revisão": "gold",
};

export default async function Conteudo() {
  const groups = await getProvider().listContent();

  return (
    <div>
      <PageHeader
        title="Conteúdo"
        subtitle="A nutricionista revisa e edita o programa — sem mexer em código."
        right={
          <button className="rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-deep">
            + Novo conteúdo
          </button>
        }
      />

      <div className="mb-4 rounded-xl border border-gold/30 bg-gold-tint/50 px-4 py-3 text-sm text-[#7c5d18]">
        Para edição ao vivo, o conteúdo (hoje em arquivos do app) migra para o
        Supabase. Este catálogo já está pronto para virar um CMS com publicar/revisar.
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.grupo}>
            <h2 className="mb-2 text-sm font-semibold text-ink">{g.grupo}</h2>
            <Card className="p-0">
              <ul className="divide-y divide-line">
                {g.itens.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.titulo}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {item.tipo}
                        {item.fase ? ` · ${item.fase}` : ""} · atualizado{" "}
                        {fmtDate(item.atualizadoEm)}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[item.status] ?? "neutral"}>
                      {item.status}
                    </Badge>
                    <button className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas">
                      <Pencil className="size-3.5" /> Editar
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}
