"use client";

import { Capacitor } from "@capacitor/core";

export function platform(): "ios" | "android" | "web" {
  const p = Capacitor.getPlatform();
  return p === "ios" || p === "android" ? p : "web";
}

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Anti-steering: por padrão NÃO mostramos link de compra externa (site) dentro
 * do app nativo fora de EUA/UE. Ativável por storefront depois. No web, a compra
 * acontece no próprio checkout web — não é "externa".
 */
export const EXTERNAL_PURCHASE_ENABLED = false;

export function canShowExternalPurchase(): boolean {
  return platform() === "web" || EXTERNAL_PURCHASE_ENABLED;
}

/** Rótulo da loja para textos de gerência de assinatura. */
export function storeLabel(): string {
  if (platform() === "ios") return "App Store";
  if (platform() === "android") return "Google Play";
  return "site";
}
