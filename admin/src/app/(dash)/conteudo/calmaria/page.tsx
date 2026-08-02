import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { BREATH, CYCLES, REFRAMES, calmariaForDay, calmariaSeconds } from "@/content/calmaria";

export default function CalmariaAdmin() {
  const dias = Array.from({ length: 21 }, (_, i) => i + 1);

  return (
    <>
      <PageHeader
        title="Calmaria"
        subtitle="A respiração guiada — o pilar Mente-Intestino e a vitória sentida do Dia 0."
      />

      <Nota icone={Info} titulo="É o alívio que ela sente ANTES de acreditar">
        O onboarding termina aqui de propósito: um dashboard não convence
        ninguém no primeiro minuto, mas um minuto de respiração que realmente
        acalma, sim. É a primeira prova de que o app faz alguma coisa por ela.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <Numero valor={Object.keys(BREATH).length} rotulo="Padrões de respiração" />
        <Numero valor={REFRAMES.length} rotulo="Reenquadres" tom="gold" />
        <Numero valor={CYCLES} rotulo="Ciclos por sessão" tom="neutro" />
      </div>

      <Secao titulo="Padrões de respiração">
        <Tabela colunas={["Padrão", "Configuração"]}>
          {Object.entries(BREATH).map(([nome, cfg]) => (
            <Linha key={nome}>
              <Celula className="font-semibold">{nome}</Celula>
              <Celula className="font-mono text-xs text-ink-soft">
                {JSON.stringify(cfg)}
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Sessão por dia da jornada"
        descricao="Cada dia tem seu padrão e seu reenquadre — a Calmaria acompanha a fase."
      >
        <Tabela colunas={["Dia", "Duração", "Sessão"]}>
          {dias.map((d) => {
            const s = calmariaForDay(d);
            return (
              <Linha key={d}>
                <Celula numerica>{d}</Celula>
                <Celula numerica className="text-ink-soft">
                  {calmariaSeconds(s)}s
                </Celula>
                <Celula className="max-w-[560px] text-ink-soft">
                  <p className="font-medium text-ink">{s.reframe.heading}</p>
                  <p className="mt-0.5">{s.reframe.body}</p>
                </Celula>
              </Linha>
            );
          })}
        </Tabela>
      </Secao>
    </>
  );
}
