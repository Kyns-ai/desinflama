import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { WEEKS, menuForWeek, recipesForWeek, phasesOfWeek } from "@/lib/weeklyMenu";
import { buildShoppingList, CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/shoppingList";

export default function CardapioAdmin() {
  return (
    <>
      <PageHeader
        title="Cardápio e compras"
        subtitle="O menu de segunda a domingo e a lista de compras que sai dele."
      />

      <Nota icone={Info} titulo="A lista de compras é derivada, não digitada">
        Ela nasce dos ingredientes das receitas da semana. Uma lista escrita à
        mão desencontra do cardápio no primeiro ajuste — e aí a cliente compra
        errado, que é pior do que não ter lista.
      </Nota>

      {WEEKS.map((semana) => {
        const menu = menuForWeek(semana.week);
        const receitas = recipesForWeek(semana.week);
        const lista = buildShoppingList(receitas);
        const grupos = CATEGORY_ORDER.map((cat) => ({
          cat,
          itens: lista[cat] ?? [],
        })).filter((g) => g.itens.length);
        const totalItens = grupos.reduce((s, g) => s + g.itens.length, 0);

        return (
          <Secao
            key={semana.week}
            titulo={semana.label}
            descricao={`Fases: ${phasesOfWeek(semana.week).join(" · ")}`}
          >
            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <Numero valor={menu.length} rotulo="Dias no menu" />
              <Numero valor={receitas.length} rotulo="Receitas usadas" tom="gold" />
              <Numero valor={totalItens} rotulo="Itens de compra" tom="neutro" />
            </div>

            <Tabela colunas={["Dia", "Café", "Almoço", "Jantar", "Lanche"]}>
              {menu.map((d) => (
                <Linha key={d.day}>
                  <Celula className="whitespace-nowrap font-semibold">
                    {d.weekday} · dia {d.day}
                  </Celula>
                  <Celula className="text-ink-soft">{d.cafe.join(" · ")}</Celula>
                  <Celula className="text-ink-soft">{d.almoco.join(" · ")}</Celula>
                  <Celula className="text-ink-soft">{d.jantar.join(" · ")}</Celula>
                  <Celula className="text-ink-soft">{d.lanche.join(" · ")}</Celula>
                </Linha>
              ))}
            </Tabela>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grupos.map((g) => (
                <div
                  key={g.cat}
                  className="rounded-2xl border border-line bg-surface p-4"
                >
                  <p className="eyebrow mb-2">{CATEGORY_LABEL[g.cat].nome}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.itens.map((i) => (
                      <Chip key={i.item}>{i.item}</Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Secao>
        );
      })}
    </>
  );
}
