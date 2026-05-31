/**
 * Gera as ilustrações da marca via MUAPI (flux-dev) a partir de
 * scripts/art-manifest.json e salva em public/img/{id}.png. Idempotente:
 * pula o que já existe. Requer MUAPI_API_KEY no ambiente.
 *
 *   node scripts/gen-art.mjs            # gera os que faltam
 *   node scripts/gen-art.mjs --force    # regera tudo
 */
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.MUAPI_API_KEY;
if (!KEY) {
  console.error("MUAPI_API_KEY ausente no ambiente.");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const BASE = "https://api.muapi.ai/api/v1";
const root = process.cwd();
const DEFAULT_STYLE =
  "Soft minimal flat vector illustration, single centered subject filling most of the frame, flat warm cream background color #FAF7F2, palette of sage green #4FB286, coral #F2856D and warm terracotta, gentle rounded organic shapes, smooth subtle shading, no text, no words, no letters, no border, no frame, calm premium wellness brand, modern app illustration";
const manifestPath =
  process.argv.find((a) => a.endsWith(".json")) || "scripts/art-manifest.json";
const raw = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
const manifest = Array.isArray(raw)
  ? { style: DEFAULT_STYLE, aspect_ratio: "1:1", items: raw }
  : raw;
const outDir = path.join(root, "public/img");
fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gen(item) {
  const file = path.join(outDir, `${item.id}.png`);
  if (fs.existsSync(file) && !FORCE) {
    console.log("skip ", item.id);
    return true;
  }
  const prompt = `${manifest.style}. Subject: ${item.prompt}.`;
  const res = await fetch(`${BASE}/flux-dev-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": KEY },
    body: JSON.stringify({
      prompt,
      aspect_ratio: manifest.aspect_ratio || "1:1",
    }),
  });
  const j = await res.json();
  if (!j.request_id) {
    console.error("FAIL ", item.id, JSON.stringify(j).slice(0, 200));
    return false;
  }
  let url = null;
  for (let i = 0; i < 40; i++) {
    await sleep(2500);
    const r = await fetch(`${BASE}/predictions/${j.request_id}/result`, {
      headers: { "x-api-key": KEY },
    });
    const rj = await r.json();
    if (rj.status === "completed") {
      url = rj.outputs?.[0];
      break;
    }
    if (rj.status === "failed" || rj.error) {
      console.error("ERR  ", item.id, rj.error);
      return false;
    }
  }
  if (!url) {
    console.error("TIMEOUT", item.id);
    return false;
  }
  const img = await fetch(url);
  const buf = Buffer.from(await img.arrayBuffer());
  fs.writeFileSync(file, buf);
  console.log("ok   ", item.id, `${Math.round(buf.length / 1024)}kb`);
  return true;
}

let ok = 0;
for (const item of manifest.items) {
  try {
    if (await gen(item)) ok++;
  } catch (e) {
    console.error("EXC  ", item.id, String(e).slice(0, 120));
  }
}
console.log(`done: ${ok}/${manifest.items.length}`);
