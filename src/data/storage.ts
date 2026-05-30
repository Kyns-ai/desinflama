/**
 * Camada de persistência de baixo nível.
 *
 *  - Nativo (iOS/Android): @capacitor/preferences para JSON pequeno/médio e
 *    @capacitor/filesystem para blobs (fotos).
 *  - Web/PWA: IndexedDB via idb-keyval (NUNCA localStorage — o WebView pode
 *    limpá-lo; ver plano).
 *
 * Plugins nativos são importados sob demanda para não entrarem no bundle web.
 */
import { Capacitor } from "@capacitor/core";

const native = Capacitor.isNativePlatform();

/* ----------------------------- KV (JSON) ----------------------------- */

export interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

const webKV: KVStore = {
  async get<T>(key: string) {
    const { get } = await import("idb-keyval");
    return ((await get(key)) as T | undefined) ?? null;
  },
  async set<T>(key: string, value: T) {
    const { set } = await import("idb-keyval");
    await set(key, value);
  },
  async remove(key: string) {
    const { del } = await import("idb-keyval");
    await del(key);
  },
  async keys() {
    const { keys } = await import("idb-keyval");
    return (await keys()) as string[];
  },
};

const nativeKV: KVStore = {
  async get<T>(key: string) {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : null;
  },
  async set<T>(key: string, value: T) {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value: JSON.stringify(value) });
  },
  async remove(key: string) {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.remove({ key });
  },
  async keys() {
    const { Preferences } = await import("@capacitor/preferences");
    const { keys } = await Preferences.keys();
    return keys;
  },
};

export const kv: KVStore = native ? nativeKV : webKV;

/* ----------------------------- Blobs (fotos) ----------------------------- */

export interface BlobStore {
  /** Salva um dataURL e retorna uma referência para recuperá-lo depois. */
  save(id: string, dataUrl: string): Promise<string>;
  load(ref: string): Promise<string | null>;
  remove(ref: string): Promise<void>;
}

const PHOTO_DIR = "photos";

const webBlob: BlobStore = {
  async save(id, dataUrl) {
    const { set } = await import("idb-keyval");
    const ref = `blob:${id}`;
    await set(ref, dataUrl);
    return ref;
  },
  async load(ref) {
    const { get } = await import("idb-keyval");
    return ((await get(ref)) as string | undefined) ?? null;
  },
  async remove(ref) {
    const { del } = await import("idb-keyval");
    await del(ref);
  },
};

const nativeBlob: BlobStore = {
  async save(id, dataUrl) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const path = `${PHOTO_DIR}/${id}.txt`;
    await Filesystem.writeFile({
      path,
      data: dataUrl,
      directory: Directory.Data,
      recursive: true,
    });
    return path;
  },
  async load(ref) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    try {
      const { data } = await Filesystem.readFile({
        path: ref,
        directory: Directory.Data,
      });
      return typeof data === "string" ? data : null;
    } catch {
      return null;
    }
  },
  async remove(ref) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    try {
      await Filesystem.deleteFile({ path: ref, directory: Directory.Data });
    } catch {
      /* já removido */
    }
  },
};

export const blobStore: BlobStore = native ? nativeBlob : webBlob;
