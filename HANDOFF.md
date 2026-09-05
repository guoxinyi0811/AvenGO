# AvenGO v1.4.1 Engineering Handoff

> 语言原型说明：`prototype-en.html` 是独立、无持久化的英文 UI 术语与布局预览，不读取或写入 `workout-log`，也不是正式 App 的第二套业务实现。后续 EN/CN 应采用展示层 i18n：actuals 使用稳定 exerciseId，历史中文键与 done 数组仍须兼容，不能直接翻译存储键或复制两套业务逻辑。

## 1. 项目概述

AvenGO 是一个移动端优先的家庭训练记录工具，面向希望用较低决策成本持续训练的人。主要场景是在瑜伽垫或哑铃旁单手查看今天的组合、动作指令和上次实际值，并立即记录重量、次数与 RIR。

产品不再绑定特定用户。`AvenGO` 是品牌名；用户可选填本机称呼，留空时标题为“今天练什么”。核心原则是：选择权属于用户，账本和建议只提供参考；休息、轻量或空白都不代表失败。

## 2. 技术栈与文件结构

- `index.html`：完整应用；原生 JavaScript + 内联 CSS，包含动作资料、模板、渲染、存储、导入导出和 SVG 图表。
- `manifest.json`：PWA manifest。
- `avengo-mark.png`：favicon、Apple touch icon 与 manifest 图标。
- `README.md`：使用、安装、本地运行、隐私与 License 入口。
- `CHANGELOG.md`：迭代记录。
- `docs/action-layer.md`：本轮动作配置、Home/Gym ID 对照、兼容与验收记录。
- `tests/exercise-layer.test.mjs`：直接运行应用脚本的内存回归测试，不读取用户数据。
- `LICENSE`：项目授权文本。
- `worker/`：Cloudflare Worker 代理、Wrangler 配置、无依赖测试与部署说明。它不是 GitHub Pages 的构建步骤。
- 无框架、无 npm 依赖、无 CDN、无构建步骤。建议通过静态服务器运行。
- GitHub Pages 从 `main` 根目录发布。
- 当前没有 Service Worker，因此安装到主屏幕不等于可靠离线；不要在文档中写成保证离线。

## 3. 数据结构完整说明

### 3.1 训练日志

`localStorage` key 固定为 `workout-log`，值是日期到记录对象的 JSON 字典。日期必须用本地时区生成 `YYYY-MM-DD`，禁止用 `toISOString()`。

```js
{
  "2026-08-11": {
    "dayType": "train",             // 可选："train" | "rest"；历史还可能是 "aero"
    "strength": true,                // 可选：当天是否安排力量；false 可与 aerobic 共存
    "templateId": "fullA",          // 可选：见模板 ID；自由组合为 "custom"
    "selectedExercises": [],         // 可选 string[]；自由组合选择的动作名
    "doneExercises": ["高脚杯深蹲"], // 可选 string[]；新模板完成的动作名
    "state": "amber",               // 可选：历史值 green | amber | red
    "completed": true,               // 可选：是否显式记录这次力量训练
    "actuals": {
      "goblet_squat": {             // v1.4 新写入使用 exerciseId；旧动作名仍可读取
        "weight": 13,                // 可选 number；Home 使用 lb，Gym 为机器显示值
        "sets": 3,                   // 可选 number
        "reps": [10, 10, 9],         // 可选 number 或 number[]
        "rir": 3                     // 可选 number；快捷档代表值通常为 1 / 3 / 5
      }
    },
    "exerciseChoices": {            // 可选；只记录这个日期在各模板的实现选择
      "fullA": {
        "goblet_squat": "goblet_squat" // slot ID -> 所选 exerciseId；可选项可存 null（收起）
      }
    },
    "aerobic": {
      "type": "骑车",               // 可选 string
      "minutes": 20                  // 可选 number
    },
    "note": "今天下放更慢",          // 可选 string
    "period": true                   // 可选 boolean
  }
}
```

模板 ID：`fullA`、`fullB`、`push`、`pull`、`lowerSquat`、`lowerHinge`、`accessory`、`custom`。运行时还会把旧记录映射为 `legacyA` / `legacyB`，但不会写回迁移。

### 3.2 历史字段与兼容包袱

旧记录可能包含：

```js
{
  "day": "A",          // "A" | "B"
  "doneA": ["动作名"],
  "doneB": ["动作名"]
}
```

- 缺少 `dayType` 时，只要含 `day`、`state`、旧 / 新 done 数组或 actuals，读取层仍可解释为力量记录。
- `day:"A"/"B"` 分别映射 `legacyA` / `legacyB`；账本从旧动作名推断模式。
- 旧 `dayType:"aero"` 只读解释为“不安排力量 + 有氧”，不迁移、不删除原字段。
- `state` 不能改存储值。UI 映射为 `green → 完整`、`amber → 精简`、`red → 轻量`，仅使用同一中性色阶。
- 新字段全部可选；未知字段在 JSON 导入、保存过程中保留。
- 切换模板、休息或暂不安排不得删除 `day`、`doneA`、`doneB`、`doneExercises`、`selectedExercises` 或 `actuals`。
- 旧动作名是历史关联键。新实际值用稳定 ID；`readExerciseActual` 优先读 ID，缺失才读对应旧名称；`writeExerciseActual` 不删除旧名称键，保留未知字段。同日两种键并存时，ID 版本是当前值，旧键是保留的原始数据，不应重复计数。
- `doneExercises` / `doneA` / `doneB` / `selectedExercises` 仍是动作名数组，不能直接改成模式或实现组。`completedNames` 仅在读旧 actuals-only 记录时把 ID 还原为动作名，其余判定不变。
- `exerciseChoices[templateId][slotId]` 为具体 ID 或 `null`，不存全局 Home/Gym 状态；缺失时 Home 默认，可选项默认收起。旧日已勾选的实现仍显示；切换实现不删另一实现的数据。详情编辑器把不在当前槽位的旧已记录动作列为“既有记录”。
- Gym 重量不假设 lb/kg，不跨机器/动作换算，也不套用哑铃档位。初次使用器械重量为空。新增动作一律使用独立 ID，不能把 `machine_chest_press` 和 `machine_incline_press` 合并。

### 3.3 动作元数据

`MOVEMENT_META` 为每个动作提供 `pattern`，推 / 拉动作另有 `subPattern`：

- 主模式：`squat`、`hinge`、`push`、`pull`。
- 次要模式：`core`、`carry`、`accessory`，只记录、不提醒。
- 子模式：`horizontal`、`vertical`，仅用于 push / pull。

模式元数据属于代码内动作定义，不重复写进每天的日志。CSV 导出时会展开为 `pattern` / `sub_pattern` 列。

`EXERCISE_IDS` 管理稳定身份和历史名称映射；`GYM_MOVEMENTS` 限定九个实现；`ALTERNATIVE_IDS` 定义可替代的槽位。相同 `pattern` 不等于同一个动作。当前俯卧 T 与侧平举仍为 `accessory`，对应 Cable 变体沿用这一归属，避免改变账本含义。器械说明按六段结构保守编写，全部带 `needsReview:true`，不能假称已确认现场座椅、把手和规格。

### 3.4 可选称呼与备份

`coach-card-profile`：`{ "displayName": "可选称呼" }`。它与训练日志分开存储。

JSON envelope：

```js
{
  "format": "avengo-backup",
  "version": 5,
  "exportedAt": "本地日期字符串",
  "profile": { "displayName": "可选" },
  "reviews": [ /* 可选，本机 AI 复盘历史，最多 12 条 */ ],
  "log": { "YYYY-MM-DD": {} }
}
```

导入接受 v5、旧 v2/v3/v4 envelope 和历史裸日期字典；按日期合并，同日期由导入记录覆盖，其余保留。AI 复盘按 ID 合并并最多保留 12 条。CSV 一行对应一个日期 / 已记录动作；无动作的日期仍输出有氧、周期、备注等日期级字段。v1.4 保留原列顺序并追加 `exercise_id`、`weight_recorded`、`weight_basis`；器械的旧 `weight_lb` 列留空，`weight_basis` 为 `machine_display`，Home 为 `lb`。完整的未勾选实际值与未知字段仍由 JSON 保存。

### 3.5 AI 复盘本机数据

- `coach-card-ai-reviews`：数组，最多 12 条。单条字段为 `id`、`createdAt`、`cacheKey`、`model`、`text`。只保存生成结果，不复制训练摘要。
- `coach-card-ai-client`：随机本机 ID，仅用于 Worker 的每设备限流，不是身份认证，也不会转发给模型。
- JSON 完整备份包含 `reviews`；训练日志 key `workout-log` 不变。

## 4. 状态管理与关键逻辑

- `loadLog` / `saveLog`：仅读写 `workout-log`，try/catch 降级。
- `dateKey`：本地日期 key 的唯一实现。
- `entryMode` / `hasStrengthActivity` / `hasActivity`：兼容推断记录事实，不做评价。
- `PLAN`：旧 A/B 计划与历史剂量；必须保留以解释旧记录。
- `MOVEMENT_META` / `LIBRARY_ITEMS`：模式元数据与新模板共享的动作库。
- `TEMPLATES`：模板库；`templateIdForEntry` 负责新旧映射。v1.4 修订 Lower Hinge / Pull 的槽位剂量，并扩充 Accessory，不新增模板。`resolvedPlanForEntry` 在渲染时解析具体实现，不修改模板与日志原数据。
- Lower Hinge 保留主 RDL；单侧槽默认 B-stance，单腿为二选一的次级替代。Pull 坐姿拉力带划船为 optional，完整档不自动加入。`exerciseChoiceHTML` / `bindExerciseChoices` 在首页与日历复用同一选择逻辑。
- 通用准备 2–5 分钟与主动作轻重量准备使用 `preparationHTML`，没有勾选框；旧热身数据仍保留。Accessory 汇集现有活动度、核心、肩背、下肢、颈部和负重稳定动作；每项默认收起，隐藏整次力量记录按钮。
- 新增动作：哑铃侧平举、提踵 / 单腿提踵、毛巾滑动腿弯举、农夫行走 / Suitcase March、收下巴、颈部四向等长。Accessory 使用现有 `blocks` 分组，没有新增日志字段；Carry 只记录，不进入四大模式间隔提醒。
- `defaultActual` 的优先级必须保持为：当天 `actuals`（由渲染层先读取）→ `lastActual` 的完整历史实际值 → `prescribedActual` 从当前完整 / 精简 / 轻量剂量解析出的推荐组数和次数。不得再用当前档位覆盖已有历史实际值。
- `completionSourceForEntry` 按数据年代只读取一套完成字段，但不得用 `templateId` 过滤已经勾选的动作：旧版日历编辑可能让模板字段与真实动作错位。`completedNames` 只返回有依据的动作名，不得再次无条件合并 `doneExercises` / `doneA` / `doneB`。`patternsForEntry` 只为真正缺少完成数组的旧记录做模式级回退，且不得伪造具体动作；显式空数组不代表整套模板完成。`displayTemplateIdForEntry` 仅在主动作明确属于单一模式且与存储模板完全不相交时修正展示，不写回历史数据。
- `patternLedger`：计算 Squat / Hinge / Push / Pull 最近日期，不存派生统计。Lower Squat / Lower Hinge / Push / Pull 分化日只更新各自主模式，辅助动作不重置其他模式；Full Body、自由组合与旧版复合模板按实际完成动作覆盖的模式更新。
- `subPatternReminder`：只有在已有足够历史且水平 / 垂直子模式间隔至少约 14 天时给温和提示。
- `recentStrengthCount` / `renderRecommendation`：读取最近 10 天力量次数与账本间隔，只改建议文案；所有模板不锁定。
- `renderPlan`：根据模板、自由组合和投入程度渲染动作；输入即时保存。
- `prescribedActual` / `recommendedEntryActual`：没有当前值或同一 exerciseId 的上次值时，从所在模板的当前档位解析组次。所有档位都遵守“当天输入 → 该具体动作上次值 → 当前推荐值”，不可从另一个实现借用默认值。器械首次重量为空。
- `progressionHint`：读取同动作历史 actuals；相同重量连续达到计划上限或 RIR ≥ 4 时显示一次行内建议，不写入状态。
- `BODYWEIGHT_PROGRESSIONS`：徒手动作连续达到上限时给负重、慢离心或更难变式建议；臀桥和徒手深蹲可额外记录重量。
- `ELASTIC_PROGRESSIONS` / `elasticProgressionHint`：固定拉力带动作按“每组加 1–2 次至上限 → 加 1 组但最多 4 组 → 缩短有效带长或末端停顿”进阶，不使用重量字段，也不建议更换更重的带子。触发只看历史 actuals 与 RIR，不根据推算的月经阶段自动改变训练量。
- `renderPatternLedger`：模式超过 10 天或已有历史但从未出现时增加“可优先考虑”中性标记。
- `buildCoachReviewSummary`：只整理最近 8 周力量动作、实际值、每周次数 / 工作组和模式间隔，不读取称呼、经期、有氧或备注。
- 摘要带 exerciseId，机器重量标注为显示值；Worker prompt 同步禁止跨 ID 比较、合并两种推胸、虚构机器规格或引导去 Gym。未扩大 AI 上传范围、调用时机或账本统计规则。
- `generateAIReview`：仅由按钮触发；按摘要 hash 查本机缓存，显式“重新生成”才绕过缓存。超时、网络或 API 错误只更新状态文案。
- `worker/src/index.js`：通过 `env.AI` 使用固定的 Cloudflare Workers AI 模型、system prompt、输出上限、请求大小、精确 CORS 和两级限流；前端不能传任意模型请求体。
- `enforceEquipmentGuard`：模型返回后的确定性护栏；若 AI 直接建议跳到 3/9/13/19lb 的下一档，或建议固定拉力带换更大张力 / 更紧的带子，会删除该处方并替换为对应的渐进顺序。不要仅靠 prompt 约束替代它。
- `renderDayDetail`：过去日期可选模板 / 自由组合、动作、实际值、RIR；有氧始终独立。
- `refreshHistoryDerivedViews`：日历补录、取消、清除或修改实际值后，统一重绘首页账本 / 建议与记录页趋势 / 周柱状图；返回「今天」页时也会再次同步。
- `renderCalendar` / `renderStats` / `buildReport`：以事实记录和模式计数，不计算达标率。
- `backupPayload` / `buildCSV` / `doImport`：完整 JSON、兼容导入与行式 CSV。
- 状态直接保存在 `log[dateKey]` 对象并立即 `saveLog()`；没有框架状态层。

### 4.1 渐进规则的证据边界

- ACSM 2026 阻力训练立场文件强调一致训练、个体化负荷 / 训练量，以及弹力带等非传统器械同样可以产生有效适应；本 App 因此不把“可加哑铃重量”视为唯一进阶方式：<https://acsm.org/resistance-training-guidelines-update-2026/>。
- 弹力带阻力随带长和伸长率变化，研究支持用感知用力程度监控强度；本 App 以 RIR 和可完成次数作为固定带子的可执行代理：<https://pubmed.ncbi.nlm.nih.gov/22210471/>。
- 女性训练适应研究支持阻力训练本身的有效性，但月经周期与表现研究不足以形成统一阶段处方；因此渐进规则不读取周期阶段，只让当天体感覆盖建议：<https://pubmed.ncbi.nlm.nih.gov/31820374/>、<https://pubmed.ncbi.nlm.nih.gov/32661839/>。
- 侧平举用于补充三角肌中束；动作选择依据来自肩部训练激活综述：<https://pubmed.ncbi.nlm.nih.gov/39593452/>。
- 毛巾滑动腿弯举补的是 RDL 未直接覆盖的屈膝功能；髋主导与膝主导腘绳肌训练不应被当成完全同一个动作功能：<https://pubmed.ncbi.nlm.nih.gov/40085810/>。
- Carry 采用双侧农夫或单侧 Suitcase 版本；研究显示二者均增加躯干参与，单侧版本另有不对称稳定需求：<https://pubmed.ncbi.nlm.nih.gov/38665162/>。
- 女性 deadlift 研究显示握力带可增加完成次数并减少握力下降，但它仍是可选工具，不作为自动加重规则：<https://pubmed.ncbi.nlm.nih.gov/37729509/>。
- 颈部动作按 NHS 的温和后缩与低强度等长版本编写，并保留 `needsReview:true`；出现头晕、麻木、放射痛或尖锐痛时停止：<https://www.nbt.nhs.uk/our-services/a-z-services/emergency-zone/ed-miu-patient-information/neck-injuries>、<https://msk-bexley.nhs.uk/conditions/neck-pain/cervical-myelopathy>。
- “先加每组次数，再加一组，最后调整有效带长 / 停顿”是结合上述证据、当前固定器械和降低决策成本所做的产品级推断，不是女性专属生理公式，也不是医疗建议。

## 5. UI 现状与已知不足

- 当前是安静的极简 / 侘寂视觉层：暖矿物白、炭灰文字、柔和鼠尾草灰强调、发丝分隔线；没有 zine 拼贴、纹理或高饱和洋红主导。
- 新账本、建议、模板网格、自由动作 picker 与 RIR chips 已沿用现有视觉 token，但只做了功能所需布局，仍可继续做纯 UI 细修。
- 模板较多，375px 下会形成多行网格；必须保留所有选项直接可见，不能用“锁定 / 解锁”折叠。
- 自由组合动作较多，当前按模式分组的 chip 列表偏长。这是功能范围内的直接实现；后续若调整只能优化排版，不能增加搜索、收藏等新功能。
- 过去日期编辑器信息密度较高；需重点回归模板下拉、动作实际值与有氧在窄屏的排列。
- 新实现选择采用原生 select + 次级折叠区；保留既有极简风格，只加必要布局。英文 prototype 本轮未同步新控件，仍是静态术语预览。
- `renderDayDetailLegacy` 是保留的旧实现，当前未调用；不要把它误接回入口，否则会绕过新实际值适配器。
- 单文件已较长。可以在未来拆成无构建的 ES modules，但不能在纯 UI 轮次顺手重构业务。
- AI 卡片沿用现有极简视觉。生产 Worker 已部署到 `avengo-coach.guoxinyi0811.workers.dev/review`，完整 URL 保存在 `avengo-ai-endpoint` meta；更换账号子域或 Worker 名称时必须同步修改并回归 CORS。

## 6. 设计约束（必须遵守）

- 移动端优先；375px 不横向溢出，触控目标至少 44×44px。
- 三档投入程度保持中性同色系，不得恢复红 / 黄 / 绿交通灯。
- 禁止“达标 / 未达标 / 状态差 / 硬撑 / 连胜”等评价或施压措辞。
- 休息是正常记录；没有有氧时不显示空位、提醒或视觉标记。
- 账本与渐进提示只给建议，不弹窗、不警告、不锁定用户选择。
- AI 只能由用户主动调用；不得自动、定时或因打开记录页而产生 API 请求。
- 不得把 `.dev.vars`、Cloudflare token 或任何共享 secret 写入前端和 Git 历史；Workers AI binding 本身不需要应用内 API key。
- 发送给 AI 的范围不得扩展到称呼、经期、备注或完整备份，除非未来得到用户新的明确同意。
- 周期建议使用“大约 / 倾向”语言，不作医疗断言。
- 不引入外部字体、网络资源、框架、CDN 或构建步骤。
- 不新增本需求以外的功能，不构建训练量数据库、社交、成就或压力机制。
- 家庭是默认；Gym 只作为同模式的可选实现，不推荐去 Gym，不因未选器械而提示。没有确认的器械不新增，未指定变体的动作保持原状。
- 热身和 Accessory 不构成开始主训练的门槛，不显示跳过警示、空缺标记或完成度。

## 7. 易损点与回归清单

- 禁止修改 `workout-log` key；禁止清空 localStorage 或 destructive migration。
- 禁止用 `toISOString()` 生成日期。
- `TEMPLATES` 依赖 `LIBRARY_ITEMS`，动作库又复用 `DETAILS`；改声明顺序时要测试脚本初始化。
- `state` 与剂量键仍是历史内部值，不能因 UI 文案改名而改存储。
- 每个原子动作详情必须保留 `start / breath / tempo / sequence / feel / errors`；组合动作的每个 `subs` 子动作也要完整。`needsReview:true` 不能在视觉调整中删除。
- 新增颈部动作必须继续保持低强度、无位移和停止条件，不得改成最大力量对抗，也不得根据周期阶段自动调整。
- 模式账本以显式完成动作作为新记录的事实来源；只有缺少完成数组的旧记录才回退读取 `actuals`。`strength:false` 或 `dayType:"rest"` 必须覆盖遗留动作字段；仅选择模板或取消动作后不应虚增模式次数。
- “超过 10 天”只改变账本边框与“可优先考虑”文字，不得变成警告色、进度条或未完成状态。
- RIR 是可选值；旧 actuals 没有 RIR 时不得显示 `undefined`。
- AI 缓存只由训练摘要决定；同一摘要普通生成不调 API，重新生成才调用。复盘文本渲染必须继续 HTML 转义。
- Worker 必须拒绝非 `https://guoxinyi0811.github.io` Origin、非 POST/OPTIONS、超长摘要和超限请求；上游错误不得把 key 或响应体回传前端。
- JSON 导入必须继续接受 v2/v3 和裸日期对象，并保留所有未知可选字段。
- 同时回归 v4/v5；不得批量改旧 actuals 键。旧版本不能正确编辑 ID 新数据，不应降级后编辑新备份。
- 回归九个 Home/Gym 实现：历史、默认值、组次、RIR、趋势、CSV 与 AI 摘要独立；Chest / Incline Press 必须三路隔离（包括 Home 上斜俯卧撑）。
- 回归旧记录：缺 `dayType` / `actuals` / `aerobic` / `note` / `period`、旧 A/B、旧 `dayType:"aero"`。
- 回归主流程：所有模板、自由组合、三档剂量、动作勾选、刷新保留、RIR、渐进提示、力量 + 有氧同日、只记有氧、休息 + 有氧。
- 回归记录页：过去日模板与自由组合补录、月历与账本同步、模式统计、CSV 列、JSON 新旧导入、周期推算、趋势与周柱状图。
- 回归体验：375px 今天页 / 记录页 / 展开详情 / 编辑器无横向溢出，键盘焦点清楚，控制台无报错。
- 回归 AI：未配置、超时、非 2xx、成功、缓存命中、重新生成、历史显示、v4 备份导入；任一失败时本地规则仍正常。

自动测试：`node tests/exercise-layer.test.mjs` 与 `node worker/test.mjs`。本轮验证及设备限制见 [动作层修订记录](docs/action-layer.md)。
