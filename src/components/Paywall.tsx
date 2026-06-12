"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Crown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { subscriptionService } from "@/services";
import { OFFERINGS, type SubPackage } from "@/services/SubscriptionService";
import { storeLabel } from "@/lib/platform";
import { cn } from "@/lib/cn";

const BENEFITS = [
  "Programa completo de 14 dias + Reset de 21",
  "Seu Mapa de Inchaço personalizado",
  "Índice Intestinal e gráficos de progresso",
  "Biblioteca da nutri: aulas, receitas e trocas",
  "Desafios mensais e Modo Manutenção",
  "Cancele quando quiser, sem burocracia",
];

export function Paywall({
  onClose,
  onPurchased,
  reason,
}: {
  onClose?: () => void;
  onPurchased?: () => void;
  reason?: string;
}) {
  const purchase = useAppStore((s) => s.purchase);
  const restorePurchases = useAppStore((s) => s.restorePurchases);

  const [offers, setOffers] = useState<SubPackage[]>(OFFERINGS);
  const [selected, setSelected] = useState<SubPackage["id"]>("annual");
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subscriptionService.getOfferings().then(setOffers).catch(() => {});
  }, []);

  async function comprar() {
    setBusy(true);
    setError(null);
    try {
      await purchase(selected);
      onPurchased?.();
    } catch {
      setError("Não foi possível concluir. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function restaurar() {
    setRestoring(true);
    setError(null);
    try {
      await restorePurchases();
      const isPremium = useAppStore.getState().data.subscription.isPremium;
      if (isPremium) onPurchased?.();
      else setError("Nenhuma assinatura encontrada para restaurar.");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md bg-cream px-6 pt-safe pb-8">
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-surface text-ink-soft shadow-[var(--shadow-soft)]"
        >
          <X className="size-5" />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-10"
      >
        <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-sage-deep to-sage-dark text-white shadow-[var(--shadow-sage)]">
          <Crown className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink">
          Sua assinatura Desinflama
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          {reason ??
            "Continue o desafio completo e descubra exatamente o que te incha."}
        </p>
      </motion.div>

      <ul className="mt-6 space-y-2.5">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sage text-white">
              <Check className="size-3" strokeWidth={3.5} />
            </span>
            <span className="text-[15px] text-ink">{b}</span>
          </li>
        ))}
      </ul>

      {/* Planos — anual ancorado */}
      <div className="mt-7 space-y-3">
        {offers.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                active ? "border-sage bg-sage-tint/40" : "border-line bg-surface"
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2",
                  active ? "border-sage bg-sage text-white" : "border-line"
                )}
              >
                {active && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight text-ink">
                    {o.title}
                  </span>
                  {o.badge && (
                    <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {o.badge}
                    </span>
                  )}
                </div>
                <span className="text-sm text-ink-soft">{o.priceLabel}</span>
              </div>
              <span className="text-right">
                <span className="block font-display text-lg font-semibold text-ink">
                  {o.pricePerMonthLabel.split("/")[0]}
                </span>
                <span className="text-xs text-ink-faint">/mês</span>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-danger-tint px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button
        fullWidth
        size="lg"
        className="mt-5"
        loading={busy}
        onClick={comprar}
      >
        Começar agora
      </Button>

      <button
        onClick={restaurar}
        disabled={restoring}
        className="mt-3 w-full text-center text-sm font-medium text-sage-deep disabled:opacity-50"
      >
        {restoring ? "Restaurando…" : "Restaurar compra"}
      </button>

      {/* Disclosures de assinatura */}
      <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
        Assinatura com renovação automática. Cancele quando quiser na{" "}
        {storeLabel()}.{" "}
        <Link href="/termos" className="underline">
          Termos
        </Link>{" "}
        ·{" "}
        <Link href="/privacidade" className="underline">
          Privacidade
        </Link>
      </p>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-faint">
        <ShieldCheck className="size-3.5" /> Pagamento seguro
      </p>
    </div>
  );
}
