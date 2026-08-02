"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BrotoHumor, BrotoNivel } from "@/lib/broto";

/**
 * O Broto em SVG.
 *
 * Por que vetor e não arte gerada: o personagem precisa ser RECONHECIDAMENTE o
 * mesmo em 4 níveis x 4 humores. Modelo de imagem erra identidade entre poses —
 * 16 desenhos "quase iguais" é justamente o que lê como feito por IA. Aqui a
 * cabeça, os olhos e o vaso são literalmente o mesmo código; só a folhagem e a
 * expressão mudam. De quebra: escala sem borrar, anima e custa zero.
 *
 * As cores da ILUSTRAÇÃO não são tokens de UI. Folha verde e vaso de barro
 * existem porque planta é verde e vaso é de barro; misturar isso na paleta da
 * interface é o que produz aquele arco-íris de tela genérica.
 */

const FOLHA = "#7A9A6B";
const FOLHA_ESCURA = "#5E7D52";
const CORPO = "#8FAF7E";
const CORPO_ESCURO = "#6B8C5C";
const VASO = "#C08A6A";
const VASO_ESCURO = "#A2704F";
const TERRA = "#6B4B3A";
const OLHO = "#26191B";
const BOCHECHA = "#E48CA8";
const FLOR = "#C9799A";
const FLOR_MIOLO = "#F2E6CD";

/** Geometria por nível: onde fica a cabeça e quanto de folhagem aparece. */
const GEOMETRIA: Record<
  BrotoNivel,
  {
    cabecaY: number;
    raio: number;
    folhas: number;
    caule: number;
    flor: boolean;
    /**
     * Onde o desenho começa de fato (topo do que é pintado neste nível).
     * O viewBox é cortado aqui em vez de começar sempre em 0: com origem
     * fixa, a Semente carregava ~55% de altura vazia acima da cabeça e a
     * home ficava com um rombo de rosa entre o nome e o personagem.
     * Cortar o topo — e NÃO reescalar — preserva a sensação de crescimento:
     * a largura é a mesma em todos os níveis, só a altura aumenta.
     */
    topo: number;
  }
> = {
  semente: { cabecaY: 130, raio: 20, folhas: 0, caule: 0, flor: false, topo: 92 },
  broto: { cabecaY: 112, raio: 22, folhas: 2, caule: 16, flor: false, topo: 84 },
  planta: { cabecaY: 88, raio: 24, folhas: 4, caule: 40, flor: false, topo: 58 },
  florada: { cabecaY: 84, raio: 23, folhas: 4, caule: 44, flor: true, topo: 42 },
};

/** Inclinação das folhas por humor — folha caída é o "desanimado" sem texto. */
const INCLINACAO: Record<BrotoHumor, number> = {
  desanimado: 34,
  neutro: 8,
  animado: -10,
  comemorando: -20,
};

/**
 * Altura de cada par de folhas no caule. Fixa, não derivada do nível: com o
 * cálculo relativo anterior o par de cima batia na cabeça e o de baixo entrava
 * na borda do vaso (que vai de y=142 a y=156).
 */
const ALTURA_PAR = [138, 122];

export function Broto({
  nivel,
  humor,
  className,
  /** Tamanho em px do lado do SVG. */
  size = 168,
}: {
  nivel: BrotoNivel;
  humor: BrotoHumor;
  className?: string;
  size?: number;
}) {
  const reduzido = useReducedMotion();
  const g = GEOMETRIA[nivel];
  const inclina = INCLINACAO[humor];
  const feliz = humor === "animado" || humor === "comemorando";

  return (
    <motion.svg
      viewBox={`0 ${g.topo} 200 ${190 - g.topo}`}
      width={size}
      height={(size * (190 - g.topo)) / 200}
      className={className}
      role="img"
      aria-label={`Seu broto, nível ${nivel}, ${humor}`}
      // Respiração: um único movimento lento. Sem isso o boneco lê como
      // adesivo; com mais que isso, lê como banner piscando.
      animate={reduzido ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* sombra no chão — ancora o boneco, senão ele flutua no nada */}
      <ellipse cx="100" cy="180" rx="46" ry="7" fill="#26191B" opacity="0.08" />

      {/* ---------------------------- vaso ---------------------------- */}
      <path
        d="M74 152h52l-5 26a4 4 0 0 1-4 3H83a4 4 0 0 1-4-3z"
        fill={VASO_ESCURO}
      />
      <path
        d="M74 152h48l-5 26a4 4 0 0 1-4 3H83a4 4 0 0 1-4-3z"
        fill={VASO}
      />
      <rect x="68" y="142" width="64" height="14" rx="7" fill={VASO_ESCURO} />
      <rect x="68" y="142" width="60" height="12" rx="6" fill={VASO} />
      <ellipse cx="100" cy="148" rx="26" ry="4" fill={TERRA} opacity="0.85" />

      {/* ---------------------------- caule ---------------------------- */}
      {g.caule > 0 && (
        <path
          d={`M100 148 V ${148 - g.caule}`}
          stroke={CORPO_ESCURO}
          strokeWidth="7"
          strokeLinecap="round"
        />
      )}

      {/* ---------------------------- folhas ----------------------------
          A folha PRECISA girar em torno do ponto onde encosta no caule. O
          padrão do framer (`originX/originY`) resolve na bounding box do
          próprio elemento — a folha girava em torno de si mesma e se soltava
          da planta. `transformBox: view-box` faz o transform-origin valer no
          sistema de coordenadas do viewBox, que é onde o caule está. */}
      {Array.from({ length: g.folhas }).map((_, i) => {
        const par = Math.floor(i / 2); // 0 = par de baixo, 1 = par de cima
        const esquerda = i % 2 === 0;
        const baseY = ALTURA_PAR[par];
        const comp = par === 0 ? 26 : 23; // o par de cima é menor: perspectiva
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{ rotate: esquerda ? -inclina : inclina }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
            style={{
              transformBox: "view-box",
              transformOrigin: `100px ${baseY}px`,
            }}
          >
            <path
              d={
                esquerda
                  ? `M100 ${baseY} C ${100 - comp * 0.85} ${baseY - 2} ${100 - comp * 1.4} ${baseY - comp * 0.55} ${100 - comp * 1.25} ${baseY - comp} C ${100 - comp * 0.6} ${baseY - comp * 0.9} ${100 - comp * 0.15} ${baseY - comp * 0.45} 100 ${baseY}z`
                  : `M100 ${baseY} C ${100 + comp * 0.85} ${baseY - 2} ${100 + comp * 1.4} ${baseY - comp * 0.55} ${100 + comp * 1.25} ${baseY - comp} C ${100 + comp * 0.6} ${baseY - comp * 0.9} ${100 + comp * 0.15} ${baseY - comp * 0.45} 100 ${baseY}z`
              }
              fill={par === 0 ? FOLHA_ESCURA : FOLHA}
            />
          </motion.g>
        );
      })}

      {/* ---------------------------- flor (só na florada) ---------------- */}
      {g.flor &&
        [0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx={100 + Math.cos((a * Math.PI) / 180) * 26}
            cy={g.cabecaY - 4 + Math.sin((a * Math.PI) / 180) * 26}
            rx="11"
            ry="9"
            fill={FLOR}
            transform={`rotate(${a} ${100 + Math.cos((a * Math.PI) / 180) * 26} ${g.cabecaY - 4 + Math.sin((a * Math.PI) / 180) * 26})`}
          />
        ))}

      {/* ---------------------------- cabeça ---------------------------- */}
      <circle cx="100" cy={g.cabecaY} r={g.raio} fill={CORPO} />
      <path
        d={`M${100 - g.raio} ${g.cabecaY} a ${g.raio} ${g.raio} 0 0 0 ${g.raio * 2} 0z`}
        fill={CORPO_ESCURO}
        opacity="0.18"
      />
      {g.flor && (
        <circle cx="100" cy={g.cabecaY - 4} r="10" fill={FLOR_MIOLO} opacity="0.9" />
      )}

      {/* broto na ponta da semente — o "cabelinho" que dá vida ao nível 0 */}
      {nivel === "semente" && (
        <path
          d={`M100 ${g.cabecaY - g.raio} c 0 -10 6 -14 12 -15 c 1 9 -4 14 -12 15z`}
          fill={FOLHA}
        />
      )}

      {/* ---------------------------- rosto ---------------------------- */}
      <Rosto humor={humor} cx={100} cy={g.cabecaY} />

      {/* faíscas só na comemoração — o único momento de festa */}
      {humor === "comemorando" && (
        <>
          <Faisca x={64} y={g.cabecaY - 30} />
          <Faisca x={138} y={g.cabecaY - 22} />
          <Faisca x={124} y={g.cabecaY - 44} />
        </>
      )}

      {feliz && (
        <>
          <ellipse
            cx={100 - g.raio * 0.62}
            cy={g.cabecaY + 5}
            rx="6"
            ry="4"
            fill={BOCHECHA}
            opacity="0.55"
          />
          <ellipse
            cx={100 + g.raio * 0.62}
            cy={g.cabecaY + 5}
            rx="6"
            ry="4"
            fill={BOCHECHA}
            opacity="0.55"
          />
        </>
      )}
    </motion.svg>
  );
}

/** Olhos e boca. Mesma posição em todos os humores — só a forma muda. */
function Rosto({
  humor,
  cx,
  cy,
}: {
  humor: BrotoHumor;
  cx: number;
  cy: number;
}) {
  const dx = 8.5;
  const olhoY = cy - 3;

  if (humor === "desanimado") {
    return (
      <g stroke={OLHO} strokeWidth="2.4" strokeLinecap="round" fill="none">
        {/* olhos em arco pra baixo = pálpebra caída */}
        <path d={`M${cx - dx - 4} ${olhoY} q 4 4 8 0`} />
        <path d={`M${cx + dx - 4} ${olhoY} q 4 4 8 0`} />
        <path d={`M${cx - 5} ${cy + 11} q 5 -4 10 0`} />
      </g>
    );
  }

  if (humor === "neutro") {
    return (
      <g fill={OLHO}>
        <circle cx={cx - dx} cy={olhoY} r="2.6" />
        <circle cx={cx + dx} cy={olhoY} r="2.6" />
        <path
          d={`M${cx - 4} ${cy + 10} h 8`}
          stroke={OLHO}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // animado / comemorando — olhos em arco pra cima (sorriso nos olhos)
  const bocaAberta = humor === "comemorando";
  return (
    <g>
      <g stroke={OLHO} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d={`M${cx - dx - 4} ${olhoY + 1} q 4 -5 8 0`} />
        <path d={`M${cx + dx - 4} ${olhoY + 1} q 4 -5 8 0`} />
      </g>
      {bocaAberta ? (
        <path
          d={`M${cx - 6} ${cy + 7} a 6 6 0 0 0 12 0z`}
          fill={OLHO}
        />
      ) : (
        <path
          d={`M${cx - 5.5} ${cy + 8} q 5.5 5 11 0`}
          stroke={OLHO}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </g>
  );
}

function Faisca({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 7} q 1.6 5.4 7 7 q -5.4 1.6 -7 7 q -1.6 -5.4 -7 -7 q 5.4 -1.6 7 -7z`}
      fill="#D9AE72"
    />
  );
}
