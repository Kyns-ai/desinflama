"use client";

/**
 * Colocar o app na tela do celular, sem loja.
 *
 * Funciona diferente em cada aparelho:
 *  - Android/Chrome: o navegador avisa que dá para instalar (evento
 *    `beforeinstallprompt`). A gente guarda esse aviso e abre o instalador
 *    nativo com um toque.
 *  - iPhone/Safari: a Apple não deixa abrir instalador por botão. O jeito é
 *    ensinar o gesto: Compartilhar → Adicionar à Tela de Início.
 *  - Já instalado (ou app nativo): não mostra nada.
 *
 * Por que insistir nisso: no iPhone, notificação SÓ funciona depois de
 * instalado na tela inicial. Sem isso, o lembrete de água nunca chega nela.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowUpFromLine, Check, Download, Plus, Share } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

interface EventoDeInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Situacao = "carregando" | "instalado" | "podeInstalar" | "ensinarIOS" | "semSuporte";

function estaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone;
  return Boolean(standalone || iosStandalone);
}

function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || iPadOS;
}

function ehCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.(),
  );
}

/* Estado do aparelho é um sistema externo (navegador), não estado do React —
 * por isso é lido com useSyncExternalStore e não com useEffect + setState. */

function ouvirAmbiente(avisar: () => void): () => void {
  const mq = window.matchMedia?.("(display-mode: standalone)");
  mq?.addEventListener?.("change", avisar);
  window.addEventListener("appinstalled", avisar);
  return () => {
    mq?.removeEventListener?.("change", avisar);
    window.removeEventListener("appinstalled", avisar);
  };
}

/** Uma string estável por render — evita loop no useSyncExternalStore. */
function lerAmbiente(): string {
  return `${estaInstalado() ? 1 : 0}|${ehIOS() ? 1 : 0}|${ehCapacitor() ? 1 : 0}`;
}

/** No build estático não existe navegador: assume "nada detectado ainda". */
function ambienteNoServidor(): string {
  return "?";
}

function useAmbiente() {
  const bruto = useSyncExternalStore(ouvirAmbiente, lerAmbiente, ambienteNoServidor);
  if (bruto === "?") return { conhecido: false, instalado: false, ios: false, nativo: false };
  const [inst, ios, nativo] = bruto.split("|");
  return {
    conhecido: true,
    instalado: inst === "1",
    ios: ios === "1",
    nativo: nativo === "1",
  };
}

export interface InstalarAppProps {
  /** Texto que explica por que vale a pena instalar. */
  motivo?: string;
  /** Chamado quando a instalação é aceita ou a pessoa diz que já fez. */
  aoResolver?: () => void;
  className?: string;
  compacto?: boolean;
}

export function InstalarApp({
  motivo = "Assim os lembretes de água e de refeição chegam em você — e o app abre com um toque, sem navegador.",
  aoResolver,
  className,
  compacto = false,
}: InstalarAppProps) {
  const ambiente = useAmbiente();
  const [evento, setEvento] = useState<EventoDeInstalacao | null>(null);
  const [passoAPasso, setPassoAPasso] = useState(false);

  // O navegador avisa que dá para instalar — guardamos o aviso para usar no
  // nosso momento (logo depois da primeira vitória), não no dele.
  useEffect(() => {
    const capturar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoDeInstalacao);
    };
    window.addEventListener("beforeinstallprompt", capturar);
    return () => window.removeEventListener("beforeinstallprompt", capturar);
  }, []);

  const situacao: Situacao = !ambiente.conhecido
    ? "carregando"
    : ambiente.nativo || ambiente.instalado
      ? "instalado"
      : evento
        ? "podeInstalar"
        : ambiente.ios
          ? "ensinarIOS"
          : "semSuporte";

  const instalar = useCallback(async () => {
    if (!evento) return;
    await evento.prompt();
    const escolha = await evento.userChoice;
    if (escolha.outcome === "accepted") {
      // o evento `appinstalled` atualiza o ambiente sozinho
      setEvento(null);
      aoResolver?.();
    }
  }, [evento, aoResolver]);

  if (situacao === "carregando") return null;

  if (situacao === "instalado") {
    if (compacto) return null;
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-rose-tint px-4 py-3",
          className,
        )}
      >
        <Check className="h-5 w-5 shrink-0 text-rose-deep" />
        <p className="text-sm text-ink">
          O app já está na sua tela inicial. É só abrir por ele daqui pra frente.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-3xl border border-line bg-surface px-5 py-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream-deep">
          <Download className="h-5 w-5 text-rose-deep" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-tight text-ink">
            Bota o Desinflama na tela do seu celular
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{motivo}</p>
        </div>
      </div>

      {/* Android / Chrome: instalação em um toque */}
      {situacao === "podeInstalar" && (
        <Button className="mt-4 w-full" onClick={() => void instalar()}>
          Instalar agora
        </Button>
      )}

      {/* iPhone: a Apple exige o gesto manual */}
      {situacao === "ensinarIOS" && (
        <>
          {!passoAPasso ? (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setPassoAPasso(true)}
            >
              Como faço no iPhone
            </Button>
          ) : (
            <ol className="mt-4 space-y-3">
              <PassoIOS numero={1} icone={<Share className="h-4 w-4" />}>
                Toque no botão <strong className="font-semibold">Compartilhar</strong>, na
                barra de baixo do Safari (o quadrado com a seta para cima).
              </PassoIOS>
              <PassoIOS numero={2} icone={<Plus className="h-4 w-4" />}>
                Role a lista e escolha{" "}
                <strong className="font-semibold">Adicionar à Tela de Início</strong>.
              </PassoIOS>
              <PassoIOS numero={3} icone={<Check className="h-4 w-4" />}>
                Toque em <strong className="font-semibold">Adicionar</strong>, no canto
                superior direito. Pronto — o ícone aparece junto dos seus apps.
              </PassoIOS>
            </ol>
          )}
          {passoAPasso && (
            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => aoResolver?.()}
            >
              Já adicionei
            </Button>
          )}
        </>
      )}

      {/* Desktop ou navegador que não suporta: explica em vez de deixar buraco */}
      {situacao === "semSuporte" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-cream-deep px-4 py-3">
          <ArrowUpFromLine className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <p className="text-sm text-ink-soft">
            Abra este mesmo endereço no navegador do seu celular para instalar. No
            computador o app funciona, mas os lembretes não chegam.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function PassoIOS({
  numero,
  icone,
  children,
}: {
  numero: number;
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-deep text-xs font-semibold text-ink-soft">
        {numero}
      </span>
      <p className="flex-1 text-sm leading-relaxed text-ink">{children}</p>
      <span className="mt-0.5 shrink-0 text-ink-faint">{icone}</span>
    </li>
  );
}
