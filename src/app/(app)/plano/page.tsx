"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, RotateCcw, ExternalLink, Trash2, Check } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { storeLabel, canShowExternalPurchase } from "@/lib/platform";

function planNome(plan: string) {
  if (plan === "annual") return "Anual";
  if (plan === "monthly") return "Mensal";
  if (plan === "trial") return "Período de teste";
  return "Gratuito";
}

export default function Plano() {
  const router = useRouter();
  const subscription = useAppStore((s) => s.data.subscription);
  const restorePurchases = useAppStore((s) => s.restorePurchases);
  const deleteAccount = useAppStore((s) => s.deleteAccount);

  const [restoring, setRestoring] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function restaurar() {
    setRestoring(true);
    await restorePurchases();
    setRestoring(false);
  }

  async function excluir() {
    await deleteAccount();
    router.replace("/");
  }

  const renew = subscription.renewsAt
    ? new Date(subscription.renewsAt).toLocaleDateString("pt-BR")
    : null;

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
          Meu plano
        </h1>
      </header>

      {/* Status atual */}
      <Card elevation="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown
              className={subscription.isPremium ? "size-5 text-gold" : "size-5 text-ink-faint"}
            />
            <span className="font-display text-lg font-semibold text-ink">
              {planNome(subscription.plan)}
            </span>
          </div>
          <Badge tone={subscription.isPremium ? "sage" : "neutral"}>
            {subscription.isPremium ? "Ativo" : "Grátis"}
          </Badge>
        </div>
        {renew && (
          <p className="mt-2 text-sm text-ink-soft">
            Renova em {renew}
          </p>
        )}
        {!subscription.isPremium && (
          <Link href="/paywall" className="mt-4 block">
            <Button fullWidth size="lg">
              Assinar o programa completo
            </Button>
          </Link>
        )}
      </Card>

      {/* Upgrade anual (ancoragem) */}
      {subscription.isPremium && subscription.plan === "monthly" && (
        <Link href="/paywall" className="block">
          <div className="rounded-2xl bg-gradient-to-br from-sage-deep to-sage-dark p-5 text-white shadow-[var(--shadow-sage)] active:scale-[0.99]">
            <p className="font-semibold">Economize com o Anual</p>
            <p className="mt-1 text-sm text-white/85">
              Mude para o plano anual e pague bem menos por mês.
            </p>
          </div>
        </Link>
      )}

      {/* Gerenciar / cancelar (transparente) */}
      {subscription.isPremium && (
        <Card elevation="soft">
          <p className="font-semibold tracking-tight text-ink">
            Cancelamento fácil e transparente
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Você pode cancelar quando quiser e continua com acesso até o fim do
            período já pago. Sem pegadinha.
          </p>
          {canShowExternalPurchase() ? (
            <a
              href={subscription.managementUrl ?? "#"}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sage-deep"
            >
              Gerenciar assinatura <ExternalLink className="size-4" />
            </a>
          ) : (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft">
              Gerencie ou cancele em Ajustes › sua conta › Assinaturas na{" "}
              {storeLabel()}.
            </p>
          )}
        </Card>
      )}

      {/* Restaurar */}
      <button
        onClick={restaurar}
        disabled={restoring}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3 text-sm font-semibold text-ink transition-colors active:bg-cream-deep disabled:opacity-50"
      >
        <RotateCcw className="size-4" />
        {restoring ? "Restaurando…" : "Restaurar compra"}
      </button>

      <div className="pt-2 text-center text-xs text-ink-faint">
        <Link href="/termos" className="underline">
          Termos
        </Link>{" "}
        ·{" "}
        <Link href="/privacidade" className="underline">
          Privacidade
        </Link>
      </div>

      {/* Exclusão de conta (exigência da App Store) */}
      <div className="pt-4">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-danger"
          >
            <Trash2 className="size-4" /> Excluir minha conta
          </button>
        ) : (
          <Card elevation="soft" className="border border-danger/30">
            <p className="font-semibold text-ink">Excluir sua conta?</p>
            <p className="mt-1 text-sm text-ink-soft">
              Isso apaga seus dados deste aparelho. Não dá pra desfazer.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </Button>
              <Button variant="danger" fullWidth onClick={excluir}>
                <Check className="size-4" /> Confirmar
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
