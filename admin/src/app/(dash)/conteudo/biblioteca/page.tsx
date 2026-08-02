import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Numero, Secao, Tabela } from "@/components/painel";
import { LESSONS } from "@/content/library";

export default function BibliotecaAdmin() {
  const temas = Array.from(new Set(LESSONS.map((l) => l.tema)));

  return (
    <>
      <PageHeader
        title="Biblioteca"
        subtitle="As aulas da nutri, por tema — o que ela lê fora da trilha do dia."
      />

      <div className="mb-9 grid gap-3 sm:grid-cols-2">
        <Numero valor={LESSONS.length} rotulo="Aulas" />
        <Numero valor={temas.length} rotulo="Temas" tom="gold" />
      </div>

      {temas.map((tema) => (
        <Secao key={tema} titulo={tema}>
          <Tabela colunas={["Aula", "Duração", "Texto"]}>
            {LESSONS.filter((l) => l.tema === tema).map((l) => (
              <Linha key={l.id}>
                <Celula className="max-w-[240px]">
                  <span className="font-semibold text-ink">{l.title}</span>
                </Celula>
                <Celula className="whitespace-nowrap">
                  <Chip>{l.durationLabel}</Chip>
                </Celula>
                <Celula className="max-w-[520px] text-ink-soft">
                  {l.body.map((p) => (
                    <p key={p} className="mb-1.5 last:mb-0">
                      {p}
                    </p>
                  ))}
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Secao>
      ))}
    </>
  );
}
