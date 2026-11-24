// Usage: node scripts/check-models.mjs
// Reads OPENROUTER_API_KEY from .env.local, calls every chat model in config/models.json
// with one short prompt, and prints status, latency and token usage.
// Never prints the key.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const env = { ...loadEnv(join(root, ".env.local")), ...process.env };
const config = JSON.parse(readFileSync(join(root, "config", "models.json"), "utf8"));
const key = env[config.apiKeyEnv];
if (!key) {
  console.error(`Missing ${config.apiKeyEnv}. Add it to .env.local.`);
  process.exit(1);
}

const prompt = 'Reply with exactly this JSON and nothing else: {"ok": true}';
const chatModels = config.models.filter((m) => m.chat);

for (const m of chatModels) {
  const started = Date.now();
  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: m.modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      }),
    });
    const ms = Date.now() - started;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = body?.error?.message ?? res.statusText;
      console.log(`FAIL  ${m.modelId}  HTTP ${res.status}  ${ms}ms  ${msg}`);
      continue;
    }
    const text = body?.choices?.[0]?.message?.content ?? "";
    const usage = body?.usage ? `tokens=${body.usage.total_tokens}` : "tokens=unknown";
    const jsonOk = /"ok"\s*:\s*true/.test(text);
    console.log(`${jsonOk ? "OK  " : "WARN"}  ${m.modelId}  ${ms}ms  ${usage}  reply=${JSON.stringify(text.slice(0, 80))}`);
  } catch (err) {
    console.log(`FAIL  ${m.modelId}  network error: ${err.message}`);
  }
}
