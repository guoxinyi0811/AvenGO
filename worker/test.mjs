import assert from "node:assert/strict";
import worker from "./src/index.js";

const origin = "https://guoxinyi0811.github.io";
const limiter = { async limit() { return { success: true }; } };
const baseEnv = { ALLOWED_ORIGIN: origin, ANTHROPIC_API_KEY: "test-only", DEVICE_RATE_LIMITER: limiter, GLOBAL_RATE_LIMITER: limiter };

const options = await worker.fetch(new Request("https://worker.example/review", { method: "OPTIONS", headers: { Origin: origin } }), baseEnv);
assert.equal(options.status, 204);
assert.equal(options.headers.get("Access-Control-Allow-Origin"), origin);

const forbidden = await worker.fetch(new Request("https://worker.example/review", { method: "POST", headers: { Origin: "https://example.com", "Content-Type": "application/json" }, body: "{}" }), baseEnv);
assert.equal(forbidden.status, 403);
assert.equal(forbidden.headers.get("Access-Control-Allow-Origin"), null);

const method = await worker.fetch(new Request("https://worker.example/review", { method: "GET", headers: { Origin: origin } }), baseEnv);
assert.equal(method.status, 405);

const limited = await worker.fetch(new Request("https://worker.example/review", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ summary: "test", clientId: "device-test" }) }), { ...baseEnv, DEVICE_RATE_LIMITER: { async limit() { return { success: false }; } } });
assert.equal(limited.status, 429);

const unconfigured = await worker.fetch(new Request("https://worker.example/review", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ summary: "test", clientId: "device-test" }) }), { ...baseEnv, ANTHROPIC_API_KEY: "" });
assert.equal(unconfigured.status, 503);

const oversized = await worker.fetch(new Request("https://worker.example/review", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ summary: "x".repeat(12001), clientId: "device-test" }) }), baseEnv);
assert.equal(oversized.status, 400);

const originalFetch = globalThis.fetch;
let captured;
globalThis.fetch = async (url, init) => {
  captured = { url, init, body: JSON.parse(init.body) };
  return new Response(JSON.stringify({ model: "claude-sonnet-4-6", content: [{ type: "text", text: "下次深蹲可先每组加 1 次。" }] }), { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  const response = await worker.fetch(new Request("https://worker.example/review", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ summary: "训练记录：深蹲 9lb 3×10", clientId: "device-test" })
  }), baseEnv);
  assert.equal(response.status, 200);
  assert.equal(captured.url, "https://api.anthropic.com/v1/messages");
  assert.equal(captured.body.model, "claude-sonnet-4-6");
  assert.equal(captured.body.max_tokens, 1500);
  assert.match(captured.body.system, /300 字以内/);
  assert.equal(captured.init.headers["x-api-key"], "test-only");
  const data = await response.json();
  assert.equal(data.text, "下次深蹲可先每组加 1 次。");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("worker tests passed");
