import type { ContextPack, ModelResult, ProviderConfig, FilePatch } from "../../contracts/types";

export async function complete(pack: ContextPack, task: string, providers: ProviderConfig[]): Promise<ModelResult> {
  for (const provider of providers) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      // treat missing key as network-type error, move on
      if (providers.indexOf(provider) === providers.length - 1) {
        return { ok: false, provider: null, modelId: null, error: { kind: "network", message: `missing api key env ${provider.apiKeyEnv}` } };
      }
      continue;
    }

    const url = provider.baseUrl.replace(/\/$/, "") + "/chat/completions";
    const body = {
      model: provider.modelId,
      messages: [
        { role: "system", content: "You are a code assistant. Return JSON only: {\"patches\":[{\"path\":string,\"newContent\":string}]}" },
        { role: "user", content: `${pack.text}\n\nTask: ${task}` },
      ],
      response_format: { type: "json_object" },
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (providers.indexOf(provider) === providers.length - 1) {
        return { ok: false, provider: null, modelId: null, error: { kind: "network", message: String(e) } };
      }
      continue;
    }

    if (res.status === 429) {
      if (providers.indexOf(provider) === providers.length - 1) {
        return { ok: false, provider: null, modelId: null, error: { kind: "quota", message: "HTTP 429" } };
      }
      continue;
    }

    // check quota message in body even on 200
    let json: any;
    try {
      json = await res.json();
    } catch {
      if (providers.indexOf(provider) === providers.length - 1) {
        return { ok: false, provider: null, modelId: null, error: { kind: "invalid_output", message: "bad json" } };
      }
      continue;
    }

    const content = json?.choices?.[0]?.message?.content ?? "";
    // quota detection
    if (typeof content === "string" && /quota|rate limit/i.test(content)) {
      if (providers.indexOf(provider) === providers.length - 1) {
        return { ok: false, provider: null, modelId: null, error: { kind: "quota", message: content } };
      }
      continue;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // invalid output: do not fall back
      return { ok: false, provider: provider.provider, modelId: provider.modelId, error: { kind: "invalid_output", message: "could not parse model output" } };
    }

    const patches: FilePatch[] = Array.isArray(parsed?.patches)
      ? parsed.patches.map((p: any) => ({ path: String(p.path), newContent: String(p.newContent) }))
      : [];

    return { ok: true, provider: provider.provider, modelId: provider.modelId, patches };
  }

  return { ok: false, provider: null, modelId: null, error: { kind: "network", message: "no providers" } };
}
