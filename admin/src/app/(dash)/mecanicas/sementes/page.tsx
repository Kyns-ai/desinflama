import { Info, Sprout } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { SEEDS } from "@/lib/garden";
import { NIVEIS } from "@/lib/broto";

/**
 * A economia de sementes, lida DIRETO do app (`src/lib/garden.ts` e
 * `src/lib/broto.ts`). Se alguém mudar um valor lá, esta tela muda junto —
 * era o objetivo de importar em vez de copiar.
 */

const GANHOS: { rotulo: string; valor: number; onde: string }[] = [
  { rotulo: "Check-in do dia", valor: SEEDS.checkin, onde: "Cartão do dia · Hoje" },
  { rotulo: "Aula do dia", valor: SEEDS.lesson, onde: "Cartão do dia · Hoje" },
  { rotulo: "Calmaria", valor: SEEDS.calmaria, onde: "Cartão do dia · Hoje" },
  { rotulo: "Água do dia", valor: SEEDS.agua, onde: "Cartão do dia · Hoje" },
  { rotulo: "Cada tarefa do dia", valor: SEEDS.tarefa, onde: "Programa · dia aberto" },
  { rotulo: "Foto de refeição (máx. 2/dia)", valor: SEEDS.foto, onde: "Prato" },
  { rotulo: "Passar o dia sem o gatilho", valor: SEEDS.semGatilho, onde: "Cartão do dia · Hoje" },
  { rotulo: "Fechar o dia", valor: SEEDS.completeDay, onde: "Cartão do dia · Hoje" },
  { rotulo: "Fechar a semana (dias 7, 14, 21)", valor: SEEDS.milestone, onde: "Marco da jornada" },
];

const DIA_TIPICO =
  SEEDS.checkin +
  SEEDS.lesson +
  SEEDS.calmaria +
  SEEDS.agua +
  SEEDS.semGatilho +
  SEEDS.completeDay;

export default function Sementes() {
  return (
    <>
      <PageHeader
        title="Sementes"
        subtitle="A moeda do app: ganha cuidando, gasta em prazer real."
      />

      <Nota icone={Info} titulo="Dois contadores, de propósito">
        <strong className="font-semibold text-ink">Saldo</strong> é o que ela
        pode gastar na loja de Prazeres.{" "}
        <strong className="font-semibold text-ink">Acumulado na vida</strong> só
        sobe e é o que define o nível do Broto. Perder o personagem por ter se
        dado um brigadeiro puniria exatamente o comportamento que a gente quer
        normalizar — por isso gastar nunca mexe no segundo.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <Numero
          valor={DIA_TIPICO}
          rotulo="Dia bem feito"
          detalhe="check-in + aula + calmaria + água + sem gatilho + fechar"
        />
        <Numero valor={DIA_TIPICO * 7 + SEEDS.milestone} rotulo="Semana cheia" tom="gold" />
        <Numero
          valor={`${Math.round((80 / DIA_TIPICO) * 10) / 10}×`}
          rotulo="Dias para uma taça de vinho (80)"
          tom="neutro"
        />
      </div>

      <Secao
        titulo="Como ela ganha"
        descricao="Toda linha aqui é cuidado, não caloria. É o que o Finch faz: o personagem reage ao que você fez por você, não ao que você deixou de comer."
      >
        <Tabela colunas={["Ação", "Sementes", "Onde acontece no app"]}>
          {GANHOS.map((g) => (
            <Linha key={g.rotulo}>
              <Celula>{g.rotulo}</Celula>
              <Celula numerica>
                <span className="inline-flex items-center gap-1.5 font-semibold text-rose-dark">
                  <Sprout className="size-4" />+{g.valor}
                </span>
              </Celula>
              <Celula className="text-ink-soft">{g.onde}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Níveis do Broto"
        descricao="Contados sobre o acumulado da vida. Nunca caem."
      >
        <Tabela colunas={["Nível", "A partir de", "Dias bem feitos", "Desbloqueia"]}>
          {NIVEIS.map((n) => (
            <Linha key={n.id}>
              <Celula>
                <span className="font-semibold text-ink">{n.nome}</span>
              </Celula>
              <Celula numerica>{n.limiar}</Celula>
              <Celula numerica className="text-ink-soft">
                {n.limiar === 0 ? "—" : `~${Math.ceil(n.limiar / DIA_TIPICO)}`}
              </Celula>
              <Celula>
                {n.abre ? <Chip tom="rose">{n.abre}</Chip> : <span className="text-ink-faint">—</span>}
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
