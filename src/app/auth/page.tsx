"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User as UserIcon } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import type { OAuthProvider } from "@/services/AuthService";

type Mode = "login" | "signup";

function initialMode(): Mode {
  if (typeof window === "undefined") return "signup";
  return new URLSearchParams(window.location.search).get("mode") === "login"
    ? "login"
    : "signup";
}

export default function AuthPage() {
  const router = useRouter();
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const signInWithProvider = useAppStore((s) => s.signInWithProvider);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function routeAfterAuth() {
    const onboarding = useAppStore.getState().data.user?.onboarding;
    router.replace(onboarding ? "/inicio" : "/onboarding");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 4) {
      setError("A senha precisa ter ao menos 4 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") await signUp(email, password, name);
      else await signIn(email, password);
      routeAfterAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
      setLoading(false);
    }
  }

  async function social(provider: OAuthProvider) {
    setError(null);
    setLoading(true);
    try {
      await signInWithProvider(provider);
      routeAfterAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream px-6 pt-safe pb-safe">
      <div className="flex items-center pt-4">
        <Link
          href="/"
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col justify-center py-6"
      >
        <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink">
          {mode === "signup" ? "Crie sua conta" : "Bem-vinda de volta"}
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">
          {mode === "signup"
            ? "Leva 20 segundos. Seu progresso fica salvo em qualquer aparelho."
            : "Entre para continuar seu desafio de onde parou."}
        </p>

        <div className="mt-7 space-y-3">
          <SocialButton provider="google" onClick={() => social("google")} disabled={loading} />
          <SocialButton provider="apple" onClick={() => social("apple")} disabled={loading} />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs font-medium text-ink-faint">
          <span className="h-px flex-1 bg-line" /> ou com e-mail{" "}
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <Input
              label="Seu nome"
              placeholder="Como podemos te chamar?"
              icon={<UserIcon className="size-4.5" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          <Input
            label="E-mail"
            type="email"
            inputMode="email"
            placeholder="voce@email.com"
            icon={<Mail className="size-4.5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="size-4.5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {error && (
            <p className="rounded-xl bg-danger-tint px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {mode === "signup" ? "Criar conta" : "Entrar"}
          </Button>
        </form>
      </motion.div>

      <div className="pb-6 text-center text-[15px] text-ink-soft">
        {mode === "signup" ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setError(null);
          }}
          className="font-semibold text-sage-deep"
        >
          {mode === "signup" ? "Entrar" : "Criar conta"}
        </button>
      </div>
    </div>
  );
}

function SocialButton({
  provider,
  onClick,
  disabled,
}: {
  provider: OAuthProvider;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface text-[15px] font-semibold text-ink transition-all active:scale-[0.98] disabled:opacity-50"
    >
      {provider === "google" ? <GoogleGlyph /> : <AppleGlyph />}
      Continuar com {provider === "google" ? "Google" : "Apple"}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 12.78c.02 2.5 2.2 3.33 2.22 3.34-.02.06-.35 1.2-1.16 2.37-.7 1.02-1.42 2.03-2.57 2.05-1.12.02-1.48-.66-2.77-.66-1.28 0-1.68.64-2.74.68-1.1.04-1.95-1.1-2.66-2.12-1.44-2.08-2.55-5.88-1.06-8.45a4.13 4.13 0 0 1 3.48-2.12c1.08-.02 2.1.73 2.77.73.66 0 1.9-.9 3.21-.77.55.02 2.08.22 3.07 1.67-.08.05-1.83 1.07-1.81 3.07M14.3 4.6c.59-.72.99-1.7.88-2.69-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.64-.9 2.6.95.08 1.92-.48 2.51-1.19" />
    </svg>
  );
}
