"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Dispara o bootstrap do store uma única vez, no nível mais alto da árvore,
 * para que qualquer rota (welcome, /auth, /onboarding, abas) já encontre a
 * sessão e os dados hidratados — inclusive após refresh. Não renderiza nada.
 */
export function StoreHydrator() {
  const bootstrap = useAppStore((s) => s.bootstrap);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    bootstrap();
  }, [bootstrap]);

  return null;
}
