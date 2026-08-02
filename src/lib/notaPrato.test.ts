import { describe, expect, it } from "vitest";
import {
  calcularNota,
  faixaDe,
  fatorDeReacao,
  normalizarGrupo,
  type ItemDoPrato,
} from "./notaPrato";
import type { ToleranceResult } from "@/types/domain";

const semTolerancia: ToleranceResult[] = [];

function teste(group: ToleranceResult["group"], reaction: ToleranceResult["reaction"], dateTested = "2026-08-01"): ToleranceResult {
  return { group, reaction, dateTested };
}

describe("faixas", () => {
  it("respeita os cortes da Seção 6 (80 e 50)", () => {
    expect(faixaDe(100)).toBe("cai-bem");
    expect(faixaDe(80)).toBe("cai-bem");
    expect(faixaDe(79)).toBe("depende");
    expect(faixaDe(50)).toBe("depende");
    expect(faixaDe(49)).toBe("incha");
    expect(faixaDe(0)).toBe("incha");
  });
});

describe("nota", () => {
  it("prato sem nenhum FODMAP vale 100 e cai bem", () => {
    const itens: ItemDoPrato[] = [
      { nome: "Arroz", grupo: null },
      { nome: "Frango", grupo: null },
      { nome: "Cenoura", grupo: null },
    ];
    const r = calcularNota(itens, { tolerancia: semTolerancia, perfil: null });
    expect(r.nota).toBe(100);
    expect(r.faixa).toBe("cai-bem");
    expect(r.porques).toHaveLength(0);
  });

  it("nunca sai da escala 0–100", () => {
    const muitos: ItemDoPrato[] = Array.from({ length: 12 }, (_, i) => ({
      nome: `Item ${i}`,
      grupo: "frutanos" as const,
    }));
    const r = calcularNota(muitos, {
      tolerancia: [teste("frutanos", 3)],
      perfil: "fermentacao",
    });
    expect(r.nota).toBe(0);
    expect(r.faixa).toBe("incha");
  });

  it("é determinística: mesma entrada, mesma nota", () => {
    const itens: ItemDoPrato[] = [
      { nome: "Pão", grupo: "frutanos" },
      { nome: "Queijo", grupo: "lactose" },
    ];
    const ctx = { tolerancia: [teste("lactose", 2)], perfil: "fermentacao" as const };
    const a = calcularNota(itens, ctx);
    const b = calcularNota(itens, ctx);
    expect(a.nota).toBe(b.nota);
  });

  it("A NOTA É DELA: o mesmo prato muda quando o Mapa de Tolerância muda", () => {
    const itens: ItemDoPrato[] = [{ nome: "Iogurte", grupo: "lactose" }];

    const naoTestado = calcularNota(itens, { tolerancia: semTolerancia, perfil: null });
    const tolerou = calcularNota(itens, { tolerancia: [teste("lactose", 0)], perfil: null });
    const reagiuForte = calcularNota(itens, { tolerancia: [teste("lactose", 3)], perfil: null });

    // quem tolera bem lactose recebe nota MAIOR pelo mesmo prato
    expect(tolerou.nota).toBeGreaterThan(naoTestado.nota);
    expect(naoTestado.nota).toBeGreaterThan(reagiuForte.nota);
    expect(tolerou.faixa).toBe("cai-bem");
    expect(reagiuForte.faixa).toBe("depende");
  });

  it("o teste mais recente é o que vale", () => {
    const antigo = teste("gos", 3, "2026-07-01");
    const novo = teste("gos", 0, "2026-08-01");
    expect(fatorDeReacao("gos", [antigo, novo])).toBe(0.15);
    // ordem de entrada não pode importar
    expect(fatorDeReacao("gos", [novo, antigo])).toBe(0.15);
  });

  it("grupo nunca testado fica no meio (0,5), nem assusta nem tranquiliza", () => {
    expect(fatorDeReacao("polioles", semTolerancia)).toBe(0.5);
  });

  it("perfil de fermentação sofre mais com frutano que perfil de retenção", () => {
    const itens: ItemDoPrato[] = [{ nome: "Cebola", grupo: "frutanos" }];
    const ferm = calcularNota(itens, { tolerancia: semTolerancia, perfil: "fermentacao" });
    const ret = calcularNota(itens, { tolerancia: semTolerancia, perfil: "retencao" });
    expect(ferm.nota).toBeLessThan(ret.nota);
  });

  it("perfil de retenção sofre mais com sódio/ultraprocessado", () => {
    const itens: ItemDoPrato[] = [
      { nome: "Embutido", grupo: null, marcadores: ["sodioAlto", "ultraprocessado"] },
    ];
    const ret = calcularNota(itens, { tolerancia: semTolerancia, perfil: "retencao" });
    const ferm = calcularNota(itens, { tolerancia: semTolerancia, perfil: "fermentacao" });
    expect(ret.nota).toBeLessThan(ferm.nota);
  });

  it("trânsito lento perde ponto por prato SEM fibra", () => {
    const itens: ItemDoPrato[] = [{ nome: "Pão branco", grupo: null }];
    const comFibra = calcularNota(itens, {
      tolerancia: semTolerancia,
      perfil: "lentidao",
      temFibra: true,
    });
    const semFibra = calcularNota(itens, {
      tolerancia: semTolerancia,
      perfil: "lentidao",
      temFibra: false,
    });
    expect(semFibra.nota).toBe(comFibra.nota - 10);
  });

  it("explica de onde cada ponto saiu, do maior para o menor", () => {
    const itens: ItemDoPrato[] = [
      { nome: "Pão de trigo", grupo: "frutanos" },
      { nome: "Manga", grupo: "frutose" },
    ];
    const r = calcularNota(itens, { tolerancia: semTolerancia, perfil: null });
    expect(r.porques.length).toBe(2);
    expect(r.porques[0].pontos).toBeGreaterThanOrEqual(r.porques[1].pontos);
    expect(r.porques[0].causa).toBe("Pão de trigo");
  });
});

describe("normalizarGrupo", () => {
  it("entende o texto livre que a IA devolve", () => {
    expect(normalizarGrupo("Frutanos")).toBe("frutanos");
    expect(normalizarGrupo("frutano")).toBe("frutanos");
    expect(normalizarGrupo("FODMAP: GOS")).toBe("gos");
    expect(normalizarGrupo("leguminosas")).toBe("gos");
    expect(normalizarGrupo("Polióis")).toBe("polioles");
    expect(normalizarGrupo("poliois")).toBe("polioles");
    expect(normalizarGrupo("Lactose")).toBe("lactose");
    expect(normalizarGrupo("frutose")).toBe("frutose");
  });

  it("devolve null pro que não é grupo FODMAP", () => {
    expect(normalizarGrupo(null)).toBeNull();
    expect(normalizarGrupo("")).toBeNull();
    expect(normalizarGrupo("proteína")).toBeNull();
  });
});

describe("teto do gatilho confirmado", () => {
  it("gatilho que ela JÁ REAGIU FORTE nunca pode dizer 'cai bem'", () => {
    // Prato com um único item de lactose. Sem o teto, dava 82 = "cai bem" —
    // ou seja, o app diria que o gatilho confirmado dela cai bem.
    const itens: ItemDoPrato[] = [{ nome: "Iogurte", grupo: "lactose" }];
    const r = calcularNota(itens, { tolerancia: [teste("lactose", 3)], perfil: null });
    expect(r.nota).toBeLessThan(80);
    expect(r.faixa).not.toBe("cai-bem");
  });

  it("mas o teto NÃO se aplica a quem tolera bem o grupo", () => {
    const itens: ItemDoPrato[] = [{ nome: "Iogurte", grupo: "lactose" }];
    const r = calcularNota(itens, { tolerancia: [teste("lactose", 0)], perfil: null });
    expect(r.faixa).toBe("cai-bem");
  });
});
