import { Capacitor } from "@capacitor/core";

/** Captura de foto de progresso (privada, fica no aparelho). Usa o plugin
 *  Camera no nativo; no web cai no seletor de arquivo do navegador. */
export async function takePhoto(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import(
        "@capacitor/camera"
      );
      const photo = await Camera.getPhoto({
        quality: 70,
        width: 1000,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: "Foto de progresso",
        promptLabelPhoto: "Escolher da galeria",
        promptLabelPicture: "Tirar foto",
      });
      return photo.dataUrl ?? null;
    } catch {
      return null; // cancelou ou permissão negada
    }
  }
  // Web: input de arquivo (com câmera no mobile via capture). Comprime no canvas.
  return pickAndCompress();
}

function pickAndCompress(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1000;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(reader.result as string);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
