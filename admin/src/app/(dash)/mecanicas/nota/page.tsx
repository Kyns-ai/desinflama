import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Chip, Linha, Nota, Secao, Tabela } from "@/components/painel";
import { Simulador } from "./Simulador";
import { FAIXAS } from "@/lib/notaPrato";
import { CATALOGO } from "@/content/catalogoPrato";
import { REINTRO_GROUPS } from "@/content/tolerance";

export default function NotaAdmin() {
  const comGrupo = CATALOGO.filter((a) => a.grupo).length;
  const comMarcador = CATALOGO.filter((a) => a.marcadores?.length).length;

  return (
    <>
      <PageHeader
        title="Nota do prato"
        subtitle="0 a 100 para uma refeição — calculada no aparelho, nunca pela IA."
      />

      <Nota icone={Info} titulo="Quem faz o quê">
        A IA faz só o que IA faz bem:{" "}
        <strong className="font-semibold text-ink">olhar a foto</strong> e dizer
        quais alimentos estão ali e de que grupo FODMAP. A{" "}
        <strong className="font-semibold text-ink">nota é regra nossa</strong>,
        determinística. Assim a mesma foto dá sempre a mesma nota, dá pra
        explicar de onde cada ponto saiu, não se paga token pra calcular — e a
        nota é DELA: o mesmo prato muda conforme o Mapa de Tolerância evolui.
      </Nota>

      <Secao
        titulo="Simulador"
        descricao="Monte o prato, mexa no perfil e no Mapa de Tolerância, e veja a nota mudar. Roda a mesma função do app, não uma cópia."
      >
        <Simulador />
      </Secao>

      <Secao titulo="Faixas">
        <Tabela colunas={["Faixa", "De", "Veredito na tela"]}>
          {(
            [
              ["cai-bem", "boa"],
              ["depende", "media"],
              ["incha", "ruim"],
            ] as const
          ).map(([id, tom]) => (
            <Linha key={id}>
              <Celula>
                <Chip tom={tom}>{id}</Chip>
              </Celula>
              <Celula numerica>{FAIXAS[id].minimo}</Celula>
              <Celula>{FAIXAS[id].veredito}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Um teto que protege a promessa"
        descricao="Regra escrita depois de um teste falhar."
      >
        <div className="rounded-2xl border border-gold/40 bg-gold-tint/40 p-5 text-sm leading-relaxed text-ink-soft">
          Um prato com um único item de um grupo que ela{" "}
          <strong className="font-semibold text-ink">já reagiu forte</strong>{" "}
          fechava em 82 e a tela dizia &ldquo;Cai bem pra você&rdquo;. Isso é
          mentir sobre o gatilho confirmado dela — a coisa exata que o app
          existe pra não fazer. Hoje há um teto: gatilho confirmado no prato
          nunca passa de{" "}
          <strong className="numeral font-semibold text-ink">79</strong>, ou
          seja, no máximo &ldquo;Depende da porção&rdquo;.
        </div>
      </Secao>

      <Secao
        titulo="Sensibilidade por grupo"
        descricao='O fator vem do teste MAIS RECENTE dela. "Não testado" fica em 0,5 de propósito: sem dado, a nota não pode nem assustar nem tranquilizar.'
      >
        <Tabela colunas={["Grupo", "O que é", "Exemplos"]}>
          {REINTRO_GROUPS.map((g) => (
            <Linha key={g.group}>
              <Celula>
                <span className="font-semibold text-ink">{g.nome}</span>
              </Celula>
              <Celula className="text-ink-soft">{g.resumo}</Celula>
              <Celula className="text-ink-soft">{g.exemplos}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo={`Catálogo de alimentos (${CATALOGO.length})`}
        descricao={`${comGrupo} com grupo FODMAP · ${comMarcador} com marcador não-FODMAP (sódio, ultraprocessado, cafeína, gordura, fritura).`}
      >
        <Tabela colunas={["Alimento", "Grupo", "Marcadores", "Fibra", "Troca específica"]}>
          {CATALOGO.map((a) => (
            <Linha key={a.nome}>
              <Celula>{a.nome}</Celula>
              <Celula>
                {a.grupo ? (
                  <Chip tom="media">{a.grupo}</Chip>
                ) : (
                  <Chip tom="boa">cai bem</Chip>
                )}
              </Celula>
              <Celula className="text-ink-soft">
                {a.marcadores?.join(", ") ?? "—"}
              </Celula>
              <Celula className="text-ink-soft">{a.fibra ? "sim" : "—"}</Celula>
              <Celula className="max-w-[280px] text-ink-soft">
                {a.troca ?? <span className="text-ink-faint">usa a do grupo</span>}
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
