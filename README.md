# AvenGO

Current stable version: **v1.3.0** · [Release notes](https://github.com/guoxinyi0811/AvenGO/releases/tag/v1.3.0)

## English

AvenGO is a calm, mobile-first home-training log for strength, cardio, and cycle-aware reference. It tracks Squat, Hinge, Push, and Pull patterns while leaving every training choice to the user. No account or build step is required.

### Try it

[Open the main app (Chinese)](https://guoxinyi0811.github.io/AvenGO/) · [View the English UI prototype](https://guoxinyi0811.github.io/AvenGO/prototype-en.html)

The English prototype is a separate, non-persistent preview for reviewing wording and layout. It does not read or change records in the main app.

### Features

- Flexible strength templates and free exercise combinations, with Full, Compact, and Light options.
- Six-part movement guidance: setup, breathing, tempo, force sequence, correct sensation, and common errors.
- Weight, sets, reps, RIR, cardio, notes, calendar, trends, and optional cycle reference.
- Calf, knee-flexion hamstring, middle-deltoid, loaded-carry, and gentle neck-accessory coverage.
- Local progression hints, including fixed-band progression through reps, sets, band length, or pauses.
- Optional, user-triggered eight-week AI review through Cloudflare Workers AI.
- Full JSON backup and restore, plus CSV export.

In v1.3.0, six templates were rebalanced with lateral raises, calf raises, sliding hamstring curls, loaded carries, chin tucks, and gentle four-way neck isometrics. The existing movement-ledger architecture remains backward compatible.

### Install

- **iPhone/iPad:** Open the [main app](https://guoxinyi0811.github.io/AvenGO/) in Safari → Share → Add to Home Screen.
- **Android:** Open the main app in Chrome → browser menu → Install app or Add to Home screen.
- **Desktop:** Use the web app directly, or install it when the browser offers that option.

The current version has no Service Worker, so reopening it offline is not guaranteed. Export a JSON backup before changing devices or clearing browser data.

### Data and privacy

Training records stay in browser `localStorage` under `workout-log`. Normal use does not upload them. AI review runs only after the user requests it and sends a compact eight-week strength summary; it excludes the display name, cycle records, cardio, notes, and full backups. Local coaching rules continue to work without the network.

### Run locally

The project uses plain HTML, CSS, and JavaScript with zero dependencies and no build step.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

### Documentation

- [HANDOFF.md](HANDOFF.md): architecture, data model, compatibility constraints, and regression checklist.
- [CHANGELOG.md](CHANGELOG.md): release and iteration history.
- [worker/README.md](worker/README.md): Workers AI deployment and privacy boundaries.

### License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. See [LICENSE](LICENSE).

---

## 中文

AvenGO 是一个平静、移动端优先的家庭训练记录工具，覆盖力量、有氧与可选的周期参考。它记录 Squat、Hinge、Push、Pull 四大动作模式，但所有训练选择仍由用户决定。无需账号，也没有构建步骤。

### 在线体验

[打开中文版正式应用](https://guoxinyi0811.github.io/AvenGO/) · [查看独立英文界面原型](https://guoxinyi0811.github.io/AvenGO/prototype-en.html)

英文原型仅用于确认术语与排版，不保存数据，也不会读取或改动正式应用中的训练记录。

### 主要功能

- 灵活的力量训练模板与自由动作组合，并提供完整、精简、轻量三档投入程度。
- 六段动作指令：起始姿势、呼吸、节奏、发力顺序、做对的感觉、常见错误。
- 记录重量、组数、次数、RIR、有氧、备注、月历、趋势与可选周期参考。
- 补充小腿、腘绳肌屈膝、三角肌中束、负重行走与轻量颈部辅助训练。
- 本地渐进负荷提示；固定拉力带通过增加次数、组数、缩短有效长度或停顿来进阶。
- 用户主动触发的八周 AI 复盘，由 Cloudflare Workers AI 提供。
- 完整 JSON 备份与恢复，以及 CSV 导出。

`v1.3.0` 调整了六个模板，加入侧平举、提踵、毛巾滑动腿弯举、负重行走、收下巴与轻量颈部四向等长；动作账本架构与旧数据保持兼容。

### 安装

- **iPhone/iPad：** 用 Safari 打开[正式应用](https://guoxinyi0811.github.io/AvenGO/) → 分享 → 添加到主屏幕。
- **Android：** 用 Chrome 打开正式应用 → 浏览器菜单 → 安装应用或添加到主屏幕。
- **桌面浏览器：** 可直接使用网页版；浏览器支持时也可选择安装。

当前版本尚无 Service Worker，不能保证断网后重新打开。更换设备或清理浏览器数据前，请先导出 JSON 备份。

### 数据与隐私

训练记录保存在浏览器 `localStorage` 的 `workout-log` 中，日常使用不会上传。AI 复盘只在用户主动生成时运行，并仅发送最近八周的精简力量摘要；称呼、周期记录、有氧、备注与完整备份不会发送。无网络时，本地建议仍可使用。

### 本地运行

项目使用原生 HTML、CSS 与 JavaScript，零依赖、零构建。

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

### 文档

- [HANDOFF.md](HANDOFF.md)：架构、数据结构、兼容约束与回归清单。
- [CHANGELOG.md](CHANGELOG.md)：版本与迭代记录。
- [worker/README.md](worker/README.md)：Workers AI 部署方式与隐私边界。

### License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. 详见 [LICENSE](LICENSE)。
