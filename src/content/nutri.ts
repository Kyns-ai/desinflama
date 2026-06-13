/**
 * Identidade da nutricionista por trás do programa — o maior ativo de confiança
 * do app. ⚠️ FOUNDER: preencha com os dados REAIS antes de lançar.
 *
 * O slot de vídeo só vira player quando `videoUrl` aponta pra um arquivo de
 * verdade (ex.: "/video/nutri-oi.mp4" em public/video ou um link hospedado).
 * Enquanto estiver vazio, a usuária vê a saudação escrita — nunca um player
 * morto de "vídeo em breve".
 */
export const NUTRI = {
  /** Nome da nutri (aparece na saudação e na assinatura). */
  nome: "sua nutri",
  /** Credencial curta, ex.: "Nutricionista · CRN-3 12345". Vazio = oculta. */
  credencial: "",
  /** Foto da nutri (público/img). Vazio = usa as iniciais num círculo. */
  foto: "",
  /** Vídeo de boas-vindas. Vazio = mostra só a saudação escrita. */
  videoUrl: "",
  /** Poster do vídeo (frame de capa). Vazio = fundo suave. */
  poster: "",
  /** Saudação escrita — serve de transcrição quando o vídeo existir, e de
   *  boas-vindas principal enquanto ele não existe. Parágrafos curtos. */
  saudacao: [
    "Oi! Que bom que você está aqui. Eu sei o quanto um inchaço que não passa cansa — incomoda no corpo e na cabeça.",
    "Estes dias não são sobre dieta da moda nem promessa milagrosa. A gente vai acalmar o seu intestino, descobrir o que te incha de verdade e devolver o conforto, um dia de cada vez.",
    "Vai no seu ritmo. Eu vou estar aqui em cada passo.",
  ],
};
