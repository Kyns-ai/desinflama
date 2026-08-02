"use client";

/**
 * O contexto que vai junto de cada pergunta para a Nutri IA.
 *
 * Sem isso a IA responde como um chatbot genérico de internet ("consulte um
 * profissional"). Com isso ela responde como a nutri DELA: sabe o tipo de
 * inchaço, em que dia do programa está, o que ela já descobriu que tolera e
 * o que ela escreveu nos últimos check-ins.
 */

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { phaseForDay } from "@/lib/journey";
import { groupDef } from "@/content/tolerance";
import { nutriApi, type ContextoNutri, type EstiloNutri } from "@/lib/nutriApi";

/** Estilo escolhido pela cliente (fica no aparelho, não no estado global). */
export function useEstiloNutri() {
  const [estilo, setEstilo] = useState<EstiloNutri | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const guardado = await nutriApi.estiloEscolhido();
      if (vivo) {
        setEstilo(guardado);
        setCarregando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  async function escolher(novo: EstiloNutri) {
    await nutriApi.guardarEstilo(novo);
    setEstilo(novo);
  }

  return { estilo, escolher, carregando };
}

/** Monta o contexto a partir do que o app já sabe sobre ela. */
export function useContextoNutri(estilo: EstiloNutri | null): ContextoNutri {
  const data = useAppStore((s) => s.data);

  return useMemo(() => {
    const dia = data.progress?.currentDay ?? 1;
    const desafio = data.progress?.challengeType ?? "main14";

    // reação 0–1 = tolerou / moderou; 2–3 = reagiu. É o Mapa de Tolerância dela.
    const toleraBem = data.tolerance
      .filter((t) => t.reaction <= 1)
      .map((t) => groupDef(t.group).nome);
    const naoTolera = data.tolerance
      .filter((t) => t.reaction >= 2)
      .map((t) => groupDef(t.group).nome);

    // últimos 3 check-ins em uma linha cada: sintoma forte + o que comeu
    const ultimosRegistros = [...data.logs]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map((log) => {
        const sintomas = Object.entries(log.symptoms)
          .filter(([, v]) => typeof v === "number" && v >= 3)
          .map(([k]) => k)
          .join(", ");
        const refeicoes = log.meals
          .map((m) => m.descricao)
          .filter(Boolean)
          .join("; ");
        return [
          log.date,
          sintomas && `sintomas altos: ${sintomas}`,
          refeicoes && `comeu: ${refeicoes}`,
          log.notes,
        ]
          .filter(Boolean)
          .join(" · ");
      });

    return {
      tipoInchaco: data.user?.onboarding?.bloatType,
      diaDoPrograma: dia,
      fase: phaseForDay(dia, desafio).phase,
      estilo: estilo ?? undefined,
      toleraBem: toleraBem.length ? toleraBem : undefined,
      naoTolera: naoTolera.length ? naoTolera : undefined,
      ultimosRegistros: ultimosRegistros.length ? ultimosRegistros : undefined,
      modoGentil: data.flags.modoGentil || undefined,
    };
  }, [data, estilo]);
}
