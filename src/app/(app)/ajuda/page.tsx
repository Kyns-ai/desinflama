"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, MessageCircle, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui";
import { SUPPORT, whatsappUrl } from "@/content/support";
import { cn } from "@/lib/cn";

const FAQ = [
  {
    q: "O Desinflama é uma dieta?",
    a: "Não. É um programa que descobre o que te incha e te ensina a comer melhor para o SEU intestino — com base em Low FODMAP e no framework 5R. O foco é sintoma (inchaço, gases, energia, pele), nunca caloria ou peso.",
  },
  {
    q: "Preciso cortar tudo pra sempre?",
    a: "De jeito nenhum. Os primeiros dias acalmam o intestino; depois a gente reintroduz os grupos um a um para descobrir o que VOCÊ tolera. No fim, você tem um mapa pessoal do que pode comer à vontade.",
  },
  {
    q: "Em quanto tempo vejo resultado?",
    a: "Cada corpo tem um ritmo: muitas sentem a barriga menos estufada nos primeiros dias, e a maioria nota diferença clara entre a 1ª e a 2ª semana. O registro diário é o que mostra o SEU ritmo.",
  },
  {
    q: "Substitui acompanhamento médico?",
    a: "Não. O conteúdo é educativo e revisado por nutricionista, mas não é diagnóstico nem tratamento. Se os sintomas forem intensos ou persistentes, procure um médico.",
  },
  {
    q: "Como cancelo a assinatura?",
    a: "Em Perfil › Meu plano você cancela quando quiser, sem burocracia, e continua com acesso até o fim do período já pago.",
  },
  {
    q: "Minhas fotos de progresso são privadas?",
    a: "Sim. As fotos ficam no seu aparelho (ou no seu armazenamento privado). Só você vê.",
  },
  {
    q: "Mudei de celular. Perco meu progresso?",
    a: "Não, se você estiver com a conta logada — seu progresso sincroniza. É só entrar com o mesmo login no aparelho novo.",
  },
];

export default function Ajuda() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
          Ajuda
        </h1>
      </header>

      <div className="space-y-2">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <Card key={i} elevation="soft" className="overflow-hidden p-0">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex-1 font-semibold tracking-tight text-ink">
                  {item.q}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-ink-faint transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-soft">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      <Card elevation="card" className="bg-rose-tint/40">
        <h2 className="font-semibold tracking-tight text-ink">
          Não achou o que procurava?
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          A gente responde rápido. Fale com o suporte.
        </p>
        <div className="mt-3 flex gap-2">
          {whatsappUrl() && (
            <a
              href={whatsappUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-deep"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          {SUPPORT.email && (
            <a
              href={`mailto:${SUPPORT.email}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-sm font-semibold text-ink transition-colors active:bg-cream-deep"
            >
              <Mail className="size-4" /> E-mail
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
