import { PageHeader } from "@/components/ui";
import { Celula, Linha, Numero, Secao, Tabela } from "@/components/painel";
import { MONTHLY_CHALLENGES } from "@/content/challenges";

export default function DesafiosAdmin() {
  const totalDias = MONTHLY_CHALLENGES.reduce((s, c) => s + c.dias.length, 0);

  return (
    <>
      <PageHeader
        title="Desafios mensais"
        subtitle="A camada de retenção do Modo Manutenção — o 'para sempre' do app."
      />

      <div className="mb-9 grid gap-3 sm:grid-cols-2">
        <Numero valor={MONTHLY_CHALLENGES.length} rotulo="Desafios" />
        <Numero valor={totalDias} rotulo="Dias de conteúdo" tom="gold" />
      </div>

      {MONTHLY_CHALLENGES.map((c) => (
        <Secao key={c.id} titulo={c.nome} descricao={c.descricao}>
          <Tabela colunas={["Dia", "Título", "Texto", "Checklist"]}>
            {c.dias.map((d) => (
              <Linha key={d.day}>
                <Celula numerica>{d.day}</Celula>
                <Celula className="max-w-[200px] font-medium">{d.title}</Celula>
                <Celula className="max-w-[380px] text-ink-soft">{d.body}</Celula>
                <Celula className="max-w-[240px] text-ink-soft">
                  <ul className="space-y-0.5">
                    {d.checklist.map((i) => (
                      <li key={i}>· {i}</li>
                    ))}
                  </ul>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Secao>
      ))}
    </>
  );
}
