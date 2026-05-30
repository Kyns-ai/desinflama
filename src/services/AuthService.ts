/**
 * AuthService — autenticação atrás de interface.
 *
 *  - MockAuthService: sessão simulada persistida localmente (modo dev sem chaves).
 *  - SupabaseAuthService: e-mail/senha + OAuth social via Supabase.
 *
 * A composition root (services/index.ts) escolhe a implementação conforme as
 * envs. A UI depende só da interface — as chaves reais entram sem reescrever UI.
 */
import { kv } from "@/data/storage";
import { getSupabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type OAuthProvider = "google" | "apple";

export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  signUpWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<AuthUser>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signInWithProvider(provider: OAuthProvider): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  /** Notifica mudanças de sessão; retorna função de cancelamento. */
  onAuthChange(cb: (user: AuthUser | null) => void): () => void;
}

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `u_${Math.abs(hashString(String(Date.now())))}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "você";
  const clean = local.replace(/[._-]+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/* --------------------------------- Mock --------------------------------- */

const SESSION_KEY = "desinflama:auth:session";
const ACCOUNTS_KEY = "desinflama:auth:accounts";

interface MockAccount extends AuthUser {
  password: string;
}

export class MockAuthService implements AuthService {
  private listeners = new Set<(u: AuthUser | null) => void>();

  private async accounts(): Promise<MockAccount[]> {
    return (await kv.get<MockAccount[]>(ACCOUNTS_KEY)) ?? [];
  }

  private emit(user: AuthUser | null) {
    this.listeners.forEach((cb) => cb(user));
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return kv.get<AuthUser>(SESSION_KEY);
  }

  async signUpWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<AuthUser> {
    const accounts = await this.accounts();
    const lower = email.toLowerCase();
    if (accounts.some((a) => a.email === lower)) {
      // Já existe — apenas autentica (dev-friendly).
      return this.signInWithEmail(email, password);
    }
    const user: AuthUser = {
      id: uid(),
      email: lower,
      name: name.trim() || nameFromEmail(email),
    };
    accounts.push({ ...user, password });
    await kv.set(ACCOUNTS_KEY, accounts);
    await kv.set(SESSION_KEY, user);
    this.emit(user);
    return user;
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<AuthUser> {
    const accounts = await this.accounts();
    const lower = email.toLowerCase();
    const found = accounts.find((a) => a.email === lower);
    if (found) {
      if (found.password && found.password !== password) {
        throw new Error("Senha incorreta.");
      }
      const user: AuthUser = {
        id: found.id,
        email: found.email,
        name: found.name,
      };
      await kv.set(SESSION_KEY, user);
      this.emit(user);
      return user;
    }
    // Conta inexistente: no modo mock, cria na hora (sem fricção).
    return this.signUpWithEmail(email, password, nameFromEmail(email));
  }

  async signInWithProvider(provider: OAuthProvider) {
    // Simula login social criando/recuperando uma conta determinística.
    const email = `${provider}-user@desinflama.app`;
    await this.signInWithEmail(email, "");
  }

  async signOut() {
    await kv.remove(SESSION_KEY);
    this.emit(null);
  }

  async deleteAccount() {
    const current = await this.getCurrentUser();
    if (current) {
      const accounts = await this.accounts();
      await kv.set(
        ACCOUNTS_KEY,
        accounts.filter((a) => a.id !== current.id)
      );
    }
    await kv.remove(SESSION_KEY);
    this.emit(null);
  }

  onAuthChange(cb: (u: AuthUser | null) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

/* ------------------------------ Supabase ------------------------------ */

export class SupabaseAuthService implements AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    const sb = await getSupabase();
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data.user ? toAuthUser(data.user) : null;
  }

  async signUpWithEmail(email: string, password: string, name: string) {
    const sb = await getSupabase();
    if (!sb) throw new Error("Supabase não configurado.");
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(traduzErro(error.message));
    if (!data.user) throw new Error("Confirme seu e-mail para continuar.");
    return toAuthUser(data.user);
  }

  async signInWithEmail(email: string, password: string) {
    const sb = await getSupabase();
    if (!sb) throw new Error("Supabase não configurado.");
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(traduzErro(error.message));
    return toAuthUser(data.user);
  }

  async signInWithProvider(provider: OAuthProvider) {
    const sb = await getSupabase();
    if (!sb) throw new Error("Supabase não configurado.");
    const { Capacitor } = await import("@capacitor/core");
    const redirectTo = Capacitor.isNativePlatform()
      ? "com.desinflama.app://auth-callback"
      : `${window.location.origin}/inicio/`;
    await sb.auth.signInWithOAuth({ provider, options: { redirectTo } });
  }

  async signOut() {
    const sb = await getSupabase();
    await sb?.auth.signOut();
  }

  async deleteAccount() {
    // A exclusão definitiva exige uma Edge Function com service role
    // (configurada na Fase 12). Aqui encerramos a sessão.
    const sb = await getSupabase();
    await sb?.auth.signOut();
  }

  onAuthChange(cb: (u: AuthUser | null) => void) {
    let unsub = () => {};
    getSupabase().then((sb) => {
      if (!sb) return;
      const { data } = sb.auth.onAuthStateChange((_e, session) => {
        cb(session?.user ? toAuthUser(session.user) : null);
      });
      unsub = () => data.subscription.unsubscribe();
    });
    return () => unsub();
  }
}

function toAuthUser(u: {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}): AuthUser {
  return {
    id: u.id,
    email: u.email ?? "",
    name: u.user_metadata?.name ?? nameFromEmail(u.email ?? "você"),
  };
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(msg)) return "Este e-mail já tem conta.";
  if (/password/i.test(msg)) return "A senha precisa ter ao menos 6 caracteres.";
  return msg;
}
