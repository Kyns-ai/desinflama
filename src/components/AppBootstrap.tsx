"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Hidrata o store (sessão + dados persistidos) uma vez ao montar e segura a UI
 * com um splash da marca até estar pronto. Vai no layout das abas.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const ready = useAppStore((s) => s.ready);
  const bootstrap = useAppStore((s) => s.bootstrap);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    bootstrap();
  }, [bootstrap]);

  if (!ready) return <BootSplash />;
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
          <div className="h-full w-1/3 rounded-full bg-sage [animation:var(--animate-shimmer)]" />
        </div>
      </div>
    </div>
  );
}
