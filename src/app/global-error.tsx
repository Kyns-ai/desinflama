"use client";

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
          background: "#FAF7F2",
          color: "#2B2B2B",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: 44 }}>🌿</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginTop: 16 }}>
            Algo saiu do lugar
          </h1>
          <p style={{ color: "#5c5953", marginTop: 8, lineHeight: 1.5 }}>
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
              background: "#F2856D",
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
