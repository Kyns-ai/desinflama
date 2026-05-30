/**
 * Repository — persistência do documento AppData por usuário.
 *
 * Fase 1: LocalRepository (KV nativo/IndexedDB), suficiente para o app rodar
 * end-to-end offline. Quando o Supabase estiver configurado, um repositório
 * de sincronização (last-write-wins) envolve este local — a UI não muda, pois
 * depende apenas da interface.
 */
import type { AppData } from "@/types/domain";
import { emptyAppData } from "@/types/domain";
import { kv } from "./storage";

export interface Repository {
  /** Define o usuário ativo (namespace dos dados). */
  setNamespace(ns: string): void;
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

const keyFor = (ns: string) => `desinflama:appdata:${ns}`;

export class LocalRepository implements Repository {
  private ns = "anon";

  setNamespace(ns: string) {
    this.ns = ns || "anon";
  }

  async load(): Promise<AppData | null> {
    return kv.get<AppData>(keyFor(this.ns));
  }

  async save(data: AppData): Promise<void> {
    await kv.set(keyFor(this.ns), data);
  }

  async clear(): Promise<void> {
    await kv.remove(keyFor(this.ns));
  }
}

/** Carrega os dados do usuário, criando um estado vazio se for o primeiro acesso. */
export async function loadOrInit(repo: Repository): Promise<AppData> {
  const existing = await repo.load();
  if (existing) return { ...emptyAppData(), ...existing };
  const fresh = emptyAppData();
  await repo.save(fresh);
  return fresh;
}
