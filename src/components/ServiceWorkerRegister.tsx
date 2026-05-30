"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Registra o service worker apenas no alvo WEB (PWA). No app nativo (Capacitor)
 * o SW é ignorado — a persistência offline vem da camada Repository.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registro do SW é best-effort */
      });
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
