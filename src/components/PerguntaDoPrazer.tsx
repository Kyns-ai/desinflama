"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { REACTIONS } from "@/content/tolerance";
import { REINTRO_GROUPS } from "@/content/tolerance";
import { todayKey } from "@/lib/date";
import { haptic } from "@/lib/haptics";
import type { ReactionLevel } from "@/types/domain";
import { cn } from "@/lib/cn";

/**
 * "Como o corpo reagiu?" — a pergunta do dia seguinte ao resgate.
 *
 * Existe porque a tela de Prazeres PROMETE isso em voz alta ("Amanhã eu te
 * pergunto como o seu corpo reagiu") e, até aqui, nada perguntava. App que
 * promete e não cumpre é pior do que app que não promete: ela lembra.
 *
 * E não é só cortesia — é a peça que faz o prazer ENSINAR (Seção 5 do PLANO).
 * Quando o prazer tem grupo FODMAP, a resposta vira teste do Mapa de
 * Tolerância, e a Nota Desinflama de todos os pratos daquele grupo muda dali
 * pra frente.
 *
 * Regra de tom: aqui não se cobra e não se julga. Ela já comeu; perguntar de
 * um jeito que soe a "e aí, valeu a pena?" faz ela parar de registrar.
 */
export function PerguntaDoPrazer() {
  const resgates = useAppStore((s) => s.data.resgates);
  const registrar = useAppStore((s) => s.registrarReacaoDoPrazer);
  const [respondendo, setRespondendo] = useState(false);

  const hoje = todayKey();

  // O mais recente ainda sem resposta, de um dia que JÁ PASSOU: perguntar no
  // mesmo dia não faz sentido (o corpo ainda não respondeu).
  const pendente = [...resgates]
    .filter((r) => r.reacao === undefined && r.date < hoje)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!pendente) return null;

  const nomeGrupo = pendente.grupo
    ? REINTRO_GROUPS.find((g) => g.group === pendente.grupo)?.nome
    : null;

  async function responder(reacao: ReactionLevel) {
    setRespondendo(true);
    await registrar(pendente.id, reacao);
    void haptic("success");
    setRespondendo(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Card elevation="soft" className="border border-rose/25 bg-rose-tint/40">
        <p className="eyebrow">Sobre o seu prazer</p>
        {/* O nome do prazer vai numa linha PRÓPRIA, não dentro da frase.
            "reagiu ao {nome}" quebrava a concordância em metade do catálogo
            ("ao pizza de sexta", "ao taça de vinho") — e resolver isso com
            artigo por item seria carregar gênero em dado de produto. */}
        <h3 className="mt-1 font-display text-h3 font-semibold text-ink">
          Como seu corpo reagiu?
        </h3>
        <p className="mt-0.5 text-[15px] font-medium text-rose-dark">
          {pendente.nome}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {nomeGrupo
            ? `Sua resposta entra no seu Mapa de Tolerância como um teste de ${nomeGrupo.toLowerCase()} — é assim que o prazer também ensina.`
            : "Não é cobrança. É só pra você reparar no que o seu corpo diz."}
        </p>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          {REACTIONS.map((r) => (
            <button
              key={r.level}
              disabled={respondendo}
              onClick={() => void responder(r.level)}
              className={cn(
                "rounded-xl bg-surface px-3 py-2.5 text-sm font-semibold text-ink",
                "transition-transform active:scale-[0.97] disabled:opacity-50"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
