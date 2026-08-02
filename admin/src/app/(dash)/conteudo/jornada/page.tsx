import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { DAYS } from "@/content/journey";

/** A trilha inteira dos 21 dias, lida do conteúdo real do app. */
export default function JornadaAdmin() {
  const totalAulas = DAYS.length;
  const totalTarefas = DAYS.reduce((s, d) => s + d.checklist.length, 0);
  const marcos = DAYS.filter((d) => d.milestone);

  return (
    <>
      <PageHeader
        title="Jornada"
        subtitle="Os 21 dias: aula, tarefas, refeições e a mensagem de fechamento de cada dia."
      />

      <Nota icone={Info} titulo="Este é o ativo mais caro do projeto">
        Conteúdo de 21 dias com aula, checklist e cardápio por dia. Foi o motivo
        de a refundação ter reaproveitado o motor e refeito só a casca — jogar
        isto fora por causa de CSS não se faz.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-4">
        <Numero valor={totalAulas} rotulo="Dias com conteúdo" />
        <Numero valor={totalTarefas} rotulo="Tarefas no total" tom="gold" />
        <Numero valor={marcos.length} rotulo="Marcos" tom="neutro" />
        <Numero
          valor={new Set(DAYS.map((d) => d.phase)).size}
          rotulo="Fases"
          tom="neutro"
        />
      </div>

      <Secao titulo="Dia a dia">
        <Tabela
          colunas={["Dia", "Fase", "Aula", "Tarefas", "Refeições", "Fecha com"]}
        >
          {DAYS.map((d) => (
            <Linha key={d.day}>
              <Celula numerica>
                <span className="font-semibold text-ink">{d.day}</span>
                {d.milestone && (
                  <span className="mt-1 block">
                    <Chip tom="rose">{d.milestone}</Chip>
                  </span>
                )}
              </Celula>
              <Celula>
                <Chip>{d.phase}</Chip>
              </Celula>
              <Celula className="max-w-[220px]">
                <p className="font-medium text-ink">{d.lesson.title}</p>
                <p className="text-xs text-ink-faint">
                  {d.lesson.durationMin} min
                </p>
              </Celula>
              <Celula className="max-w-[240px]">
                <ul className="space-y-0.5 text-ink-soft">
                  {d.checklist.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              </Celula>
              <Celula className="max-w-[260px] text-ink-soft">
                <p>
                  <span className="text-ink-faint">Café:</span>{" "}
                  {d.meals.cafe[0]}
                </p>
                <p>
                  <span className="text-ink-faint">Almoço:</span>{" "}
                  {d.meals.almoco[0]}
                </p>
                <p>
                  <span className="text-ink-faint">Jantar:</span>{" "}
                  {d.meals.jantar[0]}
                </p>
              </Celula>
              <Celula className="max-w-[240px] text-ink-soft">
                {d.completionMessage}
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
