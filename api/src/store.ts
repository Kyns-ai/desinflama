/* Onde ficam os acessos liberados pelo funil.
 *
 * Duas implementações com a mesma interface:
 *  - Supabase (produção) — sobrevive a reinício e dá pra ver quem comprou
 *  - Memória (desenvolvimento) — some ao reiniciar, mas não exige banco nenhum
 *
 * A tabela do Supabase está em supabase/acessos.sql. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, temBanco } from "./env.js";

/** Respostas que o funil já coletou — o app usa para NÃO repetir as perguntas. */
export interface RespostasFunil {
  /** fermentacao | retencao | lentidao | estresse */
  bloatType?: string;
  /** inchaco, gases, intestino, energia, pele */
  symptoms?: string[];
  /** manha | tarde | noite | refeicoes */
  worstTime?: string;
  /** desinchar | energia | pele | digestao | rotina */
  goal?: string;
  /** YYYY-MM-DD, se ela informou */
  cycleStart?: string;
}

export interface Acesso {
  id: string;
  codigo: string;
  nome: string;
  email: string;
  plano: string;
  respostas: RespostasFunil;
  criadoEm: string;
  ativadoEm: string | null;
}

export interface AcessoStore {
  criar(dados: Omit<Acesso, "id" | "criadoEm" | "ativadoEm">): Promise<Acesso>;
  porCodigo(codigo: string): Promise<Acesso | null>;
  porId(id: string): Promise<Acesso | null>;
  marcarAtivado(id: string): Promise<void>;
  /** Quantas análises de foto esse acesso já fez hoje (para o teto diário). */
  analisesHoje(acessoId: string): Promise<number>;
  registrarAnalise(acessoId: string): Promise<void>;
}

/* ------------------------------- memória -------------------------------- */

class StoreMemoria implements AcessoStore {
  private acessos = new Map<string, Acesso>();
  private porCodigoIdx = new Map<string, string>();
  private analises = new Map<string, number>(); // `${acessoId}:${dia}` → contagem

  async criar(dados: Omit<Acesso, "id" | "criadoEm" | "ativadoEm">): Promise<Acesso> {
    const acesso: Acesso = {
      ...dados,
      id: `acs_${Math.random().toString(36).slice(2, 12)}`,
      criadoEm: new Date().toISOString(),
      ativadoEm: null,
    };
    this.acessos.set(acesso.id, acesso);
    this.porCodigoIdx.set(acesso.codigo.toUpperCase(), acesso.id);
    return acesso;
  }

  async porCodigo(codigo: string): Promise<Acesso | null> {
    const id = this.porCodigoIdx.get(codigo.toUpperCase());
    return id ? (this.acessos.get(id) ?? null) : null;
  }

  async porId(id: string): Promise<Acesso | null> {
    return this.acessos.get(id) ?? null;
  }

  async marcarAtivado(id: string): Promise<void> {
    const a = this.acessos.get(id);
    if (a && !a.ativadoEm) a.ativadoEm = new Date().toISOString();
  }

  async analisesHoje(acessoId: string): Promise<number> {
    return this.analises.get(`${acessoId}:${hoje()}`) ?? 0;
  }

  async registrarAnalise(acessoId: string): Promise<void> {
    const chave = `${acessoId}:${hoje()}`;
    this.analises.set(chave, (this.analises.get(chave) ?? 0) + 1);
  }
}

/* ------------------------------- supabase ------------------------------- */

class StoreSupabase implements AcessoStore {
  constructor(private db: SupabaseClient) {}

  async criar(dados: Omit<Acesso, "id" | "criadoEm" | "ativadoEm">): Promise<Acesso> {
    const { data, error } = await this.db
      .from("acessos")
      .insert({
        codigo: dados.codigo,
        nome: dados.nome,
        email: dados.email,
        plano: dados.plano,
        respostas: dados.respostas,
      })
      .select()
      .single();
    if (error) throw new Error(`Falha ao criar acesso: ${error.message}`);
    return mapear(data);
  }

  async porCodigo(codigo: string): Promise<Acesso | null> {
    const { data } = await this.db
      .from("acessos")
      .select()
      .eq("codigo", codigo.toUpperCase())
      .maybeSingle();
    return data ? mapear(data) : null;
  }

  async porId(id: string): Promise<Acesso | null> {
    const { data } = await this.db.from("acessos").select().eq("id", id).maybeSingle();
    return data ? mapear(data) : null;
  }

  async marcarAtivado(id: string): Promise<void> {
    await this.db
      .from("acessos")
      .update({ ativado_em: new Date().toISOString() })
      .eq("id", id)
      .is("ativado_em", null);
  }

  async analisesHoje(acessoId: string): Promise<number> {
    const { count } = await this.db
      .from("analises_ia")
      .select("*", { count: "exact", head: true })
      .eq("acesso_id", acessoId)
      .gte("criado_em", `${hoje()}T00:00:00Z`);
    return count ?? 0;
  }

  async registrarAnalise(acessoId: string): Promise<void> {
    await this.db.from("analises_ia").insert({ acesso_id: acessoId });
  }
}

function mapear(row: Record<string, unknown>): Acesso {
  return {
    id: String(row.id),
    codigo: String(row.codigo),
    nome: String(row.nome ?? ""),
    email: String(row.email ?? ""),
    plano: String(row.plano ?? "annual"),
    respostas: (row.respostas as RespostasFunil) ?? {},
    criadoEm: String(row.criado_em ?? new Date().toISOString()),
    ativadoEm: row.ativado_em ? String(row.ativado_em) : null,
  };
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export const store: AcessoStore = temBanco
  ? new StoreSupabase(
      createClient(env.supabase.url, env.supabase.chaveServico, {
        auth: { persistSession: false },
      }),
    )
  : new StoreMemoria();

export const usandoMemoria = !temBanco;
