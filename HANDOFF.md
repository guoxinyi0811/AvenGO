# AvenGO! UI / Engineering Handoff

## 1. 项目概述

AvenGO! Coach Card 是一个移动端优先的家庭训练记录工具，主要使用场景是在训练间隙单手查看当天计划、动作指令和上次实际值。它通过降低选择与启动成本来支持持续训练，不把休息、轻量安排或未记录项目解释为失败。

产品现在是通用工具，不再绑定某一位叫 Aven 的用户。`AvenGO!` 仅作为产品品牌保留。用户可在记录页的备份区域填写完全可选的本机称呼；留空时标题只显示“今天练什么”。

## 2. 技术栈与文件结构

- `index.html`：完整应用，原生 JavaScript + 内联 CSS；训练计划、渲染、存储、导出和图表均在此文件。
- `manifest.json`：PWA manifest。
- `avengo-mark.png`：favicon、Apple touch icon 与 manifest 安装图标。当前页面不再展示该拼贴图，避免它主导日常工具界面。
- `icon-180.png` / `icon-192.png` / `icon-512.png`：历史图标文件，当前页面与 manifest 不再引用；暂时保留以避免无关删除。
- `README.md`：用户与开发说明。
- `CHANGELOG.md`：按迭代记录行为、数据结构和视觉变化。
- 无框架、无 npm 依赖、无 CDN、无构建步骤。可直接打开，建议用静态服务器本地测试。
- GitHub Pages 从 `main` 分支根目录发布。
- 当前没有 Service Worker。Manifest 可安装不等于可靠离线；README 已明确这一限制。

## 3. 数据结构完整说明

### 主训练记录

`localStorage` key 固定为 `workout-log`，值为日期到记录对象的 JSON 字典。日期必须通过本地时区生成 `YYYY-MM-DD`，不得使用 `toISOString()`。

```js
{
  "2026-08-10": {
    "dayType": "train",        // 可选；"train" | "rest"；历史上还可能是 "aero"
    "strength": true,           // 可选；新版本的力量安排标记。false 也可与 aerobic 共存
    "day": "A",                // 可选；"A" | "B"
    "state": "amber",          // 可选；历史存储值 green | amber | red
    "completed": true,          // 可选；用户显式记录本次力量训练
    "doneA": ["高脚杯深蹲"],   // 可选；按动作名存储
    "doneB": [],                // 可选；按动作名存储
    "actuals": {                // 可选；动作名到实际值
      "高脚杯深蹲": {
        "weight": 12,           // 可选 number，lb
        "sets": 3,              // 可选 number
        "reps": [10, 10, 8],    // 可选 number 或 number[]
        "rir": 2                // 可选 number；本轮新增
      }
    },
    "aerobic": {                // 可选，与力量 / 休息独立并可同日存在
      "type": "骑车",          // 可选 string
      "minutes": 20             // 可选 number
    },
    "note": "今天节奏更慢",    // 可选 string
    "period": true              // 可选 boolean
  }
}
```

兼容包袱：

- 旧记录缺少 `dayType` 时，若含 `day` / `state` / `doneA` / `doneB`，仍解释为力量记录。
- 旧 `dayType:"aero"` 只读解释为“不安排力量 + 有氧记录”，不会自动改写或删除原字段。
- `state` 的三个历史值不能迁移或重命名；当前 UI 只把它们映射为 `green → 完整`、`amber → 精简`、`red → 轻量`，颜色使用同一中性色系。
- `actuals`、`aerobic`、`note`、`period`、`strength`、`rir` 均为可选；读取必须容忍缺失、空对象或 reps 单值 / 数组。
- 切换力量安排、休息或暂不安排时不删除已有 done / actuals，避免误操作导致历史数据损失。

### 可选称呼

`localStorage` key 为 `coach-card-profile`：

```js
{ "displayName": "可选称呼" }
```

它与训练日志分开存储，不填写时对象为空。完整 JSON 备份会包含 profile。

### 备份格式

新 JSON 导出格式：

```js
{
  "format": "avengo-backup",
  "version": 2,
  "exportedAt": "本地日期字符串",
  "profile": { "displayName": "可选" },
  "log": { "YYYY-MM-DD": { /* 原记录，不做字段裁剪 */ } }
}
```

导入同时接受上述 v2 包和历史的裸日期字典。导入为合并：同日期由导入记录覆盖，其它日期保留。CSV 一行对应一个日期 / 动作；没有动作的日期仍输出一行，包含有氧、周期和备注。

## 4. 状态管理与关键逻辑

- `loadLog` / `saveLog`：仅通过 `workout-log` 读写，try/catch 降级。
- `loadProfile` / `saveProfile`：管理可选称呼。
- `dateKey`：唯一允许的日期 key 生成方式，使用本地年月日。
- `entryMode`：兼容推断力量 / 休息 / 暂不安排，吸收旧 `dayType:"aero"`。
- `hasStrengthActivity` / `hasActivity`：只描述记录事实，不做“达标”判断。
- `PLAN`：A/B 日训练结构；剂量仍用 `g/a/r` 历史内部键，对应完整 / 精简 / 轻量。
- `DETAILS`：动作指令资料库。原子动作必须具备 `start / breath / tempo / sequence / feel / errors` 六字段；组合动作的 `subs` 中每个子动作各自具备六字段。`needsReview:true` 表示动作定义需要专业复核。
- `renderPlan`：按日别与投入程度过滤动作、渲染指令和实际值；输入即时保存。
- `renderDayDetail`：过去日期编辑器。力量安排与有氧独立；动作勾选后可编辑重量、组数、次数和 RIR。
- `renderCalendar` / `renderStats`：状态色仅用于已有力量记录；有氧只在确有记录时显示 `~`，没有有氧的日期不显示占位或提醒。
- `computeCycle` / `renderCycle`：只从 `period:true` 推算；用“大约 / 倾向”语言，不锁定训练选择。
- `backupPayload` / `buildCSV` / `doImport`：完整 JSON、CSV 和双格式兼容导入。
- 所有交互都直接修改 `log[dateKey]` 的同一对象引用并立即 `saveLog()`，没有框架状态层。

## 5. UI 现状与已知不足

- 当前采用安静的极简／侘寂视觉层：暖矿物白底、炭灰文字、发丝分隔线、柔和表面与少量鼠尾草灰强调；没有纹理图、硬阴影或复印装饰。
- 核心 token 位于 `:root`：`--paper` / `--card` / `--ink` / `--soft` / `--line*` / `--accent` / `--level-*`。`--accent:#65705D` 只用于当前选择、完成勾选、焦点与少量周期信息。
- 正文、标签与数字使用系统中文无衬线栈；只有页面标题、面板标题和趋势标题少量使用系统衬线栈。没有外部字体。
- 动作清单的勾选与展开已改为真实 button，44px 触控目标、`aria-pressed` / `aria-expanded` 和 `focus-visible` 均已补齐。
- 六段动作说明按固定标签分行，用字重和留白形成扫读层级；常见错误不用警示色。
- 数字输入使用较大字号与 tabular numerals；过去日实际值在窄屏采用两列自适应网格。
- 页面视觉不依赖网络资源；重新精修后仍需持续回归 375px 与桌面布局。
- 趋势图仍只显示带计划重量的动作；不要在纯 UI 迭代中扩展功能。
- 当前没有 Service Worker，不能把 Manifest 安装能力误写成保证离线。

## 6. 设计约束（必须遵守）

- 移动端优先，375px 宽度不得横向溢出；触控目标至少 44×44px。
- 三档投入程度必须保持中性同色系，不得恢复红 / 黄 / 绿交通灯。
- 禁止“达标 / 未达标 / 状态差 / 硬撑 / 连胜”等评价或施压语义。
- 休息是有效安排，不用负面色；无有氧记录时不显示提示、空洞或未完成标记。
- 周期建议是参考，必须使用近似措辞，用户选择始终覆盖算法。
- 当前交互强调色为低饱和鼠尾草灰；不要恢复洋红主导、交通灯色或多彩健身应用语言。
- 不引入外部字体、网络资源、框架、CDN 或构建步骤。
- UI 迭代不得新增功能、修改数据结构、改变备份语义或删除历史字段。

## 7. 改动注意事项与回归清单

- 不要修改 `workout-log` key，不要做 destructive migration，不要在任何缓存 / 安装逻辑中清理 localStorage。
- 不要用 `toISOString()` 生成日期 key；iPhone 时区会造成日期偏移。
- 不要因切换安排而删除 `doneA` / `doneB` / `actuals`；过去版本做过删除，现已改为保留。
- 改动作名会断开历史 `doneA` / `doneB` / `actuals` 的字符串关联；若必须改名，需要显式兼容别名，而不是批量迁移。
- 改详情渲染时必须保留六字段顺序和 `needsReview` 提示。
- 修改导入时必须继续接受 v2 envelope 与历史裸日期对象，并原样保存未知可选字段。
- 回归：旧记录缺字段；旧 `dayType:"aero"`；A/B 和三档剂量；今天与过去日动作保存；单值 / 数组 reps；RIR；力量 + 有氧同日；只记有氧；休息 + 有氧；无有氧无标记；JSON 新旧导入；CSV 中文与公式转义；周期推算；375px；控制台零错误。
