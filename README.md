# AvenGO 教练卡 · Coach Card

> 一张为在家训练设计的私人教练卡:选训练日 → 选状态 → 照着打勾 → 自动感知经期周期给建议。单文件、离线可用、数据只存在你自己的手机里。
>
> A personal at-home training companion: pick your day → pick your state → check off moves → get cycle-aware coaching. Single file, works offline, data lives only on your own device.

**🔗 App:** https://guoxinyi0811.github.io/AvenGO/

---

## 中文

### 这是什么
AvenGO 是一张给 Aven 定制的私人训练打卡卡片,面向在家训练(哑铃、拉力带、泡沫轴、瑜伽垫)、以减脂 + 改善胰岛素敏感性为目标。核心理念:**降低启动门槛,连续性比单日强度更重要**。名字致敬 Pokémon GO。

### 功能
- **两日轮换**:A 日(下肢)/ B 日(上肢+核心),按状态 🟢🟡🔴 自动调整训练量(完整 / 降级 / 只热身)。
- **日期类型分层**:训练日 / 休息日 / 有氧日;休息日是计划的一部分,不算失败。
- **动作详解**:点动作名展开预备 / 怎么动 / 对的感觉 / 常见错误。
- **实际值记录**:每个负重动作记实际重量 / 组数 / 次数,默认智能预填(优先上次值)。
- **月历与趋势**:整月打卡着色、点格子看详情、力量重量随时间的折线趋势、每周次数柱状图。
- **经期感知建议**:只需点「今天来月经了」,自动推算周期阶段(用你的个人平均周期长度),按 Stacy Sims 周期化给训练 + 营养建议。**只推荐、不锁死;身体的实际感受永远优先于算法。**
- **有氧 & 备注**:纯记录,不设门槛。
- **复制汇报**:一键生成最近 14 天纯文本摘要,粘给 AI 教练做复盘。
- **备份 / 恢复**:导出为文本或 `.json` 文件,随时导入,数据不怕丢。

### 怎么用(iPhone)
1. 用 **Safari** 打开 App 网址。
2. 分享按钮 → **添加到主屏幕**。
3. **从主屏幕图标打开**,当独立 App 用。

> 为什么必须加到主屏幕:iOS 会清空网页在浏览器标签里的存储;加到主屏幕后是独立 App,iOS 给它永久存储,数据长期保留。

### 数据与隐私
- 所有打卡数据(训练、体重、经期、备注)**只存在你手机浏览器本地(localStorage)**,不上传任何服务器。
- 本仓库只包含 App 代码,**不含任何个人记录**。
- 建议:更新或换设备前,用「记录 → 备份」导出一份。

### ⚠️ 关于经期建议
基于经期记录的推算,**仅供参考**。阶段判断用「大约 / 倾向」措辞,不做医疗诊断。身体的实际感受永远优先于算法——今天累就降,状态好就上。持续异常请记录后咨询医生。

### 技术
纯 `index.html` 单文件:原生 JavaScript + 内联 CSS,无构建步骤、无外部依赖、无框架。可安装 PWA(含 manifest 与图标)。托管在 GitHub Pages。

---

## English

### What it is
AvenGO is a personal training check-in card built for at-home workouts (dumbbells, resistance bands, foam roller, mat), aimed at fat loss and improved insulin sensitivity. Core philosophy: **lower the barrier to start — consistency matters more than any single day's intensity.** The name is an homage to Pokémon GO.

### Features
- **Two-day rotation**: Day A (lower body) / Day B (upper + core), with volume auto-adjusted by your daily state 🟢🟡🔴 (full / reduced / warm-up only).
- **Day-type layer**: Training / Rest / Cardio day. A rest day is part of the plan, never a failure.
- **Move guides**: tap a move to expand setup / how-to / what "right" feels like / common mistakes.
- **Actuals logging**: record real weight / sets / reps per lift, smart-prefilled (last session first).
- **Calendar & trends**: full-month colored history, tap a day for details, a weight-over-time line chart per lift, and a weekly-sessions bar chart.
- **Cycle-aware coaching**: just tap "period started today" — it infers your cycle phase (using your personal average cycle length) and gives Stacy-Sims-style training + nutrition guidance. **Suggestions only, never locked; how your body actually feels always overrides the algorithm.**
- **Cardio & notes**: pure logging, no targets.
- **Copy report**: one-tap 14-day plain-text summary to paste to an AI coach.
- **Backup / restore**: export to text or a `.json` file and re-import anytime.

### How to use (iPhone)
1. Open the App URL in **Safari**.
2. Share button → **Add to Home Screen**.
3. **Launch from the home-screen icon** and use it as a standalone app.

> Why Add to Home Screen matters: iOS evicts storage for pages living in browser tabs; an installed home-screen app gets durable storage, so your data persists.

### Data & privacy
- All log data (training, weight, period, notes) is stored **only in your phone's local browser storage (localStorage)** — nothing is uploaded to any server.
- This repository contains only the app code — **no personal records**.
- Tip: export a backup (Log → Backup) before updates or switching devices.

### ⚠️ About the cycle guidance
Estimates are based on your period logs and are **for reference only**. Phases are phrased as "approximately / tends to," and this is not a medical diagnosis. Your real, felt experience always takes priority over the algorithm — scale down when tired, push when strong. See a doctor if something stays abnormal.

### Tech
A single `index.html` file: vanilla JavaScript + inline CSS, no build step, no external dependencies, no framework. Installable PWA (with manifest and icons). Hosted on GitHub Pages.

---

*Built with [Claude Code](https://claude.com/claude-code).*
