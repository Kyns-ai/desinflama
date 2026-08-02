import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Secao, Tabela } from "@/components/painel";
import { Broto } from "@/components/broto/Broto";
import { NIVEIS, humorPara, type BrotoHumor } from "@/lib/broto";
import { falaDoBroto } from "@/content/broto";

const HUMORES: { id: BrotoHumor; quando: string }[] = [
  { id: "desanimado", quando: "nenhuma ação de cuidado hoje" },
  { id: "neutro", quando: "1 ou 2 ações hoje" },
  { id: "animado", quando: "3 ou mais ações hoje" },
  { id: "comemorando", quando: "dia fechado" },
];

/**
 * Todas as poses do personagem, renderizadas pelo componente REAL do app
 * (`src/components/broto/Broto.tsx`). Não é print nem cópia: o que aparece
 * aqui é literalmente o que a cliente vê.
 */
export default function BrotoAdmin() {
  return (
    <>
      <PageHeader
        title="O Broto"
        subtitle="O personagem que mora na Hoje. Reage ao cuidado do dia e nunca pune."
      />

      <Nota icone={Info} titulo="Ele nunca adoece, nunca morre, nunca some">
        Punição visível vira ansiedade e a pessoa abandona o app — o Finch, que
        é o maior do mundo na categoria, não pune ninguém. O nosso, no pior dia,
        fica desanimado. O nível vem do acumulado da vida e por isso nunca cai,
        nem quando ela gasta sementes na loja.
      </Nota>

      <Secao
        titulo="As 16 poses"
        descricao="4 níveis × 4 humores. Tudo vetor, no mesmo código — a cabeça, os olhos e o vaso são compartilhados; só folhagem e expressão mudam."
      >
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface p-5">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className="eyebrow w-28 px-2 pb-3 text-left">Nível</th>
                {HUMORES.map((h) => (
                  <th key={h.id} className="px-2 pb-3 text-center">
                    <span className="eyebrow block">{h.id}</span>
                    <span className="mt-0.5 block text-[11px] font-normal normal-case tracking-normal text-ink-faint">
                      {h.quando}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NIVEIS.map((n) => (
                <tr key={n.id} className="border-t border-line-soft">
                  <td className="px-2 py-3 align-middle">
                    <p className="text-sm font-semibold text-ink">{n.nome}</p>
                    <p className="numeral text-xs text-ink-faint">
                      {n.limiar}+ sementes
                    </p>
                  </td>
                  {HUMORES.map((h) => (
                    <td key={h.id} className="px-2 py-3 text-center align-bottom">
                      <div className="inline-flex flex-col items-center">
                        <Broto nivel={n.id} humor={h.id} size={104} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao
        titulo="Regra do humor"
        descricao="Conta só as ações de HOJE, e volta ao normal amanhã. Nada acumula culpa."
      >
        <Tabela colunas={["Ações de cuidado hoje", "Dia fechado?", "Humor"]}>
          {[
            { acoes: 0, fechado: false },
            { acoes: 1, fechado: false },
            { acoes: 2, fechado: false },
            { acoes: 3, fechado: false },
            { acoes: 5, fechado: false },
            { acoes: 5, fechado: true },
          ].map((c) => (
            <Linha key={`${c.acoes}-${c.fechado}`}>
              <Celula numerica>{c.acoes}</Celula>
              <Celula className="text-ink-soft">{c.fechado ? "sim" : "não"}</Celula>
              <Celula>
                <span className="font-semibold text-ink">
                  {humorPara(c.acoes, c.fechado)}
                </span>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="O que ele fala"
        descricao="Uma frase por dia, do conteúdo local — zero custo de IA. É determinística pelo dia da jornada, senão a frase piscaria a cada toque e o boneco deixaria de parecer vivo."
      >
        <Tabela colunas={["Humor", "Falas"]}>
          {HUMORES.map((h) => (
            <Linha key={h.id}>
              <Celula className="whitespace-nowrap font-semibold">{h.id}</Celula>
              <Celula>
                <ul className="space-y-1">
                  {Array.from({ length: 5 }, (_, i) => falaDoBroto(h.id, i)).map(
                    (f) => (
                      <li key={f} className="text-ink-soft">
                        {f}
                      </li>
                    )
                  )}
                </ul>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
