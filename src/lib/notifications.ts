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

/** Copy da manhã por dia — as primeiras 72h falam com ELA, não com "usuária".
 *  (O dado de ontem não entra: o agendamento é antecipado e só é reescrito em
 *  completeDay; embutir score exigiria reagendar em todo addLog.) */
function morningCopy(day: number, nome?: string): { title: string; body: string } {
  const oi = nome ? `${nome}, ` : "";
  if (day === 1)
    return {
 title:"Seu Dia 1 te espera",
      body: "Começa leve: 1 respiração, 1 check-in. 3 minutos.",
    };
  if (day === 2)
    return {
 title:"Bom dia",
      body: `${oi}sua barriga já deve reclamar menos hoje. Registra pra gente comparar?`,
    };
  if (day === 3)
    return {
 title:"Último dia da fase Choque",
      body: `${oi}feche as 72h e veja seu índice subir.`,
    };
  return {
 title:"Bom dia",
    body: `Seu Dia ${day} te espera. Bora desinchar?`,
  };
}

export async function scheduleRetentionNudges(
  currentDay: number,
  firstName?: string
): Promise<void> {
  const LN = await plugin();
  if (!LN) return;
  const manha = morningCopy(currentDay, firstName);
  try {
    await LN.schedule({
      notifications: [
        {
          id: IDS.morning,
          title: manha.title,
          body: manha.body,
          schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true },
        },
        {
          id: IDS.streakRisk,
 title:"Não perca sua ofensiva",
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
