# AvenGO

## English

AvenGO is a calm, mobile-first home-training log. It tracks Squat, Hinge, Push, and Pull patterns, then lets you freely choose a template or build your own session. Training data stays on the current device.

### Prototype

[Open AvenGO](https://guoxinyi0811.github.io/AvenGO/)

Typical flow: check when each movement pattern was last trained → choose a template or free combination → select Full, Compact, or Light → record weight, sets, reps, and RIR. Cardio can be logged with strength training or on its own.

### Features

- Movement-pattern ledger with optional coverage suggestions.
- Full Body A/B, Push, Pull, Lower Squat, Lower Hinge, Accessory, and custom sessions.
- Six-part movement guidance: setup, breathing, tempo, force sequence, correct sensation, and common errors.
- Weight, sets, reps, RIR, cardio, cycle reference, notes, calendar, and trends.
- Local progression hints and an optional, user-triggered eight-week AI review.
- Full JSON backup/restore and CSV export.

### Install

No account or app store is required.

- **iPhone/iPad:** Open the prototype in Safari → Share → Add to Home Screen.
- **Android:** Open it in Chrome → browser menu → Install app or Add to Home screen.
- **Desktop:** Use the web version directly, or select the install option when the browser offers it.

The current version has no Service Worker, so reopening the app offline is not guaranteed. Export a JSON backup before changing devices or clearing browser data.

### Local development

The project uses plain HTML, CSS, and JavaScript with no dependencies or build step.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

### Data and privacy

Training records are stored in browser `localStorage` under `workout-log`. They are not uploaded during normal use.

AI review runs only after the user presses Generate. It sends a compact eight-week strength summary through a Cloudflare Worker: movements, weight, sets, reps, RIR, weekly frequency, and pattern gaps. It excludes the display name, cycle records, cardio, notes, and full backups. Local coaching rules continue to work without the network or cloud allocation.

### Documentation

- [HANDOFF.md](HANDOFF.md): data model, core logic, compatibility constraints, and regression checklist.
- [CHANGELOG.md](CHANGELOG.md): iteration history.
- [worker/README.md](worker/README.md): Workers AI deployment and security boundaries.

### License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. See [LICENSE](LICENSE).

---

## 中文

AvenGO 是一个平静、移动端优先的家庭训练记录工具。它记录 Squat、Hinge、Push、Pull 四大动作模式，再由用户自由选择模板或组合训练；日常数据保存在当前设备。

### 在线示例

[打开 AvenGO](https://guoxinyi0811.github.io/AvenGO/)

典型流程：查看各动作模式距上次记录的时间 → 选择模板或自由组合 → 按体感选择完整、精简或轻量 → 记录重量、组数、次数与 RIR。有氧可以与力量同日，也可以单独记录。

### 主要功能

- 动作模式账本与非强制的覆盖建议。
- Full Body A/B、Push、Pull、Lower Squat、Lower Hinge、Accessory 与自由组合。
- 六段动作指令：起始姿势、呼吸、节奏、发力顺序、做对的感觉、常见错误。
- 重量、组数、次数、RIR、有氧、周期参考、备注、月历与趋势。
- 本地渐进负荷提示，以及用户主动生成的八周 AI 复盘。
- 完整 JSON 备份/恢复与 CSV 导出。

### 安装

无需账号或应用商店。

- **iPhone/iPad：** 用 Safari 打开在线示例 → 分享 → 添加到主屏幕。
- **Android：** 用 Chrome 打开 → 浏览器菜单 → 安装应用或添加到主屏幕。
- **桌面浏览器：** 可直接使用在线版；浏览器支持时也可选择安装。

当前版本没有 Service Worker，不能保证断网后重新打开。更换设备或清理浏览器数据前，请先导出 JSON 备份。

### 本地运行

项目使用原生 HTML、CSS 与 JavaScript，零依赖、零构建。

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

### 数据与隐私

训练记录保存在浏览器 `localStorage` 的 `workout-log` 中，日常使用不会上传。

AI 复盘仅在用户点击“生成复盘”后运行。它通过 Cloudflare Worker 发送最近八周的精简力量摘要，包括动作、重量、组次、RIR、每周频率与模式间隔；不发送称呼、经期、有氧、备注或完整备份。没有网络或云端额度时，本地规则仍可正常使用。

### 文档

- [HANDOFF.md](HANDOFF.md)：数据结构、关键逻辑、兼容约束与回归清单。
- [CHANGELOG.md](CHANGELOG.md)：迭代记录。
- [worker/README.md](worker/README.md)：Workers AI 部署与安全边界。

### License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. 详见 [LICENSE](LICENSE)。
