import { Info, Sprout } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { PRAZERES_PADRAO, TETO_SEMANAL_SUGERIDO } from "@/content/prazeres";
import { SEEDS } from "@/lib/garden";

const DIA_TIPICO =
  SEEDS.checkin +
  SEEDS.lesson +
  SEEDS.calmaria +
  SEEDS.agua +
  SEEDS.semGatilho +
  SEEDS.completeDay;

export default function PrazeresAdmin() {
  return (
    <>
      <PageHeader
        title="Prazeres"
        subtitle="A loja onde a semente vira coisa da vida real."
      />

      <Nota icone={Info} titulo="A regra de copy, que vale mais que a tabela">
        Aqui nunca se chama de recaída, escapada, trapaça ou dia do lixo. O
        prazer resgatado <strong className="font-semibold text-ink">estava no plano</strong> —
        foi comprado com cuidado acumulado. Tratar prazer como falha é o que faz
        a mulher esconder o que comeu, e o que ela esconde a gente não consegue
        ajudar a entender.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <Numero valor={DIA_TIPICO} rotulo="Sementes de um dia bem feito" />
        <Numero
          valor={TETO_SEMANAL_SUGERIDO}
          rotulo="Teto semanal SUGERIDO"
          detalhe="regra do WeightWatchers — sugestão, nunca trava"
          tom="gold"
        />
        <Numero
          valor={PRAZERES_PADRAO.length}
          rotulo="Prazeres no catálogo"
          detalhe="ela ainda cria os próprios, com o próprio preço"
          tom="neutro"
        />
      </div>

      <Secao
        titulo="Catálogo e preços"
        descricao="Calibrados contra a tabela de ganho: o preço é o que transforma 'eu mereço' em 'eu construí'."
      >
        <Tabela colunas={["Prazer", "Preço", "Dias bem feitos", "Faixa"]}>
          {PRAZERES_PADRAO.map((p) => {
            const dias = p.preco / DIA_TIPICO;
            return (
              <Linha key={p.id}>
                <Celula>{p.nome}</Celula>
                <Celula numerica>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-rose-dark">
                    <Sprout className="size-4" />
                    {p.preco}
                  </span>
                </Celula>
                <Celula numerica className="text-ink-soft">
                  {dias < 1 ? "menos de 1" : dias.toFixed(1).replace(".", ",")}
                </Celula>
                <Celula className="text-ink-soft">
                  {p.preco <= 50
                    ? "do dia a dia"
                    : p.preco <= 120
                      ? "da semana"
                      : "de ocasião"}
                </Celula>
              </Linha>
            );
          })}
        </Tabela>
      </Secao>

      <Secao
        titulo="O que acontece depois do resgate"
        descricao="O prazer também ensina — é o que separa esta loja de um sistema de pontos qualquer."
      >
        <ol className="space-y-2.5 rounded-2xl border border-line bg-surface p-5">
          {[
            "O saldo cai. O acumulado da vida NÃO cai, então o Broto não regride.",
            "A tela diz 'Estava no seu plano.' e nomeia o preço em cuidado que ela pagou.",
            "O dia fica marcado e o check-in seguinte pergunta como o corpo reagiu.",
            "A resposta vira dado do Mapa de Tolerância — o prazer virou informação.",
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
    </>
  );
}
