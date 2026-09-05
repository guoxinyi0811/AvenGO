import assert from "node:assert/strict";
import worker from "./src/index.js";

const origin = "https://guoxinyi0811.github.io";
const limiter = { async limit() { return { success: true }; } };
let captured;
const ai = {
  async run(model, input) {
    captured = { model, input };
    return { model, choices: [{ message: { content: "下次深蹲可先每组加 1 次。" } }] };
  }
};
const baseEnv = { ALLOWED_ORIGIN: origin, AI: ai, DEVICE_RATE_LIMITER: limiter, GLOBAL_RATE_LIMITER: limiter };

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

const unconfigured = await worker.fetch(new Request("https://worker.example/review", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ summary: "test", clientId: "device-test" }) }), { ...baseEnv, AI: null });
assert.equal(unconfigured.status, 503);

const oversized = await worker.fetch(new Request("https://worker.example/review", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ summary: "x".repeat(12001), clientId: "device-test" }) }), baseEnv);
assert.equal(oversized.status, 400);

const response = await worker.fetch(new Request("https://worker.example/review", {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({ summary: "训练记录：深蹲 9lb 3×10", clientId: "device-test" })
}), baseEnv);
assert.equal(response.status, 200);
assert.equal(captured.model, "@cf/meta/llama-3.1-8b-instruct-fast");
assert.equal(captured.input.max_tokens, 800);
assert.match(captured.input.messages[0].content, /300 字以内/);
assert.match(captured.input.messages[0].content, /绝对不要直接建议/);
assert.match(captured.input.messages[0].content, /固定拉力带硬规则/);
assert.match(captured.input.messages[0].content, /不根据月经阶段自动升降训练量/);
assert.match(captured.input.messages[0].content, /只比较同一 ID/);
assert.match(captured.input.messages[0].content, /machine_chest_press 与 machine_incline_press/);
assert.match(captured.input.messages[0].content, /不建议去 Gym/);
assert.match(captured.input.messages[0].content, /不假定单位、档位、增量/);
assert.match(captured.input.messages[0].content, /不是淘汰双侧 RDL/);
assert.match(captured.input.messages[1].content, /深蹲 9lb/);
const data = await response.json();
assert.equal(data.text, "下次深蹲可先每组加 1 次。");

const alternate = await worker.fetch(new Request("https://worker.example/review", {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({ summary: "训练记录：肩推 3lb 3×10", clientId: "device-test" })
}), { ...baseEnv, AI: { async run() { return { response: "肩推可先保持重量并放慢下放。" }; } } });
assert.equal((await alternate.json()).text, "肩推可先保持重量并放慢下放。");

const guarded = await worker.fetch(new Request("https://worker.example/review", {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({ summary: "训练记录：深蹲 9lb 3×12", clientId: "device-guard" })
}), { ...baseEnv, AI: { async run() { return { response: "1. 进展稳定。\n2. 高脚杯深蹲：尝试增加重量到 13lb，保持 3×12。\n3. 下次可安排髋铰链训练。" }; } } });
const guardedData = await guarded.json();
assert.doesNotMatch(guardedData.text, /13lb/);
assert.match(guardedData.text, /每组加 1–2 次/);
assert.match(guardedData.text, /髋铰链/);
assert.match(guardedData.text, /2\. 下次可安排髋铰链/);

const bandGuarded = await worker.fetch(new Request("https://worker.example/review", {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({ summary: "训练记录：拉力带坐姿划船 3×15 RIR 4", clientId: "device-band-guard" })
}), { ...baseEnv, AI: { async run() { return { response: "1. 拉力带坐姿划船：下次换更大张力的拉力带，做 3×12。\n2. Pull 模式本周出现 2 次。" }; } } });
const bandGuardedData = await bandGuarded.json();
assert.doesNotMatch(bandGuardedData.text, /更大张力/);
assert.match(bandGuardedData.text, /每组加 1–2 次/);
assert.match(bandGuardedData.text, /最多 4 组/);
assert.match(bandGuardedData.text, /Pull 模式/);

console.log("worker tests passed");
