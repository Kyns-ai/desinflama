import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Secao, Tabela } from "@/components/painel";
import {
  DAY_TO_GROUPS,
  REACTIONS,
  REINTRO_GROUPS,
  VERDICT_LABEL,
} from "@/content/tolerance";

export default function ToleranciaAdmin() {
  return (
    <>
      <PageHeader
        title="Mapa de Tolerância"
        subtitle="A lista pessoal 'tolera / modera / evita' — o entregável central do método."
      />

      <Nota icone={Info} titulo="É o que nenhuma dieta genérica entrega">
        O mapa é construído por ela, um grupo por vez, na reintrodução (dias
        8–11). Grupo sem teste fica honestamente como{" "}
        <strong className="font-semibold text-ink">
          &ldquo;ainda não testou&rdquo;
        </strong>{" "}
        — nunca como proibido. E é este mapa que faz a Nota do prato ser dela: o
        mesmo prato muda de nota conforme ele se preenche.
      </Nota>

      <Secao titulo="Os cinco grupos">
        <Tabela colunas={["Grupo", "O que é", "Exemplos", "Testa no dia"]}>
          {REINTRO_GROUPS.map((g) => (
            <Linha key={g.group}>
              <Celula>
                <span className="font-semibold text-ink">{g.nome}</span>
              </Celula>
              <Celula className="text-ink-soft">{g.resumo}</Celula>
              <Celula className="text-ink-soft">{g.exemplos}</Celula>
              <Celula numerica>{g.defaultDay}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Calendário da reintrodução"
        descricao="Um grupo por vez, com folga entre eles — testar dois juntos não diz qual foi."
      >
        <Tabela colunas={["Dia da jornada", "Grupo(s) testável(is)"]}>
          {Object.entries(DAY_TO_GROUPS).map(([dia, grupos]) => (
            <Linha key={dia}>
              <Celula numerica>Dia {dia}</Celula>
              <Celula>
                <span className="flex flex-wrap gap-1.5">
                  {grupos.map((g) => (
                    <Chip key={g} tom="rose">
                      {REINTRO_GROUPS.find((x) => x.group === g)?.nome ?? g}
                    </Chip>
                  ))}
                  {grupos.length > 1 && (
                    <span className="text-xs text-ink-faint">
                      (ela escolhe qual)
                    </span>
                  )}
                </span>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Reação → veredito → peso na nota">
        <Tabela colunas={["Reação registrada", "Veredito no mapa", "Fator na Nota"]}>
          {REACTIONS.map((r) => (
            <Linha key={r.level}>
              <Celula>{r.label}</Celula>
              <Celula className="text-ink-soft">
                {r.level === 0
                  ? VERDICT_LABEL.avontade
                  : r.level === 3
                    ? VERDICT_LABEL.evitar
                    : VERDICT_LABEL.moderar}
              </Celula>
              <Celula numerica>
                {{ 0: "0,15", 1: "0,35", 2: "0,60", 3: "1,00" }[r.level]}
              </Celula>
            </Linha>
          ))}
          <Linha>
            <Celula className="text-ink-faint">{VERDICT_LABEL.naotestado}</Celula>
            <Celula className="text-ink-faint">—</Celula>
            <Celula numerica className="text-ink-faint">
              0,50
            </Celula>
          </Linha>
        </Tabela>
      </Secao>
    </>
  );
}
