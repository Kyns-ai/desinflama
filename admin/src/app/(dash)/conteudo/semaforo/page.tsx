import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { SEMAFORO } from "@/content/semaforo";
import { TRIGGER_FOODS } from "@/content/foods";
import { SWAPS } from "@/content/swaps";

const TOM_TIER = { calma: "boa", atencao: "media", inflama: "ruim" } as const;

export default function SemaforoAdmin() {
  const totalAlimentos = SEMAFORO.reduce((s, t) => s + t.foods.length, 0);
  const totalTrocas = SWAPS.reduce((s, c) => s + c.itens.length, 0);

  return (
    <>
      <PageHeader
        title="Semáforo e gatilhos"
        subtitle="O atalho visual do que costuma cair bem, o que pede atenção e o que incha."
      />

      <Nota icone={Info} titulo="Não é bom contra ruim — é conforto provável">
        Nada aqui é proibido. A maioria das pessoas reage a apenas 1 a 3 grupos,
        e a reintrodução devolve quase tudo. O corpo de cada uma manda mais que
        a tabela — por isso o Mapa de Tolerância dela sempre vence o semáforo.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <Numero valor={totalAlimentos} rotulo="Alimentos no semáforo" />
        <Numero valor={TRIGGER_FOODS.length} rotulo="Gatilhos detalhados" tom="gold" />
        <Numero valor={totalTrocas} rotulo="Trocas de→para" tom="neutro" />
      </div>

      {SEMAFORO.map((t) => (
        <Secao key={t.tier} titulo={t.label} descricao={t.desc}>
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-line bg-surface p-4">
            {t.foods.map((f) => (
              <Chip key={f.nome} tom={TOM_TIER[t.tier]}>
                {f.nome}
              </Chip>
            ))}
          </div>
        </Secao>
      ))}

      <Secao
        titulo="Gatilhos que parecem saudáveis"
        descricao="A lista que mais gera 'nossa, eu como isso todo dia' — cada um com o porquê e a troca."
      >
        <Tabela colunas={["Alimento", "Grupo", "Por que incha", "Troca"]}>
          {TRIGGER_FOODS.map((f) => (
            <Linha key={f.nome}>
              <Celula>
                <span className="font-semibold text-ink">{f.nome}</span>
              </Celula>
              <Celula>
                <Chip tom="media">{f.grupo}</Chip>
              </Celula>
              <Celula className="max-w-[380px] text-ink-soft">{f.porque}</Celula>
              <Celula className="max-w-[280px] text-ink-soft">{f.troca}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      {SWAPS.map((c) => (
        <Secao key={c.categoria} titulo={`Trocas · ${c.categoria}`}>
          <Tabela colunas={["De", "Para", "Por quê"]}>
            {c.itens.map((i) => (
              <Linha key={i.de}>
                <Celula className="font-medium">{i.de}</Celula>
                <Celula className="text-rose-dark">{i.para}</Celula>
                <Celula className="max-w-[420px] text-ink-soft">{i.motivo}</Celula>
              </Linha>
            ))}
          </Tabela>
        </Secao>
      ))}
    </>
  );
}
