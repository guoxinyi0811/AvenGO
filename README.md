# AvenGO

一个移动端优先、低压力的家庭训练记录工具。选择当天安排，查看动作指令，记录重量、次数、RIR、有氧与周期信息。数据只保存在当前设备。

## 在线原型

[打开 AvenGO](https://guoxinyi0811.github.io/AvenGO/)

典型使用流程：

1. 选择今天做力量、休息或暂不安排。
2. 选择 A / B 计划与完整、精简或轻量投入。
3. 训练时查看动作说明并记录实际重量、组数、次数和 RIR。
4. 有氧可单独记录，也可与力量安排在同一天。

## 核心特点

- 动作说明包含起始姿势、呼吸、节奏、发力顺序、正确体感和常见错误。
- 支持过去日期补录、月历、力量趋势、JSON 备份／恢复和 CSV 导出。
- 周期建议仅供参考，不锁定训练选择。
- 不设目标、进度条、连胜压力或未记录提醒。

## 技术与隐私

原生 HTML / CSS / JavaScript，零依赖、零构建。训练数据存于浏览器 `localStorage`，不会上传服务器。

项目可添加到 iPhone 主屏幕；当前尚无 Service Worker，首次打开或缓存失效时仍需要网络。更换设备或清理浏览器数据前，请先导出 JSON。

## 文档

- [HANDOFF.md](HANDOFF.md)：数据结构、关键逻辑、兼容要求与回归清单。
- [CHANGELOG.md](CHANGELOG.md)：功能和 UI 迭代记录。

---

AvenGO is a calm, mobile-first home-training log. It provides A/B plans, detailed movement guidance, actual-set tracking, independent cardio logging, approximate cycle-aware suggestions, and local JSON/CSV backup.

[Try the prototype](https://guoxinyi0811.github.io/AvenGO/) · Data stays on the current device · Vanilla HTML/CSS/JavaScript · No build step
