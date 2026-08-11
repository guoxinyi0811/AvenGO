# AvenGO! Coach Card

> 一张面向家庭训练的低压力教练卡：选择力量安排与投入程度，照着动作卡训练，并按需记录有氧、周期与备注。所有个人数据只保存在当前设备。
>
> A calm at-home training card for choosing a strength plan, checking movement guidance, and optionally logging cardio, cycle information, and notes. Personal data stays on the current device.

**App:** https://guoxinyi0811.github.io/AvenGO/

## 中文

### 主要功能

- A / B 两日力量计划；“完整 / 精简 / 轻量”使用中性投入语义，不评价当天选择。
- 每个动作提供固定六段指令：起始姿势、呼吸、节奏、发力顺序、做对的感觉、常见错误。
- 实际重量、组数、次数与可选 RIR 记录；优先带入上次实际值。
- 有氧是独立记录，可单独进行，也可与力量安排在同一天；不设目标、进度条或提醒。
- 月历可补录过去日期的动作与实际值，并查看力量趋势。
- 周期建议仅作参考，使用“大约 / 倾向”等非诊断措辞，用户选择始终优先。
- JSON 完整备份与恢复；CSV 导出用于查看或分析。
- 可选本机称呼，不填写时界面保持通用。

### 数据与隐私

- 训练、实际值、有氧、周期和备注保存在浏览器 `localStorage`，不会发送到服务器。
- 主记录 key 固定为 `workout-log`；可选称呼使用 `coach-card-profile`。
- 更新、清理浏览器数据或更换设备前，请先导出 JSON 备份。

### 安装与离线现状

项目包含 Web App Manifest，可在 iPhone Safari 中“添加到主屏幕”。当前版本尚未注册 Service Worker，因此首次加载以及浏览器缓存失效后仍需要网络；不要把它描述为保证离线可用。

### 技术与运行

原生 HTML / CSS / JavaScript，无框架、无依赖、无构建步骤。直接打开 `index.html`，或在仓库目录运行任意静态文件服务器。GitHub Pages 从 `main` 分支根目录发布。

## English

### Highlights

- A/B strength plans with neutral effort choices: Full, Compact, and Light.
- Six-part guidance for every movement: setup, breathing, tempo, force sequence, correct sensation, and common errors.
- Actual weight, sets, reps, and optional RIR, preferring the previous logged value.
- Cardio is independent and can coexist with strength on the same date; there are no goals, progress bars, or missing-entry reminders.
- Past-date movement and actual-value editing, calendar history, and strength trends.
- Cycle-aware suggestions remain approximate, non-diagnostic, and optional.
- Complete JSON backup/import plus analysis-friendly CSV export.
- Optional on-device display name; the default UI remains generic.

### Privacy

All personal records stay in browser `localStorage` and are never uploaded. The stable log key is `workout-log`; the optional display name uses `coach-card-profile`.

### Install and offline status

The repository includes a Web App Manifest and can be added to the iPhone home screen. It does not currently register a Service Worker, so a first load or an expired browser cache still requires a network connection.

### Tech

Vanilla HTML, CSS, and JavaScript with no framework, dependency, build step, or external runtime resource. GitHub Pages serves the `main` branch root.

See [HANDOFF.md](HANDOFF.md) for implementation constraints and [CHANGELOG.md](CHANGELOG.md) for iteration history.
