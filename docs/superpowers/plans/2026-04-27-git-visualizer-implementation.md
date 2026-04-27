# Git 可视化教室 — 实施计划

> 使用 Worktree 方式开发，每个 Task 在独立 worktree 分支上实现，完成后合并回 main。

**Goal:** 构建 Git 可视化教学网页 MVP，覆盖本地仓库、分支、远程协作、撤销修复四组功能。

**Tech Stack:** 纯 HTML + CSS + JavaScript (ES6+) + Canvas 2D API

---

## 文件结构

```
git-visualizer/
├── index.html         # 主页面（三栏布局：场景/Canvas/命令面板）
├── css/style.css      # Git 橙主题样式
├── js/
│   ├── state.js       # Git 仓库状态模拟（commits/branches/files/HEAD）
│   ├── engine.js      # Canvas 渲染引擎（绘制节点、分支、连线）
│   ├── animations.js  # 动画引擎（脉冲、飞入、渐现）
│   ├── commands.js    # 15 个 Git 命令的封装
│   ├── scenarios.js   # 4 个教学场景定义
│   └── app.js         # 主应用逻辑（事件绑定、步骤控制）
└── docs/superpowers/
    ├── specs/         # 设计文档
    └── plans/         # 实施计划
```

## 任务分解

### Task 1: 页面结构与样式
- **Worktree:** `worktree/task-1-layout`
- 创建 `index.html`（三栏布局：左侧场景面板 / 中间 Canvas / 右侧命令面板 + 顶部导航 + 底部输出）
- 创建 `css/style.css`（Git 橙主题配色、Dark Canvas 区域、按钮/步骤/文件标签样式）
- 关键组件：场景列表、三区状态栏（工作区/暂存区/仓库）、命令按钮、输出日志

### Task 2: Git 状态管理
- **Worktree:** `worktree/task-2-state`
- 创建 `js/state.js`
- `GitState` 类：管理仓库状态（initialized/commits/branches/files/HEAD/remoteUrl）
- 核心方法：init/add/commit/branch/checkout/merge/push/pull/restore/reset/revert/log/status
- 每个方法返回 `{success, message, ...}` 格式，便于 UI 层消费

### Task 3: Canvas 渲染 + 动画引擎
- **Worktree:** `worktree/task-3-canvas`
- 创建 `js/engine.js`：`GitEngine` 类，负责将 Git 状态渲染到 Canvas
  - 绘制节点（圆形 + 渐变 + 阴影）、分支标签（圆角 badge）、历史连线
  - 合并节点/撤销节点特殊标记、HEAD 指针指示器
  - 远程仓库云图标、空状态/空仓库提示
- 创建 `js/animations.js`：`AnimationEngine` 类
  - flyFile：文件飞入动画 / pulseNode：节点脉冲光效
  - fadeInText：文字渐入 / extendBranch：分支延展

### Task 4: 命令定义 + 教学场景
- **Worktree:** `worktree/task-4-commands`
- 创建 `js/commands.js`：`CommandManager` 类，封装 15 个命令的 check/execute 逻辑
- 创建 `js/scenarios.js`：`SCENARIOS` 数组，4 个场景 26 个步骤
  - 本地仓库基础（6 步）、分支操作（5 步）、远程协作（5 步）、撤销修复（7 步）

### Task 5: 主应用逻辑
- **Worktree:** `worktree/task-5-app`
- 创建 `js/app.js`：整合所有模块
  - 场景加载与步骤推进（记录已执行命令，全部完成才跳步）
  - 命令执行与动画触发
  - 文件区域渲染、场景切换、Canvas 点击查看节点详情

### Task 6: 集成测试
- 完整走通 4 个场景
- 修复自动跳步逻辑（多命令步骤需等全部执行完）
- 修复跨场景文件创建问题（新场景需要新文件时自动 createFiles）
- 为 init 命令增加 Canvas 动画反馈
