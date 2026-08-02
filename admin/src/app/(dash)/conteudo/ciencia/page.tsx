import { Info } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Celula, Linha, Nota, Secao, Tabela } from "@/components/painel";
import {
  CAN_DO,
  CANNOT_DO,
  DISCLAIMER,
  SAFETY_QUESTIONS,
  SCIENCE_SOURCES,
  VALIDATION,
} from "@/content/science";

export default function CienciaAdmin() {
  return (
    <>
      <PageHeader
        title="Ciência e fontes"
        subtitle="O que a gente promete, o que a gente NÃO promete, e de onde vem cada afirmação."
      />

      <Nota icone={Info} titulo="A honestidade é feature, não rodapé" tom="atencao">
        Dizer o que o programa não faz é o maior gesto anti-reembolso do app —
        e, no Brasil, é também o que mantém a promessa longe de tratamento
        (CFN/ANVISA). Nada aqui deve ser suavizado sem decisão do Ruyter.
      </Nota>

      <Secao titulo="O que estes dias PODEM fazer">
        <ul className="space-y-2 rounded-2xl border border-line bg-surface p-5">
          {CAN_DO.map((t) => (
            <li key={t} className="text-sm leading-relaxed text-ink-soft">
              · {t}
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="O que estes dias NÃO fazem">
        <ul className="space-y-2 rounded-2xl border border-gold/40 bg-gold-tint/40 p-5">
          {CANNOT_DO.map((t) => (
            <li key={t} className="text-sm leading-relaxed text-ink-soft">
              · {t}
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo={VALIDATION.title}>
        <p className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-soft">
          {VALIDATION.body}
        </p>
      </Secao>

      <Secao titulo="Fontes">
        <Tabela colunas={["Afirmação", "Fonte"]}>
          {SCIENCE_SOURCES.map((s) => (
            <Linha key={s.url}>
              <Celula className="max-w-[560px]">{s.claim}</Celula>
              <Celula>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-xs text-rose-dark underline underline-offset-2"
                >
                  {s.url}
                </a>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Secao>

      <Secao
        titulo="Triagem de segurança"
        descricao="Perguntas que barram quem não deveria fazer o programa sozinha."
      >
        <ul className="space-y-2 rounded-2xl border border-line bg-surface p-5">
          {SAFETY_QUESTIONS.map((q) => (
            <li key={q.id} className="text-sm leading-relaxed text-ink-soft">
              · {q.text}
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Aviso legal exibido no app">
        <p className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-soft">
          {DISCLAIMER}
        </p>
      </Secao>
    </>
  );
}
