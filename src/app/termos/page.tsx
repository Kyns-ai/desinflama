import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Termos de uso" };

export default function Termos() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-cream px-6 pt-safe pb-12">
      <div className="flex items-center gap-3 pt-5">
        <Link
          href="/perfil"
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Termos de uso
        </h1>
      </div>

      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
        <p>Ao usar o Desinflama, você concorda com os pontos abaixo.</p>
        <Section title="O que é o Desinflama">
          Um programa educativo de saúde intestinal (Low FODMAP / 5R) com foco em
          sintomas como inchaço, gases, digestão, energia e pele — nunca em
          calorias ou peso.
        </Section>
        <Section title="Não é aconselhamento médico">
          O conteúdo é informativo e revisado por nutricionista, mas não
          substitui consulta, diagnóstico ou tratamento profissional. Em caso de
          sintomas intensos ou persistentes, procure um médico.
        </Section>
        <Section title="Assinatura">
          A assinatura dá acesso ao programa completo. A renovação é automática e
          pode ser cancelada a qualquer momento — você mantém o acesso até o fim
          do período já pago.
        </Section>
        <Section title="Uso responsável">
          Use o app para o seu cuidado pessoal. Não copie nem redistribua o
          conteúdo sem autorização.
        </Section>
        <p className="text-sm text-ink-faint">
          Estes termos podem ser atualizados; avisaremos no app quando isso
          acontecer.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 font-semibold tracking-tight text-ink">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
