import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { SimuladorCardapio } from "./Simulador";
import { alimentosParaEscolher } from "@/lib/cardapioPessoal";
import { RECIPES } from "@/content/recipes";

export default function CardapioAdmin() {
  const alimentos = alimentosParaEscolher();
  const porTipo = RECIPES.reduce<Record<string, number>>((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Cardápio pessoal"
        subtitle="Como o cardápio dela é montado a partir do que ela gosta e do que o corpo dela tolera."
      />

      <Nota icone={Info} titulo="Por que não é um cardápio fixo">
        O padrão está em todos os funis grandes de saúde — o Homemade Method faz
        a pessoa tocar &ldquo;gosto / não é pra mim&rdquo; em alimentos ANTES de
        mostrar o plano.{" "}
        <strong className="font-semibold text-ink">
          Plano com comida que ela já come é plano que ela segue
        </strong>
        ; plano genérico é o que ela abandona na terça.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-4">
        <Numero valor={alimentos.length} rotulo="Alimentos perguntados" detalhe="só os que existem nas receitas" />
        <Numero valor={RECIPES.length} rotulo="Receitas disponíveis" tom="gold" />
        <Numero valor={porTipo["Café"] ?? 0} rotulo="Opções de café" tom="neutro" />
        <Numero valor={porTipo["Jantar"] ?? 0} rotulo="Opções de jantar" tom="neutro" />
      </div>

      <Secao
        titulo="A ordem de prioridade"
        descricao="Deliberada, e nesta ordem — inverter qualquer uma muda o que ela recebe."
      >
        <ol className="space-y-2.5 rounded-2xl border border-line bg-surface p-5">
          {[
            "NUNCA sugerir o que ela marcou que não come. Isso é respeito, não algoritmo — sugerir de novo é dizer que a escolha dela não conta.",
            "Evitar o que o Mapa de Tolerância já mostrou que incha ELA. Pesa contra, mas não elimina: porção pequena de um grupo moderado continua sendo escolha dela.",
            "Entre as que sobram, preferir as que têm mais coisa que ela gosta.",
          ].map((t, i) => (
            <li key={t} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
              <span className="numeral grid size-6 shrink-0 place-items-center rounded-full bg-rose-tint text-xs text-rose-dark">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </Secao>

      <Nota icone={Info} titulo="É determinístico de propósito" tom="atencao">
        A mesma semana com as mesmas preferências dá sempre o mesmo cardápio,
        com desempate estável. Cardápio que muda sozinho a cada abertura destrói
        a lista de compras — ela compra na segunda o que o app esquece na
        quarta.
      </Nota>

      <Secao
        titulo="Simulador"
        descricao="Marque gosto/não-gosto e a tolerância dela, e veja a semana se remontar. Roda a mesma função do app."
      >
        <SimuladorCardapio />
      </Secao>

      <Secao
        titulo="Alimentos perguntados"
        descricao="Só entram alimentos que aparecem de fato em alguma receita — perguntar sobre comida que o app nunca vai sugerir é fazer a pessoa trabalhar de graça."
      >
        <Tabela colunas={["Alimento", "Aparece em"]}>
          {alimentos.map((a) => {
            const receitas = RECIPES.filter((r) =>
              r.ingredientes.some((i) =>
                i.toLowerCase().includes(a.toLowerCase().split(/[\s/(]/)[0])
              )
            );
            return (
              <Linha key={a}>
                <Celula className="font-medium">{a}</Celula>
                <Celula className="text-ink-soft">
                  {receitas.length
                    ? receitas.map((r) => r.nome).join(" · ")
                    : "—"}
                </Celula>
              </Linha>
            );
          })}
        </Tabela>
      </Secao>
    </>
  );
}
