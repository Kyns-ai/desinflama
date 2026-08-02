import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Numero, Secao, Tabela } from "@/components/painel";
import { RECIPES } from "@/content/recipes";

export default function ReceitasAdmin() {
  const porFase = RECIPES.reduce<Record<string, number>>((acc, r) => {
    acc[r.phase] = (acc[r.phase] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Receitas"
        subtitle="A biblioteca low FODMAP, localizada para o Brasil."
      />

      <div className="mb-9 grid gap-3 sm:grid-cols-4">
        <Numero valor={RECIPES.length} rotulo="Receitas" />
        {Object.entries(porFase)
          .slice(0, 3)
          .map(([fase, n]) => (
            <Numero key={fase} valor={n} rotulo={`Fase ${fase}`} tom="neutro" />
          ))}
      </div>

      <Secao titulo="Todas as receitas">
        <Tabela colunas={["Receita", "Fase", "Tipo", "Tempo", "Ingredientes", "Modo"]}>
          {RECIPES.map((r) => (
            <Linha key={r.id}>
              <Celula>
                <span className="font-semibold text-ink">{r.nome}</span>
              </Celula>
              <Celula>
                <Chip>{r.phase}</Chip>
              </Celula>
              <Celula className="text-ink-soft">{r.tipo}</Celula>
              <Celula className="whitespace-nowrap text-ink-soft">{r.tempo}</Celula>
              <Celula className="max-w-[260px] text-ink-soft">
                <ul className="space-y-0.5">
                  {r.ingredientes.map((i) => (
                    <li key={i}>· {i}</li>
                  ))}
                </ul>
              </Celula>
              <Celula className="max-w-[280px] text-ink-soft">
                <ol className="space-y-0.5">
                  {r.modo.map((m, i) => (
                    <li key={m}>
                      {i + 1}. {m}
                    </li>
                  ))}
                </ol>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
