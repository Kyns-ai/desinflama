import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Configuração do Capacitor.
 *
 * `webDir: "out"` aponta para a saída do `next build` (static export).
 *
 * Live-reload em DEV: defina a env `CAP_SERVER_URL` com o IP da sua máquina
 * (ex: http://192.168.0.10:3000) ao rodar `next dev` para desenvolver dentro
 * do shell nativo com Fast Refresh. NUNCA deixe `server.url` num build de
 * release — o script de release valida isso.
 */
const devServerUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.desinflama.app",
  appName: "Desinflama",
  webDir: "out",
  backgroundColor: "#FAF7F2",
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: true,
        },
      }
    : {}),
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: "#FAF7F2",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#4FB286",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#FAF7F2",
  },
  android: {
    backgroundColor: "#FAF7F2",
  },
};

export default config;
