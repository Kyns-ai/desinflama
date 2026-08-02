"use client";

/**
 * Os primeiros cinco minutos.
 *
 * É aqui que a cliente decide se comprou bem ou se foi enganada. A sequência
 * segue o que Noom, Headway e Liven fazem (docs/TELAS-REFERENCIA.md): cada
 * passo devolve um número que se move na frente dela ou um artefato com o nome
 * dela, e o esforço mínimo do dia a dia é declarado na mesma tela do parabéns.
 *
 *   1. o mapa dela, com nome        (reconhecimento)
 *   2. como a nutri vai falar       (ela escolhe, vira "minha" nutri)
 *   3. a foto do prato analisada    (A VITÓRIA — ninguém no nicho entrega isso)
 *   4. placar + instalar no celular (o número sobe, o app vira app)
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Camera, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { AnaliseRefeicao } from "@/components/AnaliseRefeicao";
import { InstalarApp } from "@/components/InstalarApp";
import { useAppStore } from "@/store/useAppStore";
import { BLOAT_PROFILES } from "@/content/onboarding";
import { ESTILOS_NUTRI, nutriApi, type EstiloNutri } from "@/lib/nutriApi";
import { cn } from "@/lib/cn";

type Etapa = "mapa" | "estilo" | "foto" | "placar";

const TOTAL_DIAS = 21;

export default function BemVindaPage() {
  const router = useRouter();
  const data = useAppStore((s) => s.data);
  const update = useAppStore((s) => s.update);

  const [etapa, setEtapa] = useState<Etapa>("mapa");
  const [estilo, setEstilo] = useState<EstiloNutri>("gentil");
  const [analiseFeita, setAnaliseFeita] = useState(false);

  const primeiroNome = (data.user?.name ?? "").split(" ")[0] ?? "";
  const tipo = data.user?.onboarding?.bloatType;
  const perfil = tipo ? BLOAT_PROFILES[tipo] : null;

  useEffect(() => {
    void nutriApi.estilo().then(setEstilo);
  }, []);

  const escolherEstilo = useCallback(async (id: EstiloNutri) => {
    setEstilo(id);
    await nutriApi.guardarEstilo(id);
    setEtapa("foto");
  }, []);

  const concluirAnalise = useCallback(async () => {
    setAnaliseFeita(true);
    await update((d) => {
      d.seeds += 1;
      d.flags.primeiraAnalise = true;
    });
    // deixa ela ler o resultado antes de puxar para o placar
    setTimeout(() => setEtapa("placar"), 2600);
  }, [update]);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-cream px-5 pt-safe pb-10">
      <ProgressoEtapas etapa={etapa} />

      <AnimatePresence mode="wait">
        {/* ----------------------------- 1. o mapa ---------------------------- */}
        {etapa === "mapa" && (
          <Passo key="mapa">
            <p className="text-sm font-medium uppercase tracking-wide text-sage-dark">
              Seu Mapa de Inchaço
            </p>
            <h1 className="mt-2 font-display text-[32px] leading-tight text-ink">
              {primeiroNome ? `${primeiroNome}, ` : ""}
              {perfil ? perfil.name.toLowerCase() : "seu mapa está pronto"}
            </h1>
            {perfil && (
              <>
                <p className="mt-3 font-display text-lg text-coral-deep">
                  {perfil.tagline}
                </p>
                <div className="mt-6 rounded-3xl border border-line bg-surface px-5 py-5 shadow-card">
                  <p className="text-[15px] leading-relaxed text-ink">{perfil.cause}</p>
                  <div className="mt-4 border-t border-line-soft pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      O que vamos fazer
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink">
                      {perfil.plan}
                    </p>
                  </div>
                </div>
              </>
            )}
            <Button className="mt-8 w-full" onClick={() => setEtapa("estilo")}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Passo>
        )}

        {/* --------------------------- 2. o estilo ---------------------------- */}
        {etapa === "estilo" && (
          <Passo key="estilo">
            <h1 className="font-display text-[30px] leading-tight text-ink">
              Como você quer que eu fale com você?
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">
              Dá para mudar depois, quando quiser.
            </p>

            <div className="mt-6 space-y-3">
              {ESTILOS_NUTRI.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => void escolherEstilo(op.id)}
                  className={cn(
                    "w-full rounded-3xl border bg-surface px-5 py-4 text-left transition active:scale-[0.99]",
                    estilo === op.id ? "border-sage shadow-sage" : "border-line shadow-card",
                  )}
                >
                  <span className="font-display text-lg text-ink">{op.titulo}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{op.descricao}</span>
                </button>
              ))}
            </div>
          </Passo>
        )}

        {/* ---------------------------- 3. a foto ----------------------------- */}
        {etapa === "foto" && (
          <Passo key="foto">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-sage-dark">
              <Sparkles className="h-4 w-4" />
              Agora o melhor
            </div>
            <h1 className="mt-2 font-display text-[30px] leading-tight text-ink">
              O que você vai comer agora?
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Tira uma foto e eu te digo, na hora, o que nesse prato mexe com o seu
              tipo de inchaço — e o que dá pra trocar hoje.
            </p>

            <div className="mt-6">
              <AnaliseRefeicao
                contexto={{
                  tipoInchaco: tipo,
                  diaDoPrograma: data.progress?.currentDay ?? 1,
                  fase: data.progress?.phase,
                  estilo,
                  modoGentil: data.flags.gentleMode === true,
                }}
                aoConcluir={() => void concluirAnalise()}
                chamada="Fotografar minha refeição"
              />
            </div>

            {!analiseFeita && (
              <button
                type="button"
                onClick={() => setEtapa("placar")}
                className="mt-6 w-full text-center text-sm text-ink-faint underline underline-offset-4"
              >
                Agora não estou comendo — faço depois
              </button>
            )}
          </Passo>
        )}

        {/* --------------------------- 4. o placar ---------------------------- */}
        {etapa === "placar" && (
          <Passo key="placar">
            <h1 className="font-display text-[30px] leading-tight text-ink">
              {analiseFeita ? "Seu primeiro dia já começou." : "Tudo pronto pra começar."}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">
              Um check-in por dia já basta. É isso que faz a diferença.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Numero rotulo="dia" de={0} para={1} sufixo={`/${TOTAL_DIAS}`} />
              <Numero rotulo="análises" de={0} para={analiseFeita ? 1 : 0} />
              <Numero rotulo="sementes" de={0} para={data.seeds} />
            </div>

            <div className="mt-6">
              <InstalarApp />
            </div>

            <Button className="mt-6 w-full" onClick={() => router.replace("/inicio")}>
              Ver meu dia de hoje
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Passo>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------------- */

function Passo({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="pb-8"
    >
      {children}
    </motion.div>
  );
}

function ProgressoEtapas({ etapa }: { etapa: Etapa }) {
  const ordem: Etapa[] = ["mapa", "estilo", "foto", "placar"];
  const atual = ordem.indexOf(etapa);
  return (
    <div className="flex gap-1.5 py-5" aria-hidden>
      {ordem.map((e, i) => (
        <span
          key={e}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i <= atual ? "bg-sage" : "bg-line",
          )}
        />
      ))}
    </div>
  );
}

/** Número que sobe na frente dela — o padrão do Headway. */
function Numero({
  rotulo,
  de,
  para,
  sufixo = "",
}: {
  rotulo: string;
  de: number;
  para: number;
  sufixo?: string;
}) {
  const [valor, setValor] = useState(de);

  useEffect(() => {
    if (para === de) return;
    const passos = Math.max(1, Math.abs(para - de));
    const intervalo = Math.min(320, 900 / passos);
    let atual = de;
    const timer = setInterval(() => {
      atual += para > de ? 1 : -1;
      setValor(atual);
      if (atual === para) clearInterval(timer);
    }, intervalo);
    return () => clearInterval(timer);
  }, [de, para]);

  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-4 text-center shadow-card">
      <p className="font-display text-[26px] leading-none text-ink">
        {valor}
        <span className="text-base text-ink-faint">{sufixo}</span>
      </p>
      <p className="mt-1.5 text-xs text-ink-faint">{rotulo}</p>
      {para > de && (
        <span className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-sage-deep">
          <Check className="h-3 w-3" />+{para - de}
        </span>
      )}
    </div>
  );
}

/** Ícone usado quando a análise ainda não aconteceu (evita caixa vazia). */
export function IconeCamera() {
  return <Camera className="h-5 w-5 text-sage-deep" />;
}
