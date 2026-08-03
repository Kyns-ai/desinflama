"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Loader2, Search, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { MedidorArco } from "@/components/prato/MedidorArco";
import { useAppStore } from "@/store/useAppStore";
import { calcularNota, normalizarGrupo } from "@/lib/notaPrato";
import {
  buscarAlimentos,
  CATALOGO,
  paraItem,
  sugerirTroca,
  temFibra,
  type AlimentoCatalogo,
} from "@/content/catalogoPrato";
import type { ItemPrato, RefeicaoAnalisada } from "@/types/domain";
import { takePhoto } from "@/lib/camera";
import { nutriApi } from "@/lib/nutriApi";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

/** Compara nomes ignorando caixa e acento (a IA escreve "Pao de trigo"). */
function normalizarNome(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const MOMENTOS: { id: RefeicaoAnalisada["momento"]; rotulo: string }[] = [
  { id: "cafe", rotulo: "Café" },
  { id: "almoco", rotulo: "Almoço" },
  { id: "jantar", rotulo: "Jantar" },
  { id: "lanche", rotulo: "Lanche" },
];

function momentoProvavel(): RefeicaoAnalisada["momento"] {
  const h = new Date().getHours();
  if (h < 11) return "cafe";
  if (h < 15) return "almoco";
  if (h < 19) return "lanche";
  return "jantar";
}

/**
 * Montagem de uma refeição.
 *
 * A nota aparece AO VIVO enquanto ela escolhe, em vez de só no fim: ver o
 * número cair ao tocar em "pão de trigo" ensina mais sobre o próprio corpo do
 * que qualquer texto explicativo depois do fato.
 */
export function NovaRefeicao({ aoFechar }: { aoFechar: () => void }) {
  const adicionarRefeicao = useAppStore((s) => s.adicionarRefeicao);
  const tolerancia = useAppStore((s) => s.data.tolerance);
  const perfil = useAppStore((s) => s.data.user?.onboarding?.bloatType ?? null);

  const [momento, setMomento] = useState(momentoProvavel());
  const [termo, setTermo] = useState("");
  const [escolhidos, setEscolhidos] = useState<AlimentoCatalogo[]>([]);
  const [foto, setFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [avisoDaFoto, setAvisoDaFoto] = useState<string | null>(null);
  /** Itens que a IA achou e o catálogo não tem — entram na nota mesmo assim. */
  const [itensDaFoto, setItensDaFoto] = useState<ItemPrato[]>([]);

  const resultados = useMemo(() => buscarAlimentos(termo).slice(0, 24), [termo]);

  const itens = [...escolhidos.map(paraItem), ...itensDaFoto];
  const previa = calcularNota(itens, {
    tolerancia,
    perfil,
    temFibra: temFibra(escolhidos),
  });

  function alternar(a: AlimentoCatalogo) {
    void haptic("light");
    setEscolhidos((atual) =>
      atual.some((e) => e.nome === a.nome)
        ? atual.filter((e) => e.nome !== a.nome)
        : [...atual, a]
    );
  }

  /**
   * Tira a foto e MANDA IDENTIFICAR.
   *
   * Este era o caminho principal do Prato e estava desligado: a foto era
   * guardada e pronto, então ela montava tudo à mão mesmo tendo fotografado.
   *
   * A IA só devolve ALIMENTOS e GRUPOS — a nota continua sendo calculada
   * aqui, com o Mapa de Tolerância dela. O que a IA acha vira sugestão
   * pré-marcada, nunca fato: ela confirma, tira e acrescenta antes de salvar.
   * Se o serviço não estiver ligado, cai na montagem manual sem drama.
   */
  async function tirarFoto() {
    const dataUrl = await takePhoto();
    if (!dataUrl) return;
    setFoto(dataUrl);
    setAvisoDaFoto(null);
    setItensDaFoto([]);

    if (!nutriApi.configurada()) {
      setAvisoDaFoto(
        "A leitura automática ainda não está ligada. Marque abaixo o que tinha no prato."
      );
      return;
    }

    setAnalisando(true);
    try {
      const { dados } = await nutriApi.analisarFoto(dataUrl, {}, () => {});
      const achados = dados?.itens ?? [];
      if (!achados.length) {
        setAvisoDaFoto("Não consegui ler esse prato. Marque abaixo o que tinha.");
        return;
      }

      // Casa com o catálogo pelo nome: item conhecido entra com fibra,
      // marcadores e troca específica — tudo que a IA não sabe.
      const doCatalogo: AlimentoCatalogo[] = [];
      const soltos: ItemPrato[] = [];
      for (const item of achados) {
        const conhecido = CATALOGO.find(
          (a) => normalizarNome(a.nome) === normalizarNome(item.nome)
        );
        if (conhecido) doCatalogo.push(conhecido);
        else soltos.push({ nome: item.nome, grupo: normalizarGrupo(item.grupo) });
      }

      setEscolhidos((atuais) => [
        ...atuais,
        ...doCatalogo.filter((c) => !atuais.some((a) => a.nome === c.nome)),
      ]);
      setItensDaFoto(soltos);
      setAvisoDaFoto(
        `Li ${achados.length} ${achados.length === 1 ? "alimento" : "alimentos"}. Confira e ajuste antes de salvar.`
      );
    } catch {
      setAvisoDaFoto(
        "Não consegui ler a foto agora. Marque abaixo o que tinha no prato."
      );
    } finally {
      setAnalisando(false);
    }
  }

  async function salvar() {
    if (!itens.length) return;
    setSalvando(true);
    await adicionarRefeicao({
      momento,
      fotoDataUrl: foto ?? undefined,
      nome: itens.map((i) => i.nome).join(" + "),
      itens,
      troca: sugerirTroca(itens),
      temFibra: temFibra(escolhidos),
    });
    void haptic("success");
    setSalvando(false);
    aoFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream pt-safe">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <h1 className="font-display text-h3 font-semibold text-ink">
          O que você comeu
        </h1>
        <button
          onClick={aoFechar}
          aria-label="Fechar"
          className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors active:bg-black/5"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {/* momento */}
        <div className="flex gap-2 py-4">
          {MOMENTOS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMomento(m.id)}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-semibold transition-colors",
                momento === m.id
                  ? "bg-rose text-white"
                  : "bg-cream-deep text-ink-soft"
              )}
            >
              {m.rotulo}
            </button>
          ))}
        </div>

        {/* foto (opcional) */}
        <button
          onClick={tirarFoto}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-4 py-3 text-left transition-colors active:bg-cream-deep"
        >
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt=""
              className="size-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-rose-tint text-rose-dark">
              <Camera className="size-6" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block font-semibold tracking-tight text-ink">
              {analisando
                ? "Lendo o prato…"
                : foto
                  ? "Foto adicionada"
                  : "Foto do prato"}
            </span>
            <span className="block text-sm text-ink-soft">
              {avisoDaFoto ??
                (foto ? "Toque para trocar" : "Opcional — fica só no seu aparelho")}
            </span>
          </span>
          {analisando && (
            <Loader2 className="size-5 shrink-0 animate-spin text-rose" />
          )}
        </button>

        {/* busca */}
        <div className="mt-4">
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar alimento…"
            icon={<Search className="size-4" />}
            aria-label="Buscar alimento"
          />
        </div>

        {/* escolhidos */}
        {escolhidos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {escolhidos.map((a) => (
              <button
                key={a.nome}
                onClick={() => alternar(a)}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-sm font-semibold text-white"
              >
                {a.nome}
                <X className="size-3.5" />
              </button>
            ))}
          </div>
        )}

        {/* Itens que a IA leu e o catálogo não tem. Entram na nota do mesmo
            jeito — o catálogo é uma conveniência, não a fronteira do mundo. */}
        {itensDaFoto.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {itensDaFoto.map((i) => (
              <button
                key={i.nome}
                onClick={() =>
                  setItensDaFoto((c) => c.filter((x) => x.nome !== i.nome))
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-rose/40 bg-rose-tint px-3 py-1.5 text-sm font-semibold text-rose-dark"
              >
                {i.nome}
                <X className="size-3.5" />
              </button>
            ))}
          </div>
        )}

        {/* catálogo */}
        <ul className="mt-3 space-y-1">
          {resultados.map((a) => {
            const ativo = escolhidos.some((e) => e.nome === a.nome);
            return (
              <li key={a.nome}>
                <button
                  onClick={() => alternar(a)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    ativo ? "bg-rose-tint" : "active:bg-cream-deep"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      ativo ? "border-rose bg-rose text-white" : "border-line"
                    )}
                  >
                    {ativo && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] text-ink">
                    {a.nome}
                  </span>
                  {a.grupo && (
                    <span className="shrink-0 text-xs font-medium text-ink-faint">
                      {a.grupo}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {resultados.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-soft">
              Não achei esse aqui. Escolha o mais parecido — a nota é um
              retrato, não um exame.
            </li>
          )}
        </ul>
      </div>

      {/* rodapé com a prévia ao vivo */}
      <motion.footer
        initial={false}
        animate={{ y: 0 }}
        className="border-t border-line bg-surface px-5 pb-safe pt-3"
      >
        {itens.length > 0 ? (
          <div className="flex items-center gap-4">
            <MedidorArco nota={previa.nota} rotulo="Prévia" tamanho={150} />
            <div className="min-w-0 flex-1">
              <Button fullWidth size="lg" loading={salvando} onClick={salvar}>
                Salvar refeição
              </Button>
              <p className="mt-2 text-center text-xs text-ink-faint">
                {escolhidos.length}{" "}
                {escolhidos.length === 1 ? "alimento" : "alimentos"}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-3 text-center text-sm text-ink-soft">
            Escolha o que tinha no prato para ver a nota.
          </p>
        )}
      </motion.footer>

      {salvando && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-cream/40">
          <Loader2 className="size-6 animate-spin text-rose" />
        </div>
      )}
    </div>
  );
}
