"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UserCheck, Check, Sparkles, Clipboard, MessageCircle } from "lucide-react";
import { Card, Button, IconCircle } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";

const ENTREGAS = [
  {
    icon: Clipboard,
    title: "Plano sob medida pra você",
    desc: "A nutri analisa seus registros e monta um protocolo individual.",
  },
  {
    icon: MessageCircle,
    title: "Acompanhamento de perto",
    desc: "Ajustes ao longo do caminho, com alguém olhando seu caso.",
  },
  {
    icon: Sparkles,
    title: "Casos que o app sozinho não resolve",
    desc: "Quando o padrão trava, um olhar profissional destrava.",
  },
];

export default function Acompanhamento() {
  const router = useRouter();
  const update = useAppStore((s) => s.update);
  const [enviado, setEnviado] = useState(false);

  async function quero() {
    await update((d) => {
      d.flags.acompanhamento_interesse = true;
    });
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex min-h-[72vh] flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid size-20 place-items-center rounded-full bg-rose text-white shadow-[var(--shadow-rose)]"
        >
          <Check className="size-10" strokeWidth={3} />
        </motion.div>
        <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
 Recebemos seu interesse
        </h2>
        <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-soft">
          A nutri vai entrar em contato com as opções de acompanhamento
          individual. Enquanto isso, siga firme no seu programa.
        </p>
        <Button variant="secondary" className="mt-8" onClick={() => router.push("/inicio")}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 pt-5">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
      </header>

      <div>
        <div className="grid size-14 place-items-center rounded-2xl bg-gold-tint text-gold-dark">
          <UserCheck className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink">
          Que tal um olhar individual?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Seu padrão indica que vale uma avaliação individual com a nutri. Não
          substitui o programa — potencializa.
        </p>
      </div>

      <div className="space-y-3">
        {ENTREGAS.map((e) => (
          <Card key={e.title} elevation="soft" className="flex items-start gap-3.5">
            <IconCircle icon={e.icon} tone="gold" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold tracking-tight text-ink">{e.title}</h3>
              <p className="mt-0.5 text-sm leading-snug text-ink-soft">{e.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card elevation="soft" className="bg-rose-tint/40 text-center">
        <p className="font-display text-lg font-semibold leading-snug text-rose-dark">
          Quando o padrão trava sozinho, um olhar profissional costuma
          destravar
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          com um plano feito pro SEU caso, a partir dos seus registros
        </p>
      </Card>

      <Button fullWidth size="lg" onClick={quero}>
        Quero saber mais
      </Button>
    </div>
  );
}
