/**
 * Transforma um pedaço da tela em imagem e abre o compartilhamento nativo.
 *
 * É a engrenagem do efeito manada (Seção 7 do PLANO): sem virar imagem, a
 * frase e a conquista morrem dentro do app.
 *
 * Estratégia em degraus, porque nem todo aparelho tem tudo:
 *  1. Web Share com arquivo (iOS/Android modernos) — vai direto pro Stories;
 *  2. Web Share só com texto, quando o aparelho não aceita arquivo;
 *  3. download do PNG, no desktop.
 */

/** Escala do PNG: 2x já fica nítido no feed sem estourar memória no celular. */
const ESCALA = 2;

export async function compartilharCard(
  elemento: HTMLElement,
  nomeArquivo: string,
  textoAlternativo: string
): Promise<"compartilhado" | "baixado" | "cancelado" | "erro"> {
  try {
    // import dinâmico: html-to-image só entra no bundle de quem compartilha
    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(elemento, {
      pixelRatio: ESCALA,
      cacheBust: true,
      // o card é desenhado sobre o creme do app; sem cor de fundo explícita,
      // cantos arredondados saem transparentes e ficam pretos no Instagram
      backgroundColor: "#6A2440",
    });

    const blob = await (await fetch(dataUrl)).blob();
    const arquivo = new File([blob], nomeArquivo, { type: "image/png" });

    const nav = navigator as Navigator & {
      canShare?: (dados: ShareData) => boolean;
    };

    if (nav.share && nav.canShare?.({ files: [arquivo] })) {
      await nav.share({ files: [arquivo], text: textoAlternativo });
      return "compartilhado";
    }

    if (nav.share) {
      await nav.share({ text: `${textoAlternativo} — @desinflama` });
      return "compartilhado";
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = nomeArquivo;
    link.click();
    return "baixado";
  } catch (erro) {
    // Cancelar o menu nativo rejeita a promessa — isso não é falha, e mostrar
    // erro pra quem só desistiu de postar seria ruído.
    if (erro instanceof DOMException && erro.name === "AbortError") {
      return "cancelado";
    }
    return "erro";
  }
}
