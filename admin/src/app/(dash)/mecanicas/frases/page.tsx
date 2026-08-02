import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Numero, Secao, Tabela } from "@/components/painel";
import { FRASES, type MomentoFrase } from "@/content/frases";

const MOMENTOS: { id: MomentoFrase; nome: string; quando: string }[] = [
  { id: "manha", nome: "Manhã", quando: "padrão — o momento de maior abertura do app" },
  { id: "tpm", nome: "TPM", quando: "fase lútea, calculada pelo ciclo dela" },
  { id: "diaDificil", nome: "Dia difícil", quando: "nenhuma ação de cuidado hoje" },
  { id: "vitoria", nome: "Vitória", quando: "dia fechado" },
  { id: "recaida", nome: "Depois de um prazer", quando: "resgatou algo na loja hoje" },
];

export default function FrasesAdmin() {
  return (
    <>
      <PageHeader
        title="Frases do dia"
        subtitle="O card que ela posta — o motor de crescimento copiado do I am."
      />

      <Nota icone={Info} titulo="A frase não é o produto: o card é">
        O que faz o I am ter 12,5 milhões de downloads não é a frase, é a frase
        virar imagem bonita que a pessoa posta, com a marca junto. Por isso toda
        frase daqui cabe num card quadrado e faz sentido{" "}
        <strong className="font-semibold text-ink">fora do app</strong> — quem vê
        no Stories não tem contexto nenhum. E, ao contrário do I am, toda frase
        aqui fala do corpo dela, não do universo.
      </Nota>

      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <Numero valor={FRASES.length} rotulo="Frases no acervo" />
        <Numero valor={MOMENTOS.length} rotulo="Momentos cobertos" tom="gold" />
        <Numero
          valor={FRASES.filter((f) => f.momento === "recaida").length}
          rotulo="Frases pós-prazer"
          detalhe="as mais importantes do conjunto"
          tom="neutro"
        />
      </div>

      {MOMENTOS.map((m) => {
        const doMomento = FRASES.filter((f) => f.momento === m.id);
        return (
          <Secao
            key={m.id}
            titulo={`${m.nome} (${doMomento.length})`}
            descricao={`Aparece quando: ${m.quando}.`}
          >
            <Tabela colunas={["Frase", "Caracteres"]}>
              {doMomento.map((f) => (
                <Linha key={f.texto}>
                  <Celula>
                    <span className="font-display text-base text-ink">
                      {f.texto}
                    </span>
                  </Celula>
                  <Celula numerica className="text-ink-faint">
                    {f.texto.length}
                  </Celula>
                </Linha>
              ))}
            </Tabela>
          </Secao>
        );
      })}
    </>
  );
}
