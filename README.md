# AvenGO

一个移动端优先、低压力的家庭训练记录工具。它用动作模式账本帮助你看见最近练过什么，再自由选择模板或组合动作；重量、次数、RIR、有氧、周期与备注都只保存在当前设备。

## 在线示例

[打开 AvenGO](https://guoxinyi0811.github.io/AvenGO/)

一次典型使用：看 Squat / Hinge / Push / Pull 距上次记录的天数 → 选择 Full Body、分化模板或自由组合 → 按体感选择完整 / 精简 / 轻量 → 记录动作与实际值。有氧可以与力量同日，也可以单独记录。

## 主要功能

- 四大动作模式账本与温和的覆盖建议；所有模板始终可选。
- Full Body A / B、Push、Pull、Lower Squat、Lower Hinge、Accessory 及自由组合。
- 六段动作指令：起始姿势、呼吸、节奏、发力顺序、做对的感觉、常见错误。
- 重量、组数、次数与快捷 RIR 记录，以及非强制的渐进负荷提示。
- 可选 AI 教练复盘：用户主动生成，分析最近 8 周的停滞、平衡、进步与下次安排；结果和历史保存在本机。
- 独立有氧、过去日期补录、月历、趋势、周期参考和本机称呼。
- 完整 JSON 备份 / 恢复与 CSV 导出。

## 安装

无需账号或应用商店：

- iPhone / iPad：用 Safari 打开在线示例，点“分享” → “添加到主屏幕”。
- Android：用 Chrome 打开在线示例，点浏览器菜单 → “安装应用”或“添加到主屏幕”。
- 桌面浏览器：可直接使用在线版；支持安装时，地址栏会出现安装入口。

当前版本没有 Service Worker。已打开的页面可能被浏览器临时缓存，但不能保证断网后重新启动；更换设备或清理浏览器数据前请先导出 JSON。

## 本地运行

项目使用原生 HTML / CSS / JavaScript，零依赖、零构建。克隆后在仓库目录启动任意静态服务器，例如：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。直接双击 `index.html` 也可查看，但静态服务器更接近 GitHub Pages 环境。

## 数据与隐私

训练数据保存在浏览器 `localStorage` 的 `workout-log` 中，不会上传服务器。日期使用本地时区；导入备份时同日期以导入内容为准，其它日期保留。

AI 复盘默认不连接网络服务。部署并配置 Worker 后，只有用户点“生成复盘”时才会发送最近 8 周的力量动作、重量、组次、RIR、每周次数与模式间隔；称呼、经期、有氧、备注和完整 JSON 不会发送。复盘使用 Cloudflare Workers AI binding，不需要在前端、Worker 或 Git 中保存第三方 API key。

## AI Worker

代理代码、限流、安全边界和部署步骤见 [worker/README.md](worker/README.md)。没有配置 Worker 时，动作账本、超过 10 天的模式提示和动作旁加难度建议仍完全在本地运行。

## 文档

- [HANDOFF.md](HANDOFF.md)：数据结构、关键逻辑、兼容约束与回归清单。
- [CHANGELOG.md](CHANGELOG.md)：每次功能与界面迭代。
- [worker/README.md](worker/README.md)：AI 代理的部署与安全配置。

## License

Copyright © 2026 Xinyi (Aven) Guo. All rights reserved. See [LICENSE](LICENSE). If you want this project to accept outside reuse or contributions later, the License can be changed explicitly (for example, to MIT).

---

AvenGO is a calm, mobile-first home-training log with a movement-pattern ledger, flexible templates, RIR-aware progression hints, independent cardio logging, and local JSON/CSV backup. [Try the prototype](https://guoxinyi0811.github.io/AvenGO/). Data stays on the current device unless the user explicitly requests an AI review, which sends only a compact strength summary through the configured Worker. No build step is required.
