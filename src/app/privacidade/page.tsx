import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacidade" };

export default function Privacidade() {
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
          Privacidade
        </h1>
      </div>

      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
        <p>
          Sua privacidade é prioridade. Aqui está, em linguagem simples, como
          tratamos seus dados no Desinflama.
        </p>
        <Section title="O que guardamos">
          Seu nome e e-mail (para o login), e os dados do seu programa: registros
          de sintomas, refeições, progresso e conquistas. Servem só para
          personalizar sua experiência.
        </Section>
        <Section title="Suas fotos">
          As fotos de progresso ficam <strong>no seu aparelho</strong> (ou em
          armazenamento privado da sua conta). Não são públicas e não as usamos
          para mais nada.
        </Section>
        <Section title="Saúde, com responsabilidade">
          O conteúdo é educativo e baseado em ciência da nutrição (Low FODMAP /
          5R), revisado por nutricionista. Não é diagnóstico nem substitui
          acompanhamento médico.
        </Section>
        <Section title="Pagamentos">
          As assinaturas são processadas pela loja (App Store / Google Play) ou
          pelo nosso checkout web seguro. Não armazenamos dados do seu cartão.
        </Section>
        <Section title="Seus direitos">
          Você pode exportar ou excluir seus dados a qualquer momento em Perfil ›
          Meu plano › Excluir conta.
        </Section>
        <p className="text-sm text-ink-faint">
          Dúvidas? Fale com a gente pelo suporte no app.
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
