# AvenGO v1.7.0 Engineering Handoff

> 语言原型说明：`prototype-en.html` 是独立、无持久化的英文 UI 术语与布局预览，不读取或写入 `workout-log`，也不是正式 App 的第二套业务实现。后续 EN/CN 应采用展示层 i18n：actuals 使用稳定 exerciseId，历史中文键与 done 数组仍须兼容，不能直接翻译存储键或复制两套业务逻辑。

## 1. 项目概述

AvenGO 是一个移动端优先的个人训练记录工具，面向希望用较低决策成本持续训练的人。主要场景是在家或公寓健身房单手查看今天的组合、动作指令和上次实际值，并立即记录重量、次数与 RIR。

产品不再绑定特定用户。`AvenGO` 是品牌名；用户可选填本机称呼，留空时标题为“今天练什么”。核心原则是：选择权属于用户，账本和建议只提供参考；休息、有氧或空白都不代表失败。

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
        "weight": 13,                // 可选 number；所有力量动作统一使用 lb
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
      "minutes": 20,                 // 可选 number
      "reading": "阻力 6 · 3200m"    // 可选 string；有氧器械控制台读数
    },
    "venue": "other",              // 可选：home | my_gym | other
    "venueLabel": "朋友家",         // 可选；仅 venue === "other" 时使用
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
- `state` 不能改历史值。新 UI 只提供 `green → 完整`、`amber → 精简`；`red` 只作为“轻量（旧记录）”读取。有氧日使用既有 `strength:false`，不会把旧 `red` 重解释成有氧。
- 新字段全部可选；未知字段在 JSON 导入、保存过程中保留。
- 切换模板、休息或有氧日不得删除 `day`、`doneA`、`doneB`、`doneExercises`、`selectedExercises` 或 `actuals`。
- 旧动作名是历史关联键。新实际值用稳定 ID；`readExerciseActual` 优先读 ID，缺失才读对应旧名称；`writeExerciseActual` 不删除旧名称键，保留未知字段。同日两种键并存时，ID 版本是当前值，旧键是保留的原始数据，不应重复计数。
- `doneExercises` / `doneA` / `doneB` / `selectedExercises` 仍是动作名数组，不能直接改成模式或实现组。`completedNames` 仅在读旧 actuals-only 记录时把 ID 还原为动作名，其余判定不变。
- `exerciseChoices[templateId][slotId]` 为具体 ID 或 `null`。支持替代实现的分化计划用顶部一键 Home/Gym 按钮批量写入各槽位，不另存全局状态；这些槽位缺失选择时以模板原动作作为默认。Gym Full Body A/B 本身全为 Gym 动作，不显示整套位置切换。旧日已勾选的实现仍显示，切换不删另一实现的数据。Chest Press / Incline Press 仍使用独立按钮与 ID。
- Gym 重量统一按 lb 记录，但不跨机器/动作换算，也不套用哑铃档位。初次使用器械重量为空。新增动作一律使用独立 ID，不能把 `machine_chest_press` 和 `machine_incline_press` 合并。
- `venue` / `venueLabel` 只是日期级记录：缺失时 UI 显示“未记录”，不推断为 `home`；仅填场地不算活动，不更新日历标记、统计、账本或建议。

### 3.3 动作元数据

`MOVEMENT_META` 为每个动作提供 `pattern`，推 / 拉动作另有 `subPattern`：

- 主模式：`squat`、`hinge`、`push`、`pull`。
- 次要模式：`core`、`carry`、`accessory`，只记录、不提醒。
- 子模式：`horizontal`、`vertical`，仅用于 push / pull。

模式元数据属于代码内动作定义，不重复写进每天的日志。CSV 导出时会展开为 `pattern` / `sub_pattern` 列。

`EXERCISE_IDS` 管理稳定身份和历史名称映射；`GYM_MOVEMENTS` 现有十一个实现；`ALTERNATIVE_IDS` 定义可替代槽位。相同 `pattern` 不等于同一个动作。当前俯卧 T 与侧平举仍为 `accessory`，对应 Cable 变体沿用这一归属。器械 / 龙门架详情比普通六段多一个置顶 `setup` 字段；Cable Row 名称与 `cable_row` ID 不变，但设置文案明确指向 Dual Row 坐姿划船机。

`fullA` / `fullB` 是稳定的历史模板 ID，当前内容已覆盖为 Gym Full Body A/B，不能另建平行 Gym 模板。旧 Home Full Body 记录不迁移：既有 `doneExercises`、名称键 actuals 与 ID 键 actuals 全部保留，展示标题会标为旧家庭记录。Gym A/B 全部是器械 / 龙门架动作；Chest / Incline 在 Gym B 同一槽位二选一但历史独立。

### 3.4 自定义动作目录

`coach-card-custom-exercises` 保存独立目录。每项含不可变 `custom_<uuid>`、可修改 `name`、查重用 `normalizedName`、可空的 `pattern` / `subPattern` 与 `prepNeeds`。初始化时先读目录并建立 ID 注册表，再读取训练日志；目录不会写进 `workout-log`，也不迁移旧记录。

- 名称使用 NFKC、trim、连续空白折叠和小写进行查重；与内置动作同名时直接复用内置 ID。
- 模式留空必须存 `null`；它不更新四大模式账本，但有重量的具体动作仍按 exerciseId 进入重量趋势。
- 改名保留同一 ID，并把旧显示名作为只读别名解释历史完成数组；不改写旧日期。
- 每个自定义动作的实际值与 Home / Gym / 其他自定义动作完全隔离。

### 3.5 可选称呼与备份

`coach-card-profile`：`{ "displayName": "可选称呼" }`。它与训练日志分开存储。

JSON envelope：

```js
{
  "format": "avengo-backup",
  "version": 6,
  "exportedAt": "本地日期字符串",
  "profile": { "displayName": "可选" },
  "reviews": [ /* 可选，本机 AI 复盘历史，最多 12 条 */ ],
  "customExercises": [ /* 自定义动作目录；含未知扩展字段 */ ],
  "log": { "YYYY-MM-DD": {} }
}
```

导入接受 v6、旧 v2–v5 envelope 和历史裸日期字典；按日期合并，同日期由导入记录覆盖，其余保留。自定义定义先按 ID、再按 `normalizedName` 合并；异 ID 同名复用本机 ID，并重写本次导入日志里的对应引用。AI 复盘按 ID 合并并最多保留 12 条。CSV 一行对应一个日期 / 已记录动作，包含 `venue` / `venue_label`；完整未知字段仍由 JSON 保存。

### 3.6 AI 复盘本机数据

- `coach-card-ai-reviews`：数组，最多 12 条。单条字段为 `id`、`createdAt`、`cacheKey`、`model`、`text`。只保存生成结果，不复制训练摘要。
- `coach-card-ai-client`：随机本机 ID，仅用于 Worker 的每设备限流，不是身份认证，也不会转发给模型。
- JSON 完整备份包含 `reviews`；训练日志 key `workout-log` 不变。

## 4. 状态管理与关键逻辑

- `loadLog` / `saveLog`：仅读写 `workout-log`，try/catch 降级。
- `dateKey`：本地日期 key 的唯一实现。
- `entryMode` / `hasStrengthActivity` / `hasActivity`：兼容推断记录事实，不做评价。
- `PLAN`：旧 A/B 计划与历史剂量；必须保留以解释旧记录。
- `MOVEMENT_META` / `LIBRARY_ITEMS`：模式元数据与新模板共享的动作库。
- `TEMPLATES`：模板库；`templateIdForEntry` 负责新旧映射。v1.5 未新增模板；`resolvedPlanForEntry` 在渲染时解析具体实现，不修改模板与日志原数据。
- Lower Hinge 保留主 RDL；单侧槽默认 B-stance，单腿为二选一的次级替代。Pull 坐姿拉力带划船为 optional，完整档不自动加入。`exerciseChoiceHTML` / `bindExerciseChoices` 在首页与日历复用同一选择逻辑。
- `PREP_NEEDS_BY_ID` 为每个内置 / Gym 动作显式声明准备需求；自定义动作从目录读取。`derivedPreparationActions` 只基于当前启用动作生成通用热身和练后舒展，按 `dynamic → mobility`、需求计数和固定顺序排序，分别最多 5 项。`specificWarmupTargets` 另列每个主要模式中的首个主要复合动作。三块都没有勾选、跳过状态或写入日志。
- `venueHistoryLabels` 只从既有日期的 `venueLabel` 去重提取，不建立场地数据库；场地字段不会被 `hasActivity` 读取。
- `loadCustomExercises` / `registerCustomDefinition` / `createCustomExercise` / `renameCustomExercise` 管理自定义目录与运行时动作库。`movementMeta` 必须允许自定义 `pattern:null`，不得回退成 Accessory。
- 新增动作：哑铃侧平举、提踵 / 单腿提踵、毛巾滑动腿弯举、农夫行走 / Suitcase March、收下巴、颈部四向等长。Accessory 使用现有 `blocks` 分组，没有新增日志字段；Carry 只记录，不进入四大模式间隔提醒。
- `defaultActual` 的优先级必须保持为：当天 `actuals`（由渲染层先读取）→ `lastActual` 的完整历史实际值 → `prescribedActual` 从当前完整 / 精简剂量解析出的推荐组数和次数。历史轻量剂量仍保留读取。不得再用当前档位覆盖已有历史实际值。
- `completionSourceForEntry` 按数据年代只读取一套完成字段，但不得用 `templateId` 过滤已经勾选的动作：旧版日历编辑可能让模板字段与真实动作错位。`completedNames` 只返回有依据的动作名，不得再次无条件合并 `doneExercises` / `doneA` / `doneB`。`patternsForEntry` 只为真正缺少完成数组的旧记录做模式级回退，且不得伪造具体动作；显式空数组不代表整套模板完成。`displayTemplateIdForEntry` 仅在主动作明确属于单一模式且与存储模板完全不相交时修正展示，不写回历史数据。
- `patternLedger`：计算 Squat / Hinge / Push / Pull 最近日期，不存派生统计。Lower Squat / Lower Hinge / Push / Pull 分化日只更新各自主模式，辅助动作不重置其他模式；Full Body、自由组合与旧版复合模板按实际完成动作覆盖的模式更新。
- `subPatternReminder`：只有在已有足够历史且水平 / 垂直子模式间隔至少约 14 天时给温和提示。
- `recentStrengthCount` / `renderRecommendation`：读取最近 10 天力量次数与账本间隔，只改建议文案；所有模板不锁定。
- `renderPlan`：根据模板、自由组合和投入程度渲染动作；输入即时保存。
- `prescribedActual` / `recommendedEntryActual`：没有当前值或同一 exerciseId 的上次值时，从所在模板的当前档位解析组次。所有档位都遵守“当天输入 → 该具体动作上次值 → 当前推荐值”，不可从另一个实现借用默认值。器械首次重量为空。
- `progressionHint`：读取同一 exerciseId 历史 actuals；Home 与 Gym 都参与判断。Gym 只建议按机器最小可用档位调整，不虚构档位，不写入状态。
- `BODYWEIGHT_PROGRESSIONS`：徒手动作连续达到上限时给负重、慢离心或更难变式建议；臀桥和徒手深蹲可额外记录重量。
- `ELASTIC_PROGRESSIONS` / `elasticProgressionHint`：固定拉力带动作按“每组加 1–2 次至上限 → 加 1 组但最多 4 组 → 缩短有效带长或末端停顿”进阶，不使用重量字段，也不建议更换更重的带子。触发只看历史 actuals 与 RIR，不根据推算的月经阶段自动改变训练量。
- `renderPatternLedger`：模式超过 10 天或已有历史但从未出现时增加“可优先考虑”中性标记。
- `buildCoachReviewSummary`：只整理最近 8 周力量动作（含被记录的自定义动作名称）、实际值、每周次数 / 工作组和模式间隔，不读取场地、称呼、经期、有氧或备注。
- 摘要带 exerciseId，所有力量重量标注为 lb；Worker prompt 要求 Gym 动作进入同 ID 趋势分析，同时禁止跨 ID 比较、合并两种推胸、虚构机器档位或引导去 Gym。未扩大 AI 上传范围、调用时机或账本统计规则。
- `generateAIReview`：仅由按钮触发；按摘要 hash 查本机缓存，显式“重新生成”才绕过缓存。超时、网络或 API 错误只更新状态文案。
- `worker/src/index.js`：通过 `env.AI` 使用固定的 Cloudflare Workers AI 模型、system prompt、输出上限、请求大小、精确 CORS 和两级限流；前端不能传任意模型请求体。
- `enforceEquipmentGuard`：模型返回后的确定性护栏；若 AI 直接建议跳到 3/9/13/19lb 的下一档，或建议固定拉力带换更大张力 / 更紧的带子，会删除该处方并替换为对应的渐进顺序。不要仅靠 prompt 约束替代它。
- `renderDayDetail`：过去日期可选模板 / 自由组合、动作、实际值、RIR、场地；有氧始终独立，并支持可选 `aerobic.reading`。
- `refreshHistoryDerivedViews`：日历补录、取消、清除或修改实际值后，统一重绘首页账本 / 建议与记录页趋势 / 周柱状图；返回「今天」页时也会再次同步。
- `renderCalendar` / `renderStats` / `buildReport`：以事实记录和模式计数，不计算达标率。
- `latestDataText`：只读扫描全部现有日期，按具体 exerciseId 取每个动作最新实际值，按有氧类型取最新记录，并附模式间隔和最近经期；“复制最新数据”不生成四周流水账，也不写回日志。
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
- 自定义动作创建、准备需求与改名控件集中在自由组合 picker，功能完整但信息密度较高；未分类动作单独位于“我添加的”，不会被暗中归入 Accessory。
- 过去日期编辑器信息密度较高；需重点回归模板下拉、动作实际值与有氧在窄屏的排列。
- 新实现选择采用原生 select + 次级折叠区；保留既有极简风格，只加必要布局。英文 prototype 已同步 Gym Full Body A、Dual Row、器械设置与复制最新数据的术语，但仍是无持久化静态预览。
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
- 发送给 AI 的范围不得扩展到场地、称呼、经期、有氧、备注或完整备份。当前唯一新增边界是：精简力量摘要中出现的自定义动作会发送其名称，界面必须持续明示。
- 周期建议使用“大约 / 倾向”语言，不作医疗断言。
- 不引入外部字体、网络资源、框架、CDN 或构建步骤。
- 不新增本需求以外的功能，不构建训练量数据库、社交、成就或压力机制。
- Gym Full Body A/B 是 `fullA` / `fullB` 的当前配置；其余支持替代实现的模板仍可一键切换 Home/Gym。不推荐去 Gym，也不因未选器械而提示。没有确认的器械不新增，未指定变体的动作保持原状。
- 热身和 Accessory 不构成开始主训练的门槛，不显示跳过警示、空缺标记或完成度。
- 练后舒展不得写“促进恢复、减少酸痛、加速代谢、维持关节活动度”等功效表述；热身、专项热身与舒展都可直接跳过且不留痕迹。

## 7. 易损点与回归清单

- 禁止修改 `workout-log` key；禁止清空 localStorage 或 destructive migration。
- 禁止用 `toISOString()` 生成日期。
- `TEMPLATES` 依赖 `LIBRARY_ITEMS`，动作库又复用 `DETAILS`；改声明顺序时要测试脚本初始化。
- `state` 与剂量键仍是历史内部值，不能因 UI 文案改名而改存储。
- 每个原子动作详情必须保留 `start / breath / tempo / sequence / feel / errors`；器械 / 龙门架动作还必须保留置顶 `setup`；组合动作的每个 `subs` 子动作也要完整。已有非器械动作上的 `needsReview:true` 不能在视觉调整中删除。
- 新增颈部动作必须继续保持低强度、无位移和停止条件，不得改成最大力量对抗，也不得根据周期阶段自动调整。
- 模式账本以显式完成动作作为新记录的事实来源；只有缺少完成数组的旧记录才回退读取 `actuals`。`strength:false` 或 `dayType:"rest"` 必须覆盖遗留动作字段；仅选择模板或取消动作后不应虚增模式次数。
- “超过 10 天”只改变账本边框与“可优先考虑”文字，不得变成警告色、进度条或未完成状态。
- RIR 是可选值；旧 actuals 没有 RIR 时不得显示 `undefined`。
- AI 缓存只由训练摘要决定；同一摘要普通生成不调 API，重新生成才调用。复盘文本渲染必须继续 HTML 转义。
- Worker 必须拒绝非 `https://guoxinyi0811.github.io` Origin、非 POST/OPTIONS、超长摘要和超限请求；上游错误不得把 key 或响应体回传前端。
- JSON 导入必须继续接受 v2–v5 和裸日期对象，并保留所有未知可选字段；v6 必须完整备份自定义目录。
- 自定义动作导入按“同 ID 覆盖 → 同 normalizedName 复用本机 ID → 其余追加”，并同步映射 imported log 的 actuals、完成数组和 choices；不得批量改本机旧 actuals 键。
- 回归 Gym Full Body A/B、计划级 Home/Gym 一键切换与十一个 Gym 实现：历史、默认值、组次、RIR、趋势、CSV 与 AI 摘要独立；Chest / Incline Press 必须三路隔离（包括 Home 上斜俯卧撑），Home / cable Pallof 也必须隔离。
- 回归“复制最新数据”：每个动作按 exerciseId 只出现最新值，Home/Gym 不混；每个有氧类型只出现最新记录；clipboard 失败时显示可全选文本框。
- 回归旧记录：缺 `dayType` / `actuals` / `aerobic` / `note` / `period`、旧 A/B、旧 `dayType:"aero"`。
- 回归主流程：所有模板、自由组合、完整 / 精简与旧轻量读取、动作勾选、刷新保留、RIR、渐进提示、力量 + 有氧同日、只记有氧、休息 + 有氧。
- 回归记录页：过去日模板与自由组合补录、月历与账本同步、模式统计、CSV 列、JSON 新旧导入、周期推算、趋势与周柱状图。
- 回归动态准备：所有动作均有显式 `prepNeeds`；当前启用动作增减会实时更新；通用 / 舒展各不超过 5 项；专项区不含固定百分比；跳过不写日志。
- 回归场地与自定义动作：场地-only 日期安静保留；CSV 两列齐全；空模式不更新账本但重量趋势保留；改名不断历史；备份清空再导入可恢复目录与实际值；AI 摘要不含场地。
- 回归体验：375px 今天页 / 记录页 / 展开详情 / 编辑器无横向溢出，键盘焦点清楚，控制台无报错。
- 回归 AI：未配置、超时、非 2xx、成功、缓存命中、重新生成、历史显示、v4/v5/v6 备份导入；任一失败时本地规则仍正常。

自动测试：`node tests/exercise-layer.test.mjs` 与 `node worker/test.mjs`。本轮验证及设备限制见 [动作层修订记录](docs/action-layer.md)。
