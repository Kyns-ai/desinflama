"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login } from "./actions";
import { DEMO_PASSWORD } from "@/lib/constants";

export function LoginForm({ demo }: { demo: boolean }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form
      action={action}
      className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
    >
      <h1 className="font-display text-lg font-semibold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-ink-soft">Acesso restrito à equipe.</p>

      <label className="mt-5 block text-sm font-medium text-ink-soft" htmlFor="pw">
        Senha
      </label>
      <div className="relative mt-1.5">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint" />
        <input
          id="pw"
          name="password"
          type="password"
          autoFocus
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30"
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 h-11 w-full rounded-xl bg-rose font-semibold text-white transition-colors hover:bg-rose-deep disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>

      {/* A dica só aparece quando a senha de demonstração DE FATO funciona —
          ou seja, fora de produção. Antes bastava não ter Supabase, o que
          significa que um deploy em modo mock imprimiria a senha do painel
          numa página pública. */}
      {demo && (
        <p className="mt-4 rounded-lg bg-gold-tint px-3 py-2 text-xs text-gold-dark">
          Modo demonstração (sem Supabase). Senha: <strong>{DEMO_PASSWORD}</strong>
        </p>
      )}
    </form>
  );
}
