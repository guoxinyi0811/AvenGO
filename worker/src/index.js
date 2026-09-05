const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const MAX_SUMMARY_CHARS = 12000;

const SYSTEM_PROMPT = `你是一位家庭力量训练教练。基于用户提供的训练记录，给出简洁、具体、可执行的中文复盘。

分析要点：
1. 渐进负荷：哪些动作重量或难度停滞，下一次可尝试什么具体数字或变式。
2. 训练平衡：Squat、Hinge、Push、Pull 中哪个模式间隔较久。
3. 进步趋势：明确指出哪些动作在增加重量、次数或工作组。
4. 下次训练：给出动作、重量或难度、组数和次数。
5. 总量变化：只根据每周力量次数和已记录工作组描述趋势，不虚构缺失数据。

风格要求：
- 像教练在训练旁给简短反馈，不写流水账。
- 尽量具体到数字；没有足够数据时明确说记录不足。
- 客观直接，不夸张，不评价意志力或自律程度。
- 不施压、不说教，不使用“达标”“失败”“应该更努力”等措辞。
- 训练量波动是正常的；所有建议都允许用户按体感调整。
- 中文回复，300 字以内。

器械硬规则（优先级最高）：哑铃只有 3/9/13/19 lb，所有相邻档位增幅都超过 30%。绝对不要直接建议从 3→9、9→13 或 13→19 lb。达到当前重量上限时，具体建议每组增加 1–2 次、下放放慢到 3–4 秒，或选择适合该动作的变式。只有摘要明确记录了可用的中间重量时，才可以建议该中间重量。

动作身份规则：家庭训练是默认，不建议去 Gym，也不因没选 Gym 作提示。摘要里的 exerciseId 各自拥有独立历史，只比较同一 ID；共享 Squat / Hinge / Push / Pull 不代表能共享重量或换算负荷。machine_chest_press 与 machine_incline_press 是两个动作，不能混合。器械重量只按机器显示的重量记录，不假定单位、档位、增量或套用哑铃档位。双侧 RDL 可持续作为主负荷动作；B-stance 与单腿 RDL 是单侧控制的二选一，单腿是 B-stance 稳定后的替代，不是淘汰双侧 RDL。

固定拉力带硬规则：用户当前不能更换更重或更紧的拉力带。拉力带坐姿划船、拉力带下拉、Pallof press、弹力带肩外旋 / T 字和阻力圈蚌式，不得建议“换更大张力”“换更紧带”或虚构磅数。进阶顺序是：每组加 1–2 次至动作上限 → 加 1 组但最多 4 组 → 小幅缩短有效带长或在收紧位置停 1–2 秒。用 RIR 与当天实际体感决定是否采用，不根据月经阶段自动升降训练量。

不要用“很不错”“保持这种趋势”等空泛鼓励收尾；把字数留给下一次训练的具体安排。

安全：若重量或次数突然下降，或长时间中断后恢复，建议渐进恢复，不直接回到此前最高负荷。不要提供医疗诊断。`;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function json(origin, data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}

function enforceEquipmentGuard(text) {
  const directStep = /(?:尝试|增加|加重|加到|升到|上到|换到|改用|建议)[^\n。！？；]{0,42}(?:3|9|13|19)\s*lb/i;
  const nextStep = /(?:下次|下一次)[^\n。！？；]{0,60}(?:3|9|13|19)\s*lb/i;
  const arrowStep = /(?:3|9|13|19)\s*lb\s*(?:→|到|-)\s*(?:3|9|13|19)\s*lb/i;
  const loadPrescription = /^\s*[*•-]?\s*[^：:\n]{1,24}[：:]\s*(?:3|9|13|19)\s*lb/i;
  const elasticLoad = /(?:(?:换|用|改用|升级)[^\n。！？；]{0,18}(?:更大张力|更强|更紧|重阻力)[^\n。！？；]{0,12}(?:拉力带|弹力带|阻力圈)|(?:拉力带|弹力带|阻力圈)[^\n。！？；]{0,18}(?:换|升级|增加)[^\n。！？；]{0,12}(?:张力|阻力|重量))/i;
  let dumbbellRemoved = false, elasticRemoved = false;
  const keptRaw = text.split(/\r?\n/).filter(line => {
    const riskyDumbbell = directStep.test(line) || nextStep.test(line) || arrowStep.test(line) || loadPrescription.test(line);
    const riskyElastic = elasticLoad.test(line);
    if (riskyDumbbell) dumbbellRemoved = true;
    if (riskyElastic) elasticRemoved = true;
    return !riskyDumbbell && !riskyElastic;
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!dumbbellRemoved && !elasticRemoved) return text.trim();
  let listIndex = 0;
  const kept = keptRaw.replace(/^\s*\d+\.\s+/gm, () => `${++listIndex}. `);
  const guards = [];
  if (dumbbellRemoved) guards.push("器械跨度提醒：3/9/13/19 lb 相邻档位增幅较大；下次先保持当前重量，每组加 1–2 次、下放 3–4 秒，或按体感换更难变式，不直接跳档。");
  if (elasticRemoved) guards.push("固定拉力带提醒：先保持当前带子，每组加 1–2 次；到次数上限后再加 1 组（最多 4 组），之后可小幅缩短有效带长或增加 1–2 秒末端停顿。");
  return `${guards.join("\n")}${kept ? `\n\n${kept}` : ""}`;
}

async function withinLimit(binding, key) {
  if (!binding || typeof binding.limit !== "function") return true;
  const result = await binding.limit({ key });
  return result && result.success === true;
}

export default {
  async fetch(request, env) {
    const allowedOrigin = String(env.ALLOWED_ORIGIN || "").replace(/\/$/, "");
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (!allowedOrigin || origin !== allowedOrigin) {
      return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    if (url.pathname !== "/review") return json(origin, { error: "Not found" }, 404);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== "POST") return json(origin, { error: "Method not allowed" }, 405);
    if (!(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) return json(origin, { error: "Content-Type must be application/json" }, 415);

    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > 20000) return json(origin, { error: "Request too large" }, 413);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 20000) return json(origin, { error: "Request too large" }, 413);
      body = JSON.parse(raw);
    }
    catch (error) { return json(origin, { error: "Invalid JSON" }, 400); }

    const summary = typeof body.summary === "string" ? body.summary.trim() : "";
    const clientId = typeof body.clientId === "string" ? body.clientId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128) : "anonymous";
    if (!summary || summary.length > MAX_SUMMARY_CHARS) return json(origin, { error: "Invalid summary" }, 400);

    const [deviceAllowed, globalAllowed] = await Promise.all([
      withinLimit(env.DEVICE_RATE_LIMITER, clientId || "anonymous"),
      withinLimit(env.GLOBAL_RATE_LIMITER, "all-reviews")
    ]);
    if (!deviceAllowed || !globalAllowed) return json(origin, { error: "Please wait before generating another review" }, 429);
    if (!env.AI || typeof env.AI.run !== "function") return json(origin, { error: "AI service is not configured" }, 503);

    let data;
    try {
      data = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `请复盘以下训练摘要。不要推断摘要中没有的人口或健康信息。\n\n${summary}` }
        ],
        max_tokens: 800,
        temperature: 0.3
      });
    } catch (error) {
      console.error("Workers AI request failed", error instanceof Error ? error.message : "unknown error");
      return json(origin, { error: "AI analysis is temporarily unavailable" }, 502);
    }

    const choiceText = Array.isArray(data && data.choices)
      ? data.choices.map(choice => {
          const content = choice && choice.message && choice.message.content;
          if (typeof content === "string") return content;
          if (Array.isArray(content)) return content.map(part => part && (part.text || part.content) || "").join("\n");
          return "";
        }).join("\n").trim()
      : "";
    const text = typeof (data && data.response) === "string" ? data.response.trim() : choiceText;
    if (!text) return json(origin, { error: "Empty AI response" }, 502);
    return json(origin, { text: enforceEquipmentGuard(text).slice(0, 5000), model: data && data.model || MODEL });
  }
};
