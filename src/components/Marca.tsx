/**
 * A marca do Desinflama, em SVG inline.
 *
 * Inline e não `<img src="/icons/icon.svg">` por um motivo específico: ela
 * aparece nos cards que viram imagem pelo `html-to-image`, e imagem externa
 * dentro do card exportado sai em branco por causa de CORS/carregamento.
 * Desenhada aqui, ela sempre entra no PNG.
 *
 * É o MESMO desenho do ícone do app (`public/icons/icon.svg`) — duas marcas
 * diferentes é marca nenhuma.
 */
export function Marca({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Desinflama"
    >
      <defs>
        <linearGradient
          id="marca-fundo"
          x1="0"
          y1="0"
          x2="512"
          y2="512"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B85179" />
          <stop offset="1" stopColor="#6A2440" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#marca-fundo)" />
      <path
        fillRule="evenodd"
        fill="#F7E5EA"
        d="M152 138 h96 c88 0 140 50 140 122 0 72 -52 122 -140 122 h-96 z
           M212 178 v168 h40 c54 0 82 -32 82 -84 0 -52 -28 -84 -82 -84 z"
      />
      <path fill="#F7E5EA" d="M128 138 h84 v20 h-84 z M128 362 h84 v20 h-84 z" />
      <path fill="#E4A0B8" d="M292 196c6-46 36-72 78-76 2 46-24 76-78 76z" />
    </svg>
  );
}
