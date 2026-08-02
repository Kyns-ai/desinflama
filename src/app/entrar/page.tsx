"use client";

/**
 * A porta de entrada de quem comprou no funil.
 *
 * A pessoa clica no botão da página de obrigado e cai aqui com um código na
 * URL: /entrar?c=XYWJQTEJ. Em segundos, sem digitar nada, ela está dentro com
 * o acesso liberado e o perfil já montado com o que ela respondeu no funil.
 *
 * Esta tela é a primeira impressão do produto pago. Ela não pede nada.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, ShieldAlert } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { nutriApi, type ClienteDoFunil } from "@/lib/nutriApi";
import { registrarAcessoDoFunil } from "@/services/AcessoFunilSubscription";
import type { BloatType, Goal, OnboardingData, SymptomKey } from "@/types/domain";

type Etapa = "validando" | "pedirCodigo" | "entrando" | "erro";

function codigoDaUrl(): string {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams(window.location.search);
  return (p.get("c") ?? p.get("codigo") ?? "").trim().toUpperCase();
}

/** A senha nunca é mostrada: o link do funil é a credencial dela. */
function senhaDoCodigo(codigo: string): string {
  return `df-${codigo.toLowerCase()}-acesso`;
}

const TIPOS_VALIDOS: BloatType[] = ["fermentacao", "retencao", "lentidao", "estresse"];
const OBJETIVOS_VALIDOS: Goal[] = ["desinchar", "energia", "pele", "digestao", "rotina"];
const SINTOMAS_VALIDOS: SymptomKey[] = ["inchaco", "gases", "intestino", "energia", "pele"];

/** Converte o que veio do funil no formato do app, descartando o que não bate. */
function onboardingDoFunil(cliente: ClienteDoFunil): OnboardingData | null {
  const r = cliente.respostas ?? {};
  const tipo = TIPOS_VALIDOS.find((t) => t === r.bloatType);
  if (!tipo) return null; // sem o tipo de inchaço não dá para montar o mapa

  const sintomas = (r.symptoms ?? []).filter((s): s is SymptomKey =>
    SINTOMAS_VALIDOS.includes(s as SymptomKey),
  );
  const objetivo = OBJETIVOS_VALIDOS.find((g) => g === r.goal) ?? "desinchar";
  const horario = (["manha", "tarde", "noite", "refeicoes"] as const).find(
    (h) => h === r.worstTime,
  );

  return {
    bloatType: tipo,
    symptoms: sintomas.length ? sintomas : ["inchaco"],
    goal: objetivo,
    ...(horario ? { worstTime: horario } : {}),
  };
}

/** Decide a primeira tela sem precisar de efeito (mesmo padrão de /auth). */
function etapaInicial(): Etapa {
  if (typeof window === "undefined") return "validando";
  if (!nutriApi.configurada()) return "erro";
  return codigoDaUrl() ? "validando" : "pedirCodigo";
}

export default function EntrarPage() {
  const router = useRouter();
  const signUp = useAppStore((s) => s.signUp);
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const setCycleStart = useAppStore((s) => s.setCycleStart);
  const startJourney = useAppStore((s) => s.startJourney);
  const update = useAppStore((s) => s.update);
  const refreshSubscription = useAppStore((s) => s.refreshSubscription);

  const [etapa, setEtapa] = useState<Etapa>(etapaInicial);
  const [erro, setErro] = useState<string | null>(() =>
    typeof window !== "undefined" && !nutriApi.configurada()
      ? "O app ainda não está conectado ao servidor de acesso. Avise o suporte."
      : null,
  );
  const [digitado, setDigitado] = useState("");
  const [nome, setNome] = useState("");
  const jaRodou = useRef(false);

  const entrar = useCallback(
    // Quem chama já colocou a tela em "validando" — aqui só acontece a rede.
    async (codigo: string) => {
      try {
        const cliente = await nutriApi.validarCodigo(codigo);
        setNome(cliente.nome);
        setEtapa("entrando");

        // 1. Sessão — sem tela de cadastro. O link já provou quem ela é.
        await signUp(
          cliente.email,
          senhaDoCodigo(codigo),
          cliente.nome || "",
        );

        // 2. Assinatura liberada (ela pagou no funil, não no app). Fica fora do
        //    AppData de propósito: o AppData é recarregado a cada login.
        await registrarAcessoDoFunil({
          plano: cliente.plano === "monthly" ? "monthly" : "annual",
          email: cliente.email,
          liberadoEm: new Date().toISOString(),
        });
        await refreshSubscription();
        await update((d) => {
          d.flags.veioDoFunil = true;
        });

        // 3. O que o funil já perguntou não se pergunta de novo.
        const onboarding = onboardingDoFunil(cliente);
        if (onboarding) {
          await setOnboarding(onboarding);
          if (cliente.respostas?.cycleStart) {
            await setCycleStart(cliente.respostas.cycleStart);
          }
          await startJourney("main14");
          router.replace("/bem-vinda");
          return;
        }

        // Funil sem as respostas: cai no onboarding curto do app.
        router.replace("/onboarding");
      } catch (e) {
        setErro(
          e instanceof Error && e.message.includes("não encontrado")
            ? "Esse código não foi encontrado. Confira se copiou certo."
            : "Não consegui liberar seu acesso agora. Tenta de novo em instantes.",
        );
        setEtapa("erro");
      }
    },
    [router, setCycleStart, setOnboarding, signUp, startJourney, update],
  );

  // Só dispara a chamada de rede; qual tela mostrar já foi decidido acima.
  useEffect(() => {
    if (jaRodou.current) return;
    jaRodou.current = true;
    if (!nutriApi.configurada()) return;
    const codigo = codigoDaUrl();
    // Buscar do servidor ao montar é o caso legítimo de efeito: todo setState
    // dentro de `entrar` acontece depois do await da rede, nunca no corpo
    // síncrono — a regra só não consegue enxergar isso através do useCallback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (codigo) void entrar(codigo);
  }, [entrar]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center bg-cream px-6 pt-safe pb-safe">
      {(etapa === "validando" || etapa === "entrando") && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-tint">
            <Loader2 className="h-7 w-7 animate-spin text-sage-deep" />
          </div>
          <p className="mt-6 font-display text-2xl text-ink">
            {etapa === "entrando" && nome
              ? `Tudo certo, ${nome}.`
              : "Liberando seu acesso…"}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {etapa === "entrando"
              ? "Montando o seu programa com o que você já me contou."
              : "Só um instante."}
          </p>
        </motion.div>
      )}

      {etapa === "pedirCodigo" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl text-ink">Seu código de acesso</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Ele está na página que abriu depois da sua compra e no e-mail que você
            recebeu.
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const limpo = digitado.trim().toUpperCase();
              if (limpo.length < 4) return;
              setEtapa("validando");
              setErro(null);
              void entrar(limpo);
            }}
          >
            <Input
              value={digitado}
              onChange={(e) => setDigitado(e.target.value.toUpperCase())}
              placeholder="XYWJQTEJ"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="text-center font-mono text-lg tracking-[0.3em]"
              aria-label="Código de acesso"
            />
            <Button type="submit" className="w-full" disabled={digitado.trim().length < 4}>
              Entrar
            </Button>
          </form>
        </motion.div>
      )}

      {etapa === "erro" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-tint">
            <ShieldAlert className="h-6 w-6 text-danger" />
          </div>
          <h1 className="mt-5 font-display text-2xl text-ink">Não deu certo</h1>
          <p className="mt-2 text-sm text-ink-soft">{erro}</p>
          <div className="mt-8 space-y-3">
            <Button className="w-full" onClick={() => setEtapa("pedirCodigo")}>
              Digitar o código
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.replace("/ajuda")}
            >
              Falar com o suporte
            </Button>
          </div>
        </motion.div>
      )}

      <p className="mt-10 flex items-center justify-center gap-2 text-xs text-ink-faint">
        <Check className="h-3.5 w-3.5" />
        Seu acesso fica salvo neste aparelho
      </p>
    </div>
  );
}
