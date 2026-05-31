/** Feedback tátil (Capacitor Haptics). No web degrada via Vibration API; em
 *  qualquer falha, silencia. */
export async function haptic(
  kind: "light" | "medium" | "heavy" | "success" = "medium"
): Promise<void> {
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import(
      "@capacitor/haptics"
    );
    if (kind === "success") {
      await Haptics.notification({ type: NotificationType.Success });
    } else {
      const style =
        kind === "light"
          ? ImpactStyle.Light
          : kind === "heavy"
            ? ImpactStyle.Heavy
            : ImpactStyle.Medium;
      await Haptics.impact({ style });
    }
  } catch {
    /* indisponível */
  }
}
