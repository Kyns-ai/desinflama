/**
 * Cliente do serviço desinflama-api (pasta api/).
 *
 * Três coisas: validar o código que veio do funil, conversar com a Nutri IA e
 * analisar a foto do prato. As duas últimas chegam em pedaços (streaming), do
 * jeito que o WhatsApp mostra alguém digitando — por isso não dá para usar um
 * fetch comum e esperar a resposta inteira.
 */

import { kv } from "@/data/storage";
import { env } from "@/lib/env";

const CHAVE_TOKEN = "desinflama:acesso:token";
const CHAVE_ESTILO = "desinflama:nutri:estilo";

export type EstiloNutri = "firme" | "gentil" | "direta";

/** Como a cliente quer que a nutri fale com ela (copiado do Simple). */
export const ESTILOS_NUTRI: {
  id: EstiloNutri;
  titulo: string;
  descricao: string;
}[] = [
  {
    id: "gentil",
    titulo: "Me acolhe",
    descricao: "Quero alguém que me entenda nos dias ruins.",
  },
  {
    id: "firme",
    titulo: "Me cobra",
    descricao: "Quero alguém firme, que não passe a mão na minha cabeça.",
  },
  {
    id: "direta",
    titulo: "Direto ao ponto",
    descricao: "Só me diz o que fazer, sem rodeio.",
  },
];

export interface RespostasFunil {
  bloatType?: string;
  symptoms?: string[];
  worstTime?: string;
  goal?: string;
  cycleStart?: string;
}

export interface ClienteDoFunil {
  nome: string;
  email: string;
  plano: string;
  respostas: RespostasFunil;
  primeiraVez: boolean;
}

export interface ContextoNutri {
  tipoInchaco?: string;
  diaDoPrograma?: number;
  fase?: string;
  estilo?: "firme" | "gentil" | "direta";
  toleraBem?: string[];
  naoTolera?: string[];
  ultimosRegistros?: string[];
  modoGentil?: boolean;
}

/** Item do prato identificado pela IA. */
export interface ItemAnalisado {
  nome: string;
  grupo: string | null;
  nivel: "calma" | "atencao" | "inflama";
}

export interface DadosDaAnalise {
  semaforo: "calma" | "atencao" | "inflama";
  itens: ItemAnalisado[];
  troca: string;
  perguntas: string[];
}

export class ApiIndisponivel extends Error {}
export class LimiteDiarioAtingido extends Error {
  constructor(public restantes = 0) {
    super("limite diário de análises atingido");
  }
}

function base(): string {
  if (!env.api.url) throw new ApiIndisponivel("API não configurada");
  return env.api.url;
}

export const nutriApi = {
  configurada: () => env.api.configured,

  async token(): Promise<string | null> {
    return kv.get<string>(CHAVE_TOKEN);
  },

  async guardarToken(token: string): Promise<void> {
    await kv.set(CHAVE_TOKEN, token);
  },

  async limparToken(): Promise<void> {
    await kv.remove(CHAVE_TOKEN);
  },

  async estilo(): Promise<EstiloNutri> {
    return (await kv.get<EstiloNutri>(CHAVE_ESTILO)) ?? "gentil";
  },

  async guardarEstilo(estilo: EstiloNutri): Promise<void> {
    await kv.set(CHAVE_ESTILO, estilo);
  },

  /** Troca o código da página de obrigado por acesso liberado. */
  async validarCodigo(codigo: string): Promise<ClienteDoFunil> {
    const resp = await fetch(`${base()}/acesso/validar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ codigo }),
    });

    if (resp.status === 404) throw new Error("Código não encontrado.");
    if (!resp.ok) throw new Error("Não consegui validar seu acesso agora.");

    const { token, cliente } = (await resp.json()) as {
      token: string;
      cliente: ClienteDoFunil;
    };
    await this.guardarToken(token);
    return cliente;
  },

  /** Análise da foto do prato. Retorna o texto completo e os dados da tela. */
  async analisarFoto(
    imagemDataUrl: string,
    contexto: ContextoNutri,
    aoReceber: (pedaco: string) => void,
  ): Promise<{ texto: string; dados: DadosDaAnalise | null; restantesHoje: number }> {
    const token = await this.token();
    if (!token) throw new ApiIndisponivel("sem acesso liberado");

    const tipo = imagemDataUrl.match(/^data:(image\/[a-z]+);/)?.[1] ?? "image/jpeg";

    const resp = await fetch(`${base()}/ia/foto`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imagem: imagemDataUrl, tipo, contexto }),
    });

    if (resp.status === 429) {
      const corpo = (await resp.json().catch(() => ({}))) as { limite?: number };
      throw new LimiteDiarioAtingido(corpo.limite ?? 0);
    }
    if (!resp.ok) throw new ApiIndisponivel(`falha ${resp.status}`);

    const fim = await lerStream(resp, aoReceber);
    return {
      texto: String(fim?.texto ?? ""),
      dados: (fim?.dados as DadosDaAnalise | null) ?? null,
      restantesHoje: Number(fim?.restantesHoje ?? 0),
    };
  },

  /** Conversa com a Nutri IA. */
  async conversar(
    mensagens: { autor: "cliente" | "nutri"; texto: string }[],
    contexto: ContextoNutri,
    aoReceber: (pedaco: string) => void,
  ): Promise<{ texto: string; sugestoes: string[] }> {
    const token = await this.token();
    if (!token) throw new ApiIndisponivel("sem acesso liberado");

    const resp = await fetch(`${base()}/ia/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mensagens, contexto }),
    });

    if (!resp.ok) throw new ApiIndisponivel(`falha ${resp.status}`);

    const fim = await lerStream(resp, aoReceber);
    return {
      texto: String(fim?.texto ?? ""),
      sugestoes: (fim?.sugestoes as string[]) ?? [],
    };
  },
};

/* ------------------------------------------------------------------ *
 *  Leitura do streaming (SSE por POST — EventSource só faz GET).
 * ------------------------------------------------------------------ */

async function lerStream(
  resp: Response,
  aoReceber: (pedaco: string) => void,
): Promise<Record<string, unknown> | null> {
  const corpo = resp.body;
  if (!corpo) return null;

  const leitor = corpo.getReader();
  const decodificador = new TextDecoder();
  let buffer = "";
  let final: Record<string, unknown> | null = null;
  let erro: string | null = null;

  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    buffer += decodificador.decode(value, { stream: true });

    // Eventos SSE são separados por linha em branco.
    const blocos = buffer.split("\n\n");
    buffer = blocos.pop() ?? "";

    for (const bloco of blocos) {
      let evento = "message";
      const dados: string[] = [];
      for (const linha of bloco.split("\n")) {
        if (linha.startsWith("event:")) evento = linha.slice(6).trim();
        else if (linha.startsWith("data:")) dados.push(linha.slice(5).trim());
      }
      if (!dados.length) continue;

      const cru = dados.join("\n");
      try {
        const conteudo = JSON.parse(cru) as unknown;
        if (evento === "texto" && typeof conteudo === "string") aoReceber(conteudo);
        else if (evento === "fim") final = conteudo as Record<string, unknown>;
        else if (evento === "erro") {
          erro = String((conteudo as { mensagem?: string })?.mensagem ?? "erro");
        }
      } catch {
        // pedaço incompleto — o próximo ciclo completa
      }
    }
  }

  if (erro) throw new Error(erro);
  return final;
}
