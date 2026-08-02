"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

/**
 * Gating das abas (a hidratação do store é global, via StoreHydrator):
 *  - sem usuário → /auth
 *  - sem onboarding → /onboarding
 * Segura a UI com um splash da marca enquanto resolve.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ready = useAppStore((s) => s.ready);
  const user = useAppStore((s) => s.user);
  const onboarding = useAppStore((s) => s.data.user?.onboarding ?? null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/auth");
    } else if (!onboarding) {
      router.replace("/onboarding");
    }
  }, [ready, user, onboarding, router]);

  if (!ready || !user || !onboarding) return <BootSplash />;
  return <>{children}</>;
}

function BootSplash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon.svg"
          alt="Desinflama"
          className="size-16 rounded-[1.1rem] shadow-[var(--shadow-soft)] [animation:var(--animate-pop)]"
        />
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-cream-deep">
          <div className="h-full w-1/3 rounded-full bg-rose [animation:var(--animate-shimmer)]" />
        </div>
      </div>
    </div>
  );
}
