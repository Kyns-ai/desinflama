/**
 * Notificações locais agendadas (Capacitor). Nudges de retenção: manhã,
 * streak em risco (noite) e marcos (imediato). No web, degrada graciosamente
 * (sem agendamento robusto); no nativo, passa na Apple sem superfície APNs.
 */
import { Capacitor } from "@capacitor/core";

const IDS = { morning: 1001, streakRisk: 1002, milestone: 2000 };

async function plugin() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import("@capacitor/local-notifications");
    return mod.LocalNotifications;
  } catch {
    return null;
  }
}

export async function requestNotifPermission(): Promise<boolean> {
  const LN = await plugin();
  if (!LN) {
    // web: tenta a API de Notification do navegador (best-effort)
    if (typeof Notification !== "undefined") {
      try {
        const p = await Notification.requestPermission();
        return p === "granted";
      } catch {
        return false;
      }
    }
    return false;
  }
  const res = await LN.requestPermissions();
  return res.display === "granted";
}

export async function scheduleRetentionNudges(currentDay: number): Promise<void> {
  const LN = await plugin();
  if (!LN) return;
  try {
    await LN.schedule({
      notifications: [
        {
          id: IDS.morning,
          title: "Bom dia 🌱",
          body: `Seu Dia ${currentDay} te espera. Bora desinchar?`,
          schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true },
        },
        {
          id: IDS.streakRisk,
          title: "Não perca sua ofensiva 🔥",
          body: "Faltou seu registro de hoje? Leva 30 segundos.",
          schedule: { on: { hour: 20, minute: 30 }, allowWhileIdle: true },
        },
      ],
    });
  } catch {
    /* permissão negada ou indisponível */
  }
}

export async function fireMilestoneNotification(
  title: string,
  body: string
): Promise<void> {
  const LN = await plugin();
  if (!LN) return;
  try {
    await LN.schedule({
      notifications: [
        {
          id: IDS.milestone + Math.floor(Date.now() % 1000),
          title,
          body,
          schedule: { at: new Date(Date.now() + 1500) },
        },
      ],
    });
  } catch {
    /* indisponível */
  }
}

export async function cancelAllNudges(): Promise<void> {
  const LN = await plugin();
  if (!LN) return;
  try {
    await LN.cancel({
      notifications: [{ id: IDS.morning }, { id: IDS.streakRisk }],
    });
  } catch {
    /* nada a cancelar */
  }
}
