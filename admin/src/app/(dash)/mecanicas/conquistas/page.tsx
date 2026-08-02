import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { REINTRO_GROUPS } from "@/content/tolerance";
import { REACTIONS, VERDICT_LABEL } from "@/content/tolerance";

export default function ConquistasAdmin() {
  return (
    <>
      <PageHeader
        title="Conquistas"
        subtitle="O que ela desbloqueia, e a regra que dispara cada uma."
      />

      <Nota icone={Info} titulo="Nenhum muro de cadeados na janela de reembolso">
        As primeiras conquistas destravam já na primeira sessão. Uma tela cheia
        de cadeado nos primeiros dias diz &ldquo;você ainda não é nada aqui&rdquo;
        — que é o oposto do que precisa acontecer justamente quando ela ainda
        pode pedir o dinheiro de volta.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-2">
        <Numero valor={ACHIEVEMENTS.length} rotulo="Conquistas no total" />
        <Numero
          valor={REINTRO_GROUPS.length}
          rotulo="Grupos testáveis no Mapa"
          tom="gold"
        />
      </div>

      <Secao titulo="Lista completa">
        <Tabela colunas={["Conquista", "Descrição", "id"]}>
          {ACHIEVEMENTS.map((a) => (
            <Linha key={a.id}>
              <Celula>
                <span className="font-semibold text-ink">{a.title}</span>
              </Celula>
              <Celula className="text-ink-soft">{a.description}</Celula>
              <Celula className="font-mono text-xs text-ink-faint">{a.id}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Níveis de reação do Mapa"
        descricao="O que ela responde depois de testar um grupo — e o veredito que isso vira."
      >
        <Tabela colunas={["Reação", "Rótulo na tela", "Vira no mapa"]}>
          {REACTIONS.map((r) => (
            <Linha key={r.level}>
              <Celula numerica>{r.level}</Celula>
              <Celula>{r.label}</Celula>
              <Celula className="text-ink-soft">
                {r.level === 0
                  ? VERDICT_LABEL.avontade
                  : r.level === 3
                    ? VERDICT_LABEL.evitar
                    : VERDICT_LABEL.moderar}
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
