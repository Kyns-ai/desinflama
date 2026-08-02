"use client";

/**
 * Erro global: substitui o root layout, então NÃO pode contar com o
 * globals.css nem com Tailwind — tudo aqui é estilo inline e SVG embutido.
 * Por isso os valores da paleta aparecem em hex: são os tokens de
 * `globals.css` copiados à mão (cream, ink, ink-soft, rose).
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#F5ECE8",
          color: "#26191B",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 24,
              background: "#F7E5EA",
              color: "#6A2440",
            }}
          >
            {/* Broto (Lucide "sprout"), embutido porque não há bundle de
                ícones garantido nesta tela. */}
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginTop: 16 }}>
            Algo saiu do lugar
          </h1>
          <p style={{ color: "#5B4A49", marginTop: 8, lineHeight: 1.5 }}>
            Tivemos um probleminha. Tente de novo — seus dados estão salvos.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              height: 48,
              padding: "0 24px",
              borderRadius: 16,
              border: "none",
              background: "#A8446A",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
