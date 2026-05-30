/** Captura de foto de progresso (privada, fica no aparelho). Usa o plugin
 *  Camera no nativo; no web abre o seletor/câmera do navegador. */
export async function takePhoto(): Promise<string | null> {
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
    // usuário cancelou ou permissão negada
    return null;
  }
}
