/**
 * Preparo da foto antes de mandar para a Nutri IA.
 *
 * A foto do celular vem com 4000px de largura e vários MB. Isso deixa a análise
 * lenta e cara sem melhorar nada: para reconhecer o que tem no prato, 1024px é
 * de sobra. Reduzir aqui corta o tempo de espera dela e a conta no fim do mês.
 */

const LADO_MAXIMO = 1024;
const QUALIDADE = 0.82;

export async function prepararFoto(arquivo: File): Promise<string> {
  const bitmap = await carregar(arquivo);

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não consegui preparar a foto neste aparelho.");

  ctx.drawImage(bitmap, 0, 0, largura, altura);
  if ("close" in bitmap) bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALIDADE);
}

async function carregar(arquivo: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap já respeita a orientação EXIF (foto tirada deitada).
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    } catch {
      // alguns navegadores antigos não aceitam a opção — cai no <img>
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não consegui abrir essa foto."));
    };
    img.src = url;
  });
}
