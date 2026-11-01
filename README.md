# AvenGO

Current app version: **v1.7.1** · [Changelog](CHANGELOG.md)

## English

AvenGO is a calm, mobile-first training log for strength, cardio, and optional cycle reference. It tracks Squat, Hinge, Push, and Pull while leaving every choice to the user. No account or build step is required.

### Try it

[Open the main app (Chinese)](https://guoxinyi0811.github.io/AvenGO/) · [View the English UI prototype](https://guoxinyi0811.github.io/AvenGO/prototype-en.html)

The English prototype is a separate, non-persistent preview for reviewing wording and layout. It does not read or change records in the main app.

### Features

- Gym Full Body A/B, split templates, and free combinations; choose Full, Compact, Rest, or Cardio day.
- One-tap Home/Gym switching in supported plans; every concrete exercise keeps separate history.
- Six-part movement guidance; machine and cable movements add a practical equipment-setup section.
- Weight, sets, reps, RIR, cardio machine readings, notes, calendar, trends, and optional cycle reference.
- Warm-up and optional post-training stretches are derived from the movements currently enabled that day; neither creates completion state.
- Optional venue recording and a reusable custom-exercise catalog with independent exercise IDs.
- Free combination includes confirmed standalone machines for hip abduction, calf extension, leg curl, leg extension, and rear delts; each keeps its own load history.
- Local progression hints, including fixed-band progression through reps, sets, band length, or pauses.
- Optional, user-triggered eight-week AI review through Cloudflare Workers AI.
- Copy the latest value for every exercise and cardio type; full JSON backup/restore and CSV export remain available.

Gym exercises are included in load evaluation without mixing Home and Gym histories.

### Install

- **iPhone/iPad:** Open the [main app](https://guoxinyi0811.github.io/AvenGO/) in Safari → Share → Add to Home Screen.
- **Android:** Open the main app in Chrome → browser menu → Install app or Add to Home screen.
- **Desktop:** Use the web app directly, or install it when the browser offers that option.

The current version has no Service Worker, so reopening it offline is not guaranteed. Export a JSON backup before changing devices or clearing browser data.

### Data and privacy

Training records stay in browser `localStorage` under `workout-log`; custom definitions use `coach-card-custom-exercises`. Normal use uploads nothing. AI review runs only when requested and sends a compact eight-week strength summary, including custom exercise names when present. Venue, display name, cycle records, cardio, notes, and full backups are excluded. Local coaching rules continue to work without the network.

### Run locally

The project uses plain HTML, CSS, and JavaScript with zero dependencies and no build step.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

### Documentation

- [HANDOFF.md](HANDOFF.md): architecture, data model, compatibility constraints, and regression checklist.
- [CHANGELOG.md](CHANGELOG.md): release and iteration history.
- [Action-layer revision](docs/action-layer.md): exercise IDs, compatibility decisions, and verification.
- [worker/README.md](worker/README.md): Workers AI deployment and privacy boundaries.

### License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. See [LICENSE](LICENSE).

---

## 中文

AvenGO 是一个平静、移动端优先的训练记录工具，覆盖力量、有氧与可选周期参考。它记录 Squat、Hinge、Push、Pull 四大动作模式，但所有选择仍由用户决定。无需账号，也没有构建步骤。

### 在线体验

[打开中文版正式应用](https://guoxinyi0811.github.io/AvenGO/) · [查看独立英文界面原型](https://guoxinyi0811.github.io/AvenGO/prototype-en.html)

英文原型仅用于确认术语与排版，不保存数据，也不会读取或改动正式应用中的训练记录。

### 主要功能

- Gym Full Body A/B、分化模板与自由组合，提供完整、精简、休息和有氧日。
- 支持的计划可一键切换在家或健身房；每个具体动作的历史独立。
- 动作指令固定六段；器械与龙门架动作另有可执行的“器械设置”。
- 记录重量、组数、次数、RIR、有氧器械读数、备注、月历、趋势与可选周期参考。
- 热身与可选练后舒展按当天当前启用的动作动态生成，不产生完成或跳过状态。
- 可选记录场地；可建立自定义动作目录，每个具体动作保留独立 ID 与历史。
- 自由组合补充髋外展、Calf Extension、Leg Curl、Leg Extension 与 Rear Delt 器械；每台机器分别保存负重历史。
- 本地渐进负荷提示；固定拉力带通过增加次数、组数、缩短有效长度或停顿来进阶。
- 用户主动触发的八周 AI 复盘，由 Cloudflare Workers AI 提供。
- 可复制每个动作和有氧类型的最新值；同时保留完整 JSON 备份/恢复与 CSV 导出。

Gym 动作纳入重量评估，但不与在家动作混用历史。

### 安装

- **iPhone/iPad：** 用 Safari 打开[正式应用](https://guoxinyi0811.github.io/AvenGO/) → 分享 → 添加到主屏幕。
- **Android：** 用 Chrome 打开正式应用 → 浏览器菜单 → 安装应用或添加到主屏幕。
- **桌面浏览器：** 可直接使用网页版；浏览器支持时也可选择安装。

当前版本尚无 Service Worker，不能保证断网后重新打开。更换设备或清理浏览器数据前，请先导出 JSON 备份。

### 数据与隐私

训练记录保存在浏览器 `localStorage` 的 `workout-log` 中；自定义动作目录使用 `coach-card-custom-exercises`。日常使用不会上传数据。AI 复盘只在用户主动生成时运行，并发送最近八周的精简力量摘要；若有自定义动作，会包含其名称。场地、称呼、周期记录、有氧、备注与完整备份不会发送。无网络时，本地建议仍可使用。

### 本地运行

项目使用原生 HTML、CSS 与 JavaScript，零依赖、零构建。

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

### 文档

- [HANDOFF.md](HANDOFF.md)：架构、数据结构、兼容约束与回归清单。
- [CHANGELOG.md](CHANGELOG.md)：版本与迭代记录。
- [动作层修订](docs/action-layer.md)：动作 ID、兼容决策与验证记录。
- [worker/README.md](worker/README.md)：Workers AI 部署方式与隐私边界。

### License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. 详见 [LICENSE](LICENSE)。
