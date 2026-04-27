# Git 可视化教室 — 重构设计文档（Remotion 版）

## 项目概述

将现有 Git 可视化教室从纯 HTML/CSS/JS + Canvas 重构为 **React + Remotion Player** 交互式教学应用。保留用户点击执行 Git 命令的交互模式，但用 Remotion Player 播放高画质过渡动画，视觉上全面升级。

### 核心理念
- **Animation-first UI**：动画舞台是绝对视觉核心（占 60-70% 面积）
- **Developer tool aesthetic**：终端风格命令、Git 橙点缀、开发者语境
- **沉浸式教学**：从"功能演示工具"升级为"交互式教学产品"

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 动画引擎 | Remotion + @remotion/player |
| 样式 | Tailwind CSS |
| 字体 | Space Grotesk（标题）、JetBrains Mono（代码/终端） |
| Git 状态 | 纯 TypeScript 类（从现有 state.js 移植） |

---

## 页面布局

采用"动画优先"布局：左步骤导航 + 中动画舞台（交互式图形系统） + 右下终端命令区。

```
┌─────────────┬───────────────────────────────────────────┐
│             │                                           │
│  步骤导航    │         动画舞台（Remotion Player）         │
│  ~240px     │                                           │
│             │                                           │
│  ① init ✔  │   ┌──────────────────────────────────┐    │
│  ② add ▶   │   │  背景: #FFF→#F6F8FA 渐变          │    │
│  ③ commit   │   │  rounded-2xl                     │    │
│  ④ status   │   │  shadow: 0 20px 60px rgba(0,0,0,│    │
│  ⑤ log      │   │          0.08)                   │    │
│             │   │                                  │    │
│             │   │   ○──→○──→○                      │    │
│             │   │   ↙      ↘                       │    │
│             │   │   ○←──→○──→○                     │    │
│             │   └──────────────────────────────────┘    │
│             │                                           │
├─────────────┴───────────────────────────────────────────┤
│  输出日志                  │  终端命令区                   │
│  (浅色背景，无阴影)          │  bg: #0D1117               │
│                            │  $ git init                 │
│                            │  $ git add                  │
│                            │  $ git commit               │
└────────────────────────────┴─────────────────────────────┘
```

### 三区层级设计（视觉深度）

| 层级 | 区域 | 样式 |
|------|------|------|
| Level 1 | 动画舞台 | 无边框，强阴影 `0 20px 60px rgba(0,0,0,0.08)`，`rounded-2xl` |
| Level 2 | 步骤导航 / 终端命令区 | 弱阴影 + 细边框 |
| Level 3 | 输出日志 | 浅背景，无阴影 |

---

## 配色方案

采用明亮主题 + 开发者工具风格。

| 用途 | 色值 | 备注 |
|------|------|------|
| 页面背景 | `#F6F8FA` | GitHub 风格浅灰 |
| 卡片背景 | `#FFFFFF` | 白色卡片 |
| 主色（Git 橙） | `#F05032` | 仅用于当前步骤/动画节点/hover，避免大面积使用 |
| 成功 | `#2DA44E` | GitHub 绿 |
| 终端背景 | `#0D1117` | GitHub 暗色 |
| 终端文字 | `#E6EDF3` | 终端前景 |
| 终端绿色 | `#3FB950` | 终端成功输出 |
| 文本主色 | `#1F2328` | 标题文字 |
| 文本次要 | `#656D76` | 辅助文字 |
| 边框 | `#D0D7DE` | 分隔线/边框 |
| 阴影 | `rgba(0,0,0,0.08)` | 卡片阴影 |

---

## 动画方案（Remotion Composition）

每个 Git 操作为一个 Remotion Composition，通过 `@remotion/player` 嵌入。

### 核心理念转变

```
从 "播放动画" → "操控状态变化"
```

用户不是在看视频，而是在 **操控 Git 状态变化的过程**。每一帧都可以暂停、拖拽、回放。

### 操作 - 动画映射

| 操作 | 动画 | 帧数 | 说明 |
|------|------|------|------|
| `git init` | 空画布 → 仓库初始化动画 | 30fps × 1.5s | 淡入仓库结构 + 创建示例文件 |
| `git add` | 文件标签从工作区飞入暂存区 | 30fps × 1s | 贝塞尔曲线移动 + 颜色从红变橙 |
| `git commit` | 新节点从时间线末端弹出 | 30fps × 1.2s | 脉冲光效 + 分支标签更新 |
| `git status` | 无动画，直接显示结果 | — | 状态文本输出到日志 |
| `git log` | 无动画，直接显示历史 | — | 提交链在日志中显示 |

### 交互式图形系统（脱离"播放器感"）

动画舞台不是视频播放器，而是可交互图形系统：

- **节点 hover**：commit 节点悬停放大 + 显示 SHA/消息 tooltip
- **分支高亮**：hover 分支标签时，该分支所有节点和连线高亮
- **commit 点击**：点击节点显示详细信息（时间、消息、parent）
- **拖拽进度条**：拖动 timeline scrubber 逐帧观察状态变化
- **步进按钮**：← 上一帧 / 步进到下一关键帧 / → 下一帧
- **回放按钮**：重新播放当前操作动画

参考：GitKraken / Linear 的交互式 Git 图

### 教学引导层（overlay）

动画播放时，画布上叠加引导元素：

```
初始化仓库后：
  → 画布上出现 tooltip: "📁 .git 目录已创建"
  → 高亮动画中的关键元素

git add 时：
  → tooltip: "📄 文件从 Working Directory 移动到 Staging Area"
  → 正在移动的文件标签高亮

git commit 时：
  → tooltip: "✅ 新 commit 已创建，分支指针前移"
  → 新节点脉冲 + 分支标签更新动画
```

引导层规则：
- 每步有 1-2 句核心教学文案
- 关键元素（正在移动的文件/新节点）有发光/高亮环
- tooltip 指向动画中的具体元素，而非固定在角落
- 教学文案支持中英文

### 交互流程

```
用户点击 "git add"
  → 计算 before/after 状态
  → Remotion Player seek(0)
  → 显示教学引导 overlay
  → Player.play() 播放过渡动画
  → 动画播放中，引导 tooltip 跟随关键元素
  → 动画完成后更新 UI 状态
  → 用户可拖拽进度条回放/步进观察
  → 步骤推进
```

---

## 组件结构

```
src/
├── App.tsx                    # 主布局（左/中/下三区）
├── main.tsx                   # 入口
├── types.ts                   # 类型定义
│
├── components/
│   ├── Layout.tsx             # 三区布局容器
│   ├── StepPanel.tsx          # 左侧步骤导航（关卡式进度）
│   ├── TerminalCommands.tsx   # 右下终端命令区
│   ├── OutputLog.tsx          # 左下输出日志
│   ├── AnimationStage.tsx     # Remotion Player 容器
│   ├── AnimationControls.tsx  # 进度拖拽/步进/回放控制条
│   ├── TeachingOverlay.tsx    # 教学引导 tooltip 叠加层
│   └── SceneComplete.tsx      # 场景完成庆祝动画
│
├── remotion/
│   ├── Root.tsx               # 注册所有 Composition
│   ├── GitGraph.tsx           # 主 Composition：Git DAG 渲染
│   ├── operations/
│   │   ├── InitScene.tsx      # git init 动画场景
│   │   ├── AddScene.tsx       # git add 动画场景
│   │   └── CommitScene.tsx    # git commit 动画场景
│   └── shared/
│       ├── CommitNode.tsx     # Commit 节点绘制
│       ├── BranchLabel.tsx    # 分支标签
│       └── ConnectionLine.tsx # 连线绘制
│
├── state/
│   └── GitState.ts            # Git 状态管理（移植自 state.js）
│
└── lib/
    └── commands.ts            # 命令定义与执行逻辑
```

---

## 命令区改造（终端化）

将当前橙色按钮替换为 GitHub 风格终端命令：

```
$ git init                    ← 可点击，hover 有光标效果
$ git add                     ← 灰色=不可用
$ git commit -m "message"     ← 绿色=可执行
```

**样式规则：**
- 背景：`#0D1117`，`rounded-lg`
- 字体：JetBrains Mono，14px
- 可用命令：`$` 为绿色 `#3FB950`
- 不可用命令：整体灰色 `#484F58`
- 悬停效果：可用命令行高亮 `#161B22`

---

## 视觉记忆点（轻游戏化）

让产品"被记住"的设计：

### 关卡式进度

- 每个场景入口有"关卡封面"（场景名 + 进度 + 简短描述）
- 步骤显示为关卡列表：`① init` `② add` `③ commit`
- 当前步骤有呼吸光效脉冲
- 步骤完成：节点从灰变为彩色 + 微粒子爆炸效果
- 场景完成：全屏庆祝动画（简洁，不干扰）

### 完成反馈

| 事件 | 反馈 |
|------|------|
| 单步完成 | 步骤圆圈打勾 ✔ + 绿色脉冲 |
| 场景完成 | 进度条 100% 闪烁 + 舞台出现 "🎉 场景完成" 文字动画 |
| 可点击节点 | 悬停时微微放大 + 光晕 |
| 命令可用 | 终端 `$` 变为绿色 + 轻微呼吸 |

### 品牌识别

- Git 橙色仅用于：当前步骤、commit 节点、关键交互点
- 动画舞台左上角有细橙色装饰线（Git 品牌标识）
- 无大色块，无多余装饰

---

## 交互细节

| 元素 | 效果 | 时长 |
|------|------|------|
| 步骤 hover | 浅灰背景 | — |
| 步骤切换 | 橙色高亮当前步骤 | — |
| 终端命令 hover | 背景变亮 `#161B22` | 150ms |
| 终端命令 click | `scale(0.98)` 微压感 | 150ms |
| 完成步骤 | 绿色 ✔ 标记 | — |
| 卡片 hover | `translateY(-2px)` + 阴影增强 | 200ms |
| 日志输出 | 逐行动态追加 | — |
| 节点 hover | 放大 + 光晕 + 显示 SHA tooltip | 150ms |
| 分支 hover | 同分支所有节点/连线高亮 | 200ms |
| 动画进度拖拽 | 实时 scrub 关键帧 | 即时 |
| 教学 tooltip | 跟随动画关键元素 | 同步帧 |
| 步进按钮 | ←/→ 逐帧跳转 | — |
| 步骤完成 | 绿色 ✔ + 微粒子效果 | 400ms |
| 场景完成 | 🎉 庆祝动画 | 1s |

---

## 原型范围

### 场景 1：本地仓库基础

| 步骤 | 操作 | 动画 |
|------|------|------|
| 1 | `git init` | 仓库初始化动画 |
| 2 | `git add` | 文件飞入暂存区 |
| 3 | `git commit` | 新节点弹出 + 脉冲 |
| 4 | `git status` | 日志显示状态 |
| 5 | `git log` | 日志显示提交链 |

---

## 设计关键词

- Animation-first UI
- Developer tool aesthetic
- Low saturation + high contrast accents
- Minimal but intentional color usage
- Card hierarchy + depth
- **从"播放动画" → "操控状态变化"**
- **交互式图形系统**（非视频播放器）
- **教学引导 overlay**（讲解 + 高亮）
- **关卡式轻游戏化**（记忆点）

## 一句话目标

> 把它从"功能演示工具"，升级为"有沉浸感的交互式教学产品"
