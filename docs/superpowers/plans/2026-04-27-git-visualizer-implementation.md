# Git 可视化教室 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个交互动画式 Git 教学网页 MVP，覆盖本地仓库、分支、远程协作、撤销修复四组基础功能。

**Architecture:** 单页应用，无外部依赖。`state.js` 管理 Git 仓库模拟状态，`engine.js` 负责 Canvas 渲染，`animations.js` 提供补间动画，`commands.js` 定义命令逻辑，`scenarios.js` 定义教学场景步骤，`app.js` 整合所有模块。

**Tech Stack:** 纯 HTML5 + CSS3 + JavaScript (ES6+) + Canvas 2D API

---

## 文件结构

```
git-visualizer/
├── index.html              # 主页面 HTML 结构
├── css/
│   └── style.css           # Git 橙主题样式
├── js/
│   ├── state.js            # Git 仓库状态管理
│   ├── engine.js           # Canvas 渲染引擎
│   ├── animations.js       # 动画引擎
│   ├── commands.js         # Git 命令定义
│   ├── scenarios.js        # 教学场景/步骤
│   └── app.js              # 应用入口、布局、事件绑定
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

---

### Task 1: 搭建 HTML 页面结构和 CSS 主题

**Files:**
- Create: `git-visualizer/index.html`
- Create: `git-visualizer/css/style.css`

**Description:** 创建三栏式页面布局，实现 Git 橙配色主题、全局样式。

- [ ] **Step 1: 编写 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git 可视化教室</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- 顶部导航 -->
  <header class="top-bar">
    <div class="top-bar-left">
      <span class="logo">📊 Git 可视化教室</span>
    </div>
    <div class="top-bar-center">
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <span class="progress-text" id="progressText">0 / 0</span>
    </div>
    <div class="top-bar-right">
      <select id="sceneSelect" class="scene-select">
        <option value="0">📍 本地仓库基础</option>
        <option value="1">🌿 分支操作</option>
        <option value="2">☁️ 远程协作</option>
        <option value="3">↩️ 撤销与修复</option>
      </select>
    </div>
  </header>

  <!-- 主体三栏 -->
  <main class="main-content">
    <!-- 左侧：场景引导 -->
    <aside class="panel panel-left" id="scenarioPanel">
      <div class="panel-header">📋 场景引导</div>
      <div class="scenario-title" id="scenarioTitle">加载中...</div>
      <div class="step-list" id="stepList"></div>
    </aside>

    <!-- 中间：Canvas 可视化 -->
    <section class="canvas-area">
      <div class="zone-bar">
        <div class="zone zone-workspace">
          <div class="zone-label">📁 工作区</div>
          <div class="zone-files" id="workspaceFiles"></div>
        </div>
        <div class="zone-arrow">→</div>
        <div class="zone zone-staging">
          <div class="zone-label">📦 暂存区</div>
          <div class="zone-files" id="stagingFiles"></div>
        </div>
        <div class="zone-arrow">→</div>
        <div class="zone zone-repo">
          <div class="zone-label">🗄️ 仓库</div>
          <div class="zone-files" id="repoFiles"></div>
        </div>
      </div>
      <canvas id="gitCanvas" width="700" height="400"></canvas>
    </section>

    <!-- 右侧：命令面板 -->
    <aside class="panel panel-right" id="commandPanel">
      <div class="panel-header">🔧 命令面板</div>
      <div class="command-hint" id="commandHint">点击命令执行操作</div>
      <div class="command-list" id="commandList"></div>
    </aside>
  </main>

  <!-- 底部输出 -->
  <footer class="output-bar" id="outputBar">
    <div class="output-header">💬 输出</div>
    <div class="output-content" id="outputContent">
      <div class="output-line welcome">欢迎使用 Git 可视化教室！选择一个场景开始学习。</div>
    </div>
  </footer>

  <script src="js/state.js"></script>
  <script src="js/engine.js"></script>
  <script src="js/animations.js"></script>
  <script src="js/commands.js"></script>
  <script src="js/scenarios.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 编写 style.css**

```css
/* === Reset & Base === */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  color: #2c3e50;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}

/* === 顶部导航 === */
.top-bar {
  background: linear-gradient(135deg, #f05032, #e04020);
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(240, 80, 50, 0.3);
  z-index: 10;
}
.top-bar-left .logo { font-size: 16px; font-weight: bold; }
.top-bar-center { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: center; }
.progress-bar {
  width: 200px; height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.progress-text { font-size: 13px; opacity: 0.9; }
.scene-select {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}
.scene-select option { color: #2c3e50; background: white; }

/* === 主体三栏 === */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 0;
}

/* 面板通用 */
.panel {
  width: 220px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
  overflow-y: auto;
}
.panel-right { border-right: none; border-left: 1px solid #eee; }
.panel-header {
  padding: 12px 16px;
  font-weight: bold;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

/* 左侧场景面板 */
.scenario-title {
  padding: 10px 16px;
  font-size: 13px;
  color: #666;
  border-bottom: 1px solid #eee;
}
.step-list { padding: 8px 12px; }
.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}
.step-item:hover { background: #f0f0f0; }
.step-item.active {
  background: #fff3e0;
  color: #f05032;
  font-weight: bold;
}
.step-item.done {
  color: #27ae60;
}
.step-item.locked {
  color: #ccc;
  cursor: not-allowed;
}
.step-number {
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: bold;
  flex-shrink: 0;
}
.step-item.active .step-number { background: #f05032; color: white; }
.step-item.done .step-number { background: #27ae60; color: white; }
.step-item.locked .step-number { background: #eee; color: #ccc; }

/* 中间 Canvas 区域 */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
}
.zone-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}
.zone {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  min-height: 48px;
}
.zone-label { font-size: 11px; font-weight: bold; margin-bottom: 4px; }
.zone-workspace .zone-label { color: #e74c3c; }
.zone-staging .zone-label { color: #f39c12; }
.zone-repo .zone-label { color: #27ae60; }
.zone-files { display: flex; gap: 4px; flex-wrap: wrap; }
.file-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
}
.file-tag.untracked { background: #2d2d44; color: #e74c3c; border: 1px solid #e74c3c; }
.file-tag.staged { background: #2d2d44; color: #f39c12; border: 1px solid #f39c12; }
.file-tag.committed { background: #2d2d44; color: #27ae60; border: 1px solid #27ae60; }
.file-tag.modified { background: #2d2d44; color: #e74c3c; border: 1px solid #e74c3c; }
.zone-arrow { color: #444; font-size: 16px; }
#gitCanvas { flex: 1; cursor: pointer; }

/* 右侧命令面板 */
.command-hint {
  padding: 10px 16px;
  font-size: 12px;
  color: #999;
  border-bottom: 1px solid #eee;
}
.command-list { padding: 8px 12px; }
.command-btn {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 6px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}
.command-btn.available {
  background: #f05032;
  color: white;
  box-shadow: 0 2px 4px rgba(240, 80, 50, 0.3);
}
.command-btn.available:hover {
  background: #e04020;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(240, 80, 50, 0.4);
}
.command-btn.locked {
  background: #eee;
  color: #ccc;
  cursor: not-allowed;
}

/* 底部输出 */
.output-bar {
  background: #1e1e1e;
  border-top: 2px solid #f05032;
  max-height: 140px;
  overflow-y: auto;
}
.output-header {
  padding: 6px 16px;
  font-size: 12px;
  color: #888;
  background: #252525;
  border-bottom: 1px solid #333;
}
.output-content { padding: 8px 16px; font-family: 'Courier New', monospace; font-size: 13px; }
.output-line { padding: 2px 0; color: #d4d4d4; }
.output-line.command { color: #4ec9b0; }
.output-line.success { color: #27ae60; }
.output-line.error { color: #e74c3c; }
.output-line.info { color: #888; }
.output-line.welcome { color: #888; font-style: italic; }

/* 动画关键帧 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.command-btn.available.hint-pulse { animation: pulse 1.5s ease-in-out infinite; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.output-line { animation: fadeIn 0.2s ease; }

/* 滚动条 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #bbb; }
```

- [ ] **Step 3: 验证**

在浏览器中打开 index.html，确认布局正确、三栏结构显示、没有样式错误。

- [ ] **Step 4: 提交**

```bash
git add index.html css/style.css
git commit -m "feat: add HTML structure and CSS theme"
```

---

### Task 2: 实现 Git 状态管理 (state.js)

**Files:**
- Create: `git-visualizer/js/state.js`

**Description:** 实现 Git 仓库的模拟状态管理，存储 commits、branches、files、HEAD 等信息，并提供操作这些状态的方法。

- [ ] **Step 1: 编写 state.js**

```javascript
class GitState {
  constructor() {
    this.reset();
  }

  reset() {
    this.initialized = false;
    this.commits = [];       // [{id, message, parent, branch, timestamp}]
    this.branches = {};      // { branchName: commitId }
    this.head = null;        // 'main' | 'feature' | etc
    this.currentBranch = null;
    this.files = {};         // { filename: 'untracked' | 'staged' | 'committed' | 'modified' }
    this.stagedFiles = new Set();
    this.remoteCommits = []; // 模拟远程仓库的 commits
    this.remoteUrl = null;
    this.attachCount = 0;
  }

  // === 核心操作 ===

  init() {
    if (this.initialized) return { success: false, message: '仓库已初始化' };
    this.initialized = true;
    this.branches['main'] = null;
    this.head = 'main';
    this.currentBranch = 'main';
    // 创建一个空初始提交（类似 git 的行为）
    return { success: true, message: '已初始化空的 Git 仓库' };
  }

  createFile(filename) {
    if (this.files[filename]) return { success: false, message: `文件 ${filename} 已存在` };
    this.files[filename] = 'untracked';
    return { success: true, message: `创建文件 ${filename}` };
  }

  add(filenames) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库 (git init)' };
    const names = filenames || Object.keys(this.files).filter(f => this.files[f] === 'untracked' || this.files[f] === 'modified');
    if (names.length === 0) return { success: false, message: '没有可添加的文件' };
    names.forEach(f => {
      if (this.files[f]) {
        this.files[f] = 'staged';
        this.stagedFiles.add(f);
      }
    });
    return { success: true, message: `已将 ${names.length} 个文件添加到暂存区`, detail: names };
  }

  commit(message) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.stagedFiles.size === 0) return { success: false, message: '暂存区为空，请先 git add' };
    
    const id = this._generateId();
    const parentCommit = this.branches[this.currentBranch];
    const commit = {
      id,
      message: message || '新提交',
      parent: parentCommit,
      branch: this.currentBranch,
      timestamp: Date.now(),
      isMerge: false,
      parents: parentCommit ? [parentCommit] : []
    };
    this.commits.push(commit);
    this.branches[this.currentBranch] = id;
    
    // 提交后文件变为 committed 状态
    this.stagedFiles.forEach(f => { this.files[f] = 'committed'; });
    this.stagedFiles.clear();
    
    return { success: true, message: `[${this.currentBranch}] ${id} ${message || '新提交'}`, commit };
  }

  branch(name) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.branches[name]) return { success: false, message: `分支 ${name} 已存在` };
    const currentCommit = this.branches[this.head];
    this.branches[name] = currentCommit;
    return { success: true, message: `创建分支 ${name}` };
  }

  checkout(target) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.branches[target]) return { success: false, message: `分支 ${target} 不存在` };
    this.head = target;
    this.currentBranch = target;
    return { success: true, message: `切换到分支 ${target}` };
  }

  merge(branchName) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.branches[branchName]) return { success: false, message: `分支 ${branchName} 不存在` };
    if (branchName === this.currentBranch) return { success: false, message: '不能合并自己' };
    
    const theirCommit = this.branches[branchName];
    const ourCommit = this.branches[this.currentBranch];
    
    if (theirCommit === null) return { success: false, message: `${branchName} 没有可合并的提交` };
    if (ourCommit === theirCommit) return { success: false, message: `${branchName} 已经是最新的了` };
    
    // 检查是否存在共同祖先（简化：只要不是直接祖先就算合并）
    const isAncestor = this._isAncestor(theirCommit, ourCommit);
    
    if (!isAncestor) {
      // 创建合并提交
      const id = this._generateId();
      const mergeCommit = {
        id,
        message: `合并分支 ${branchName}`,
        parent: ourCommit,
        branch: this.currentBranch,
        timestamp: Date.now(),
        isMerge: true,
        parents: [ourCommit, theirCommit]
      };
      this.commits.push(mergeCommit);
      this.branches[this.currentBranch] = id;
      return { success: true, message: `已将 ${branchName} 合并到 ${this.currentBranch}（合并提交）`, commit: mergeCommit, isMerge: true };
    } else {
      // 快进合并
      this.branches[this.currentBranch] = theirCommit;
      return { success: true, message: `已将 ${branchName} 合并到 ${this.currentBranch}（快进合并）`, isFastForward: true };
    }
  }

  status() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    const untracked = Object.entries(this.files).filter(([_, s]) => s === 'untracked').map(([f]) => f);
    const staged = Object.entries(this.files).filter(([_, s]) => s === 'staged').map(([f]) => f);
    const modified = Object.entries(this.files).filter(([_, s]) => s === 'modified').map(([f]) => f);
    const committed = Object.entries(this.files).filter(([_, s]) => s === 'committed').map(([f]) => f);
    return { success: true, message: '查看仓库状态', untracked, staged, modified, committed };
  }

  log() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.commits.length === 0) return { success: false, message: '没有提交记录' };
    const commitChain = [];
    let currentId = this.branches[this.currentBranch];
    while (currentId) {
      const commit = this.commits.find(c => c.id === currentId);
      if (!commit) break;
      commitChain.push(commit);
      currentId = commit.parent;
    }
    return { success: true, message: '查看提交历史', commits: commitChain };
  }

  // 远程操作
  remote(url) {
    this.remoteUrl = url || 'origin';
    return { success: true, message: `添加远程仓库 ${this.remoteUrl}` };
  }

  push() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.remoteUrl) return { success: false, message: '没有配置远程仓库，请先 git remote add' };
    const currentCommit = this.branches[this.currentBranch];
    if (!currentCommit) return { success: false, message: '没有可推送的提交' };
    // 获取本地最新但远程没有的 commits
    const newCommits = this._getNewCommits(currentCommit);
    newCommits.forEach(c => this.remoteCommits.push({...c}));
    return { success: true, message: `已推送 ${newCommits.length} 个提交到远程`, pushedCommits: newCommits };
  }

  pull() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.remoteUrl) return { success: false, message: '没有配置远程仓库' };
    if (this.remoteCommits.length === 0) return { success: false, message: '远程仓库没有新的提交' };
    
    // 模拟拉取并合并远程 commits
    const pulled = [];
    this.remoteCommits.forEach(rc => {
      if (!this.commits.find(c => c.id === rc.id)) {
        const newCommit = {...rc, branch: this.currentBranch, parent: this.branches[this.currentBranch]};
        this.commits.push(newCommit);
        this.branches[this.currentBranch] = newCommit.id;
        pulled.push(newCommit);
      }
    });
    this.remoteCommits = [];
    return { success: true, message: `已拉取 ${pulled.length} 个提交`, pulledCommits: pulled };
  }

  clone() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    return { success: true, message: '克隆完成！已复制到新目录' };
  }

  // 撤销/修复
  restore(filename) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!filename) {
      // 恢复所有已修改但未暂存的文件
      const modified = Object.entries(this.files).filter(([_, s]) => s === 'modified').map(([f]) => f);
      if (modified.length === 0) return { success: false, message: '没有需要恢复的已修改文件' };
      modified.forEach(f => { this.files[f] = 'committed'; });
      return { success: true, message: `已恢复 ${modified.length} 个文件`, restoredFiles: modified };
    }
    if (this.files[filename] !== 'modified') return { success: false, message: `文件 ${filename} 未被修改` };
    this.files[filename] = 'committed';
    return { success: true, message: `已恢复文件 ${filename}` };
  }

  reset(target) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (target === 'staged') {
      // 取消暂存
      const staged = [...this.stagedFiles];
      if (staged.length === 0) return { success: false, message: '暂存区为空' };
      staged.forEach(f => { this.files[f] = 'modified'; });
      this.stagedFiles.clear();
      return { success: true, message: `已取消 ${staged.length} 个文件的暂存`, unstagedFiles: staged };
    }
    if (target === 'commit' && this.commits.length > 0) {
      // 回退到上一个提交
      const currentCommit = this.branches[this.currentBranch];
      if (!currentCommit) return { success: false, message: '没有可回退的提交' };
      const commit = this.commits.find(c => c.id === currentCommit);
      if (commit && commit.parent) {
        this.branches[this.currentBranch] = commit.parent;
        this.commits = this.commits.filter(c => c.id !== currentCommit);
        return { success: true, message: `已回退到上一个提交`, removedCommit: currentCommit };
      } else {
        this.branches[this.currentBranch] = null;
        this.commits = this.commits.filter(c => c.id !== currentCommit);
        return { success: true, message: `已回退到初始状态` };
      }
    }
    return { success: false, message: '没有可重置的内容' };
  }

  revert() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    const currentCommit = this.branches[this.currentBranch];
    if (!currentCommit) return { success: false, message: '没有可撤销的提交' };
    // 创建一个反向提交
    const id = this._generateId();
    const revertCommit = {
      id,
      message: `撤销提交 ${currentCommit}`,
      parent: currentCommit,
      branch: this.currentBranch,
      timestamp: Date.now(),
      isRevert: true
    };
    this.commits.push(revertCommit);
    this.branches[this.currentBranch] = id;
    return { success: true, message: `已创建撤销提交 ${id}`, commit: revertCommit };
  }

  // === 辅助方法 ===

  _generateId() {
    return 'abcdefghijklmnopqrstuvwxyz0123456789' .split('').sort(() => Math.random() - 0.5).slice(0, 7).join('');
  }

  _isAncestor(commitId, ancestorId) {
    if (!commitId || !ancestorId) return false;
    if (commitId === ancestorId) return true;
    const commit = this.commits.find(c => c.id === commitId);
    if (!commit) return false;
    return this._isAncestor(commit.parent, ancestorId);
  }

  _getNewCommits(fromId) {
    const result = [];
    let current = this.commits.find(c => c.id === fromId);
    while (current) {
      if (this.remoteCommits.find(rc => rc.id === current.id)) break;
      result.unshift(current);
      current = this.commits.find(c => c.id === current.parent);
    }
    return result;
  }

  // 获取用于渲染的数据
  getRenderData() {
    return {
      initialized: this.initialized,
      commits: [...this.commits],
      branches: {...this.branches},
      head: this.head,
      currentBranch: this.currentBranch,
      files: {...this.files},
      stagedFiles: new Set(this.stagedFiles),
      remoteCommits: [...this.remoteCommits],
      remoteUrl: this.remoteUrl
    };
  }
}
```

- [ ] **Step 2: 验证**

在 HTML 中已引用，暂无独立测试。可在浏览器控制台测试：`new GitState()`，确认方法存在。

- [ ] **Step 3: 提交**

```bash
git add js/state.js
git commit -m "feat: add git state management"
```

---

### Task 3: 实现 Canvas 渲染引擎 (engine.js)

**Files:**
- Create: `git-visualizer/js/engine.js`

**Description:** 负责将 GitState 渲染到 Canvas 上，绘制 commit 节点、分支标签、历史连线、HEAD 指针。

- [ ] **Step 1: 编写 engine.js**

```javascript
class GitEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.nodeRadius = 18;
    this.nodeSpacingX = 80;
    this.nodeSpacingY = 60;
    this.startX = 60;
    this.startY = 60;
    this.branchColors = {};
    this.colorIndex = 0;
    this.availableColors = ['#f05032', '#27ae60', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c'];
    this.onNodeClick = null;
    this.nodePositions = []; // [{id, x, y, color}]

    // 响应式
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    // 保持宽高比或填充
    this.canvas.width = this.canvas.parentElement.clientWidth || 700;
    this.canvas.height = this.canvas.parentElement.clientHeight || 400;
    this.needsRedraw = true;
  }

  _getBranchColor(branchName) {
    if (!this.branchColors[branchName]) {
      this.branchColors[branchName] = this.availableColors[this.colorIndex % this.availableColors.length];
      this.colorIndex++;
    }
    return this.branchColors[branchName];
  }

  _getBranchLane(branchName, allBranches) {
    const uniqueBranches = [...new Set(allBranches)];
    const idx = uniqueBranches.indexOf(branchName);
    return idx >= 0 ? idx : 0;
  }

  render(state) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 清空
    ctx.clearRect(0, 0, w, h);
    this.nodePositions = [];

    if (!state.initialized) {
      this._drawEmptyState(ctx, w, h);
      return;
    }

    if (state.commits.length === 0) {
      this._drawEmptyRepo(ctx, w, h);
      return;
    }

    // 计算布局
    const branchList = Object.keys(state.branches);
    const layout = this._calculateLayout(state.commits, state.branches, branchList);

    // 绘制连线
    this._drawConnections(ctx, layout);

    // 绘制节点
    this._drawNodes(ctx, layout, state);

    // 绘制分支标签
    this._drawBranchLabels(ctx, layout, state);

    // 绘制 HEAD
    this._drawHEAD(ctx, layout, state);

    // 绘制远程仓库
    if (state.remoteUrl) {
      this._drawRemote(ctx, w, state);
    }

    // 保存节点位置供点击检测
    this.nodePositions = layout.positions;
  }

  _calculateLayout(commits, branches, branchList) {
    // 简化的拓扑布局：按分支分 lane，按时间顺序排列
    const positions = [];
    const commitMap = {};
    const laneMap = {};
    
    branchList.forEach((b, i) => laneMap[b] = i);

    // 遍历每个分支，收集 commits
    const drawn = new Set();
    const chainMap = {};

    branchList.forEach(branch => {
      const chain = [];
      let current = branches[branch];
      while (current) {
        if (drawn.has(current)) break;
        chain.unshift(current);
        drawn.add(current);
        const commit = commits.find(c => c.id === current);
        current = commit ? commit.parent : null;
      }
      chainMap[branch] = chain;
    });

    // 按分支绘制，合并节点位置
    const xSpacing = this.nodeSpacingX;
    const ySpacing = this.nodeSpacingY;
    const maxChainLen = Math.max(...Object.values(chainMap).map(c => c.length), 1);

    branchList.forEach((branch, bi) => {
      const chain = chainMap[branch] || [];
      chain.forEach((commitId, ci) => {
        const x = this.startX + ci * xSpacing + bi * 8;
        const y = this.startY + bi * ySpacing;
        const existing = positions.find(p => p.id === commitId);
        if (!existing) {
          positions.push({
            id: commitId,
            x, y,
            lane: bi,
            branch,
            commit: commits.find(c => c.id === commitId),
            isMerge: commits.find(c => c.id === commitId)?.isMerge || false,
            isRevert: commits.find(c => c.id === commitId)?.isRevert || false
          });
        } else if (existing.branch !== branch) {
          // 如果是合并，标记该节点有多个 parent
          existing.isMergePoint = true;
          existing.secondBranch = branch;
          existing.secondY = this.startY + bi * ySpacing;
        }
      });
    });

    return { positions, commitMap, maxChainLen };
  }

  _drawConnections(ctx, layout) {
    const { positions } = layout;

    positions.forEach(pos => {
      const commit = pos.commit;
      if (!commit) return;

      // 从 parent 到当前节点的连线
      if (commit.parent) {
        const parent = positions.find(p => p.id === commit.parent);
        if (parent) {
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = this._getBranchColor(pos.branch);
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      // 如果是合并节点，画第二条连线
      if (commit.isMerge && commit.parents && commit.parents.length > 1) {
        const secondParent = positions.find(p => p.id === commit.parents[1]);
        if (secondParent) {
          ctx.beginPath();
          ctx.moveTo(secondParent.x, secondParent.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = this._getBranchColor(pos.branch);
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });
  }

  _drawNodes(ctx, layout, state) {
    const { positions } = layout;
    const currentCommit = state.branches[state.head];

    positions.forEach(pos => {
      const isCurrent = pos.id === currentCommit;
      const radius = isCurrent ? this.nodeRadius : this.nodeRadius - 2;

      // 节点阴影
      ctx.shadowColor = pos.isMerge ? 'rgba(240, 80, 50, 0.4)' : 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = pos.isMerge ? 12 : 6;

      // 节点填充
      const gradient = ctx.createRadialGradient(pos.x - 3, pos.y - 3, 2, pos.x, pos.y, radius);
      if (pos.isMerge) {
        gradient.addColorStop(0, '#ff8a65');
        gradient.addColorStop(1, '#f05032');
      } else if (pos.isRevert) {
        gradient.addColorStop(0, '#ffab91');
        gradient.addColorStop(1, '#e74c3c');
      } else {
        const color = this._getBranchColor(pos.branch);
        gradient.addColorStop(0, this._lighten(color, 30));
        gradient.addColorStop(1, color);
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 边框
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isCurrent ? '#fff' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isCurrent ? 2.5 : 1;
      ctx.stroke();

      // 如果是当前分支的最新节点，加发光效果
      if (isCurrent) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(240, 80, 50, 0.5)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(240, 80, 50, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 合并节点特殊标记
      if (pos.isMerge) {
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', pos.x, pos.y);
      } else if (pos.isRevert) {
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↩', pos.x, pos.y);
      }

      // Commit 信息
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(pos.id.substring(0, 6), pos.x, pos.y + radius + 4);

      if (pos.commit) {
        ctx.fillStyle = '#666';
        ctx.font = '11px sans-serif';
        ctx.fillText(pos.commit.message, pos.x, pos.y + radius + 18);
      }
    });
  }

  _drawBranchLabels(ctx, layout, state) {
    const { positions } = layout;

    Object.entries(state.branches).forEach(([branchName, commitId]) => {
      if (!commitId) return;
      const pos = positions.find(p => p.id === commitId);
      if (!pos) return;

      const color = this._getBranchColor(branchName);
      const isHEAD = state.head === branchName;
      const label = isHEAD ? `${branchName} (HEAD)` : branchName;

      ctx.font = '12px sans-serif';
      const textWidth = ctx.measureText(label).width;
      const padX = 8, padY = 4;
      const labelW = textWidth + padX * 2;
      const labelH = 22;

      // 标签在节点上方偏右
      const lx = pos.x + this.nodeRadius - 4;
      const ly = pos.y - this.nodeRadius - labelH - 4;

      // 背景
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      this._roundRect(ctx, lx, ly, labelW, labelH, 4);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 文字
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx + labelW / 2, ly + labelH / 2);
    });
  }

  _drawHEAD(ctx, layout, state) {
    if (!state.head) return;
    const currentCommit = state.branches[state.head];
    if (!currentCommit) return;

    const pos = layout.positions.find(p => p.id === currentCommit);
    if (!pos) return;

    // 在节点下方画一个三角形指示
    ctx.fillStyle = 'rgba(240, 80, 50, 0.6)';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y + this.nodeRadius + 40);
    ctx.lineTo(pos.x - 6, pos.y + this.nodeRadius + 48);
    ctx.lineTo(pos.x + 6, pos.y + this.nodeRadius + 48);
    ctx.closePath();
    ctx.fill();
  }

  _drawRemote(ctx, w, state) {
    const rx = w - 80;
    const ry = 40;

    // 云朵图标
    ctx.fillStyle = '#444';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️', rx, ry);

    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.fillText('远程仓库', rx, ry + 24);

    // 显示远程 commits
    if (state.remoteCommits.length > 0) {
      state.remoteCommits.forEach((rc, i) => {
        const cx = rx - 30 + i * 20;
        const cy = ry + 50;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#555';
        ctx.fill();
      });
    }

    // 从本地到远程的连线
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w * 0.7, 40);
    ctx.lineTo(rx - 30, 40);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawEmptyState(ctx, w, h) {
    ctx.fillStyle = '#444';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('尚未初始化 Git 仓库', w / 2, h / 2 - 10);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('点击右侧 "git init" 开始', w / 2, h / 2 + 20);
  }

  _drawEmptyRepo(ctx, w, h) {
    ctx.fillStyle = '#444';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('仓库已初始化，尚无提交', w / 2, h / 2);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('创建文件并执行 git add / git commit', w / 2, h / 2 + 25);
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  _lighten(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R},${G},${B})`;
  }

  getNodeAt(x, y) {
    return this.nodePositions.find(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < this.nodeRadius + 5;
    });
  }
}
```

- [ ] **Step 2: 验证**

在 HTML 中已引用。确保 Canvas 能初始化，无 JS 错误。

- [ ] **Step 3: 提交**

```bash
git add js/engine.js
git commit -m "feat: add canvas rendering engine"
```

---

### Task 4: 实现动画引擎 (animations.js)

**Files:**
- Create: `git-visualizer/js/animations.js`

**Description:** 实现补间动画系统，支持文件飞入、节点脉冲、渐变过渡等 Canvas 动画效果。

- [ ] **Step 1: 编写 animations.js**

```javascript
class AnimationEngine {
  constructor(engine) {
    this.engine = engine;
    this.queue = [];
    this.running = false;
    this.onComplete = null;
  }

  // 添加动画到队列
  add(animation) {
    this.queue.push(animation);
    if (!this.running) this._runNext();
  }

  _runNext() {
    if (this.queue.length === 0) {
      this.running = false;
      if (this.onComplete) this.onComplete();
      return;
    }
    this.running = true;
    const anim = this.queue.shift();
    anim(this._runNext.bind(this));
  }

  clear() {
    this.queue = [];
    this.running = false;
  }

  // === 内置动画 ===

  // 文件飞到暂存区：从 fromPos 到 toPos 移动一个元素
  flyFile(fromPos, toPos, color, callback) {
    const duration = 500;
    const start = performance.now();
    const ctx = this.engine.ctx;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // 缓出函数
      const ease = 1 - Math.pow(1 - progress, 3);
      
      const x = fromPos.x + (toPos.x - fromPos.x) * ease;
      const y = fromPos.y + (toPos.y - fromPos.y) * ease;

      // 重绘当前画面
      this.engine.render(this.engine.lastState);

      // 绘制飞行中的文件
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(240, 80, 50, 0.4)';
      ctx.fillStyle = color;
      this.engine._roundRect(ctx, x - 20, y - 8, 40, 16, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📄', x, y);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  // 节点脉冲动画
  pulseNode(nodeX, nodeY, radius, callback) {
    const duration = 600;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // 脉冲：先放大再缩回
      const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
      const alpha = Math.sin(progress * Math.PI) * 0.5;

      // 重绘
      this.engine.render(this.engine.lastState);

      // 叠加脉冲光圈
      const ctx = this.engine.ctx;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, radius * scale + 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(240, 80, 50, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  // 节点飞出（push/pull 用）
  flyNode(fromX, fromY, toX, toY, color, callback) {
    const duration = 800;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const x = fromX + (toX - fromX) * ease;
      const y = fromY + (toY - fromY) * ease;

      this.engine.render(this.engine.lastState);

      const ctx = this.engine.ctx;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(240, 80, 50, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  // 渐入文字
  fadeInText(text, x, y, color, callback) {
    const duration = 400;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      this.engine.render(this.engine.lastState);

      const ctx = this.engine.ctx;
      ctx.globalAlpha = progress;
      ctx.fillStyle = color || '#27ae60';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y - 10 * (1 - progress));
      ctx.globalAlpha = 1;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  // 分支从节点延展出去
  extendBranch(fromX, fromY, toX, toY, color, callback) {
    const duration = 500;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2);

      const endX = fromX + (toX - fromX) * ease;
      const endY = fromY + (toY - fromY) * ease;

      this.engine.render(this.engine.lastState);

      const ctx = this.engine.ctx;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // 终点小圆
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  // 三区状态栏更新动画（闪烁）
  flashZone(zoneElement, color) {
    if (!zoneElement) return;
    const originalBg = zoneElement.style.background;
    zoneElement.style.transition = 'background 0.3s';
    zoneElement.style.background = color;
    setTimeout(() => {
      zoneElement.style.background = originalBg;
    }, 400);
  }
}
```

- [ ] **Step 2: 验证**

在 HTML 中已引用。无 JS 错误即可。

- [ ] **Step 3: 提交**

```bash
git add js/animations.js
git commit -m "feat: add animation engine"
```

---

### Task 5: 定义 Git 命令 (commands.js)

**Files:**
- Create: `git-visualizer/js/commands.js`

**Description:** 将 `GitState` 的操作封装为命令对象，每个命令包含名称、描述、前置条件检查、执行逻辑和触发动画。

- [ ] **Step 1: 编写 commands.js**

```javascript
class CommandManager {
  constructor(gitState, engine, animator) {
    this.state = gitState;
    this.engine = engine;
    this.anim = animator;
    this.commands = this._defineCommands();
  }

  _defineCommands() {
    return [
      {
        id: 'init',
        label: 'git init',
        description: '初始化一个新的 Git 仓库',
        group: 'base',
        check: () => !this.state.initialized,
        execute: () => {
          const result = this.state.init();
          if (result.success) {
            this.state.createFile('index.html');
            this.state.createFile('style.css');
          }
          return result;
        }
      },
      {
        id: 'add',
        label: 'git add',
        description: '将文件添加到暂存区',
        group: 'base',
        check: () => {
          if (!this.state.initialized) return false;
          const files = Object.entries(this.state.files);
          return files.some(([_, s]) => s === 'untracked' || s === 'modified');
        },
        execute: () => {
          return this.state.add();
        }
      },
      {
        id: 'commit',
        label: 'git commit',
        description: '提交暂存区的更改',
        group: 'base',
        check: () => this.state.initialized && this.state.stagedFiles.size > 0,
        execute: (message) => {
          return this.state.commit(message || '更新文件');
        }
      },
      {
        id: 'status',
        label: 'git status',
        description: '查看仓库当前状态',
        group: 'base',
        check: () => this.state.initialized,
        execute: () => this.state.status()
      },
      {
        id: 'log',
        label: 'git log',
        description: '查看提交历史',
        group: 'base',
        check: () => this.state.initialized && this.state.commits.length > 0,
        execute: () => this.state.log()
      },
      {
        id: 'branch',
        label: 'git branch',
        description: '创建一个新分支',
        group: 'branch',
        check: () => {
          if (!this.state.initialized) return false;
          if (this.state.commits.length === 0) return false;
          const newBranchName = this.state.currentBranch === 'main' ? 'feature-login' : 'feature-ui';
          return !this.state.branches[newBranchName];
        },
        execute: () => {
          const name = this.state.currentBranch === 'main' ? 'feature-login' : 'feature-ui';
          return this.state.branch(name);
        }
      },
      {
        id: 'checkout',
        label: 'git checkout',
        description: '切换到另一个分支',
        group: 'branch',
        check: () => {
          if (!this.state.initialized) return false;
          const others = Object.keys(this.state.branches).filter(b => b !== this.state.head);
          return others.length > 0;
        },
        execute: () => {
          const others = Object.keys(this.state.branches).filter(b => b !== this.state.head);
          if (others.length === 0) return { success: false, message: '没有其他分支可切换' };
          return this.state.checkout(others[0]);
        }
      },
      {
        id: 'merge',
        label: 'git merge',
        description: '合并指定分支到当前分支',
        group: 'branch',
        check: () => {
          if (!this.state.initialized) return false;
          const others = Object.keys(this.state.branches).filter(b => b !== this.state.head);
          return others.length > 0 && this.state.commits.length > 0;
        },
        execute: () => {
          const others = Object.keys(this.state.branches).filter(b => b !== this.state.head);
          if (others.length === 0) return { success: false, message: '没有其他分支可合并' };
          return this.state.merge(others[0]);
        }
      },
      {
        id: 'remote',
        label: 'git remote add',
        description: '添加远程仓库',
        group: 'remote',
        check: () => this.state.initialized && !this.state.remoteUrl,
        execute: () => this.state.remote('origin')
      },
      {
        id: 'push',
        label: 'git push',
        description: '推送到远程仓库',
        group: 'remote',
        check: () => {
          if (!this.state.initialized) return false;
          if (!this.state.remoteUrl) return false;
          return this.state.branches[this.state.head] !== null;
        },
        execute: () => this.state.push()
      },
      {
        id: 'pull',
        label: 'git pull',
        description: '从远程仓库拉取',
        group: 'remote',
        check: () => this.state.initialized && this.state.remoteCommits.length > 0,
        execute: () => this.state.pull()
      },
      {
        id: 'clone',
        label: 'git clone',
        description: '克隆远程仓库',
        group: 'remote',
        check: () => this.state.initialized && this.state.remoteUrl,
        execute: () => this.state.clone()
      },
      {
        id: 'restore',
        label: 'git restore',
        description: '撤销工作区的修改',
        group: 'undo',
        check: () => {
          if (!this.state.initialized) return false;
          return Object.values(this.state.files).some(s => s === 'modified');
        },
        execute: () => this.state.restore()
      },
      {
        id: 'reset',
        label: 'git reset',
        description: '取消暂存或撤销提交',
        group: 'undo',
        check: () => {
          if (!this.state.initialized) return false;
          return this.state.stagedFiles.size > 0 || this.state.commits.length > 0;
        },
        execute: () => {
          if (this.state.stagedFiles.size > 0) return this.state.reset('staged');
          return this.state.reset('commit');
        }
      },
      {
        id: 'revert',
        label: 'git revert',
        description: '创建一个撤销提交',
        group: 'undo',
        check: () => this.state.initialized && this.state.branches[this.state.head] !== null,
        execute: () => this.state.revert()
      }
    ];
  }

  getCommandsForGroup(group) {
    return this.commands.filter(c => c.group === group);
  }

  getAllCommands() {
    return this.commands;
  }

  getAvailableCommands() {
    return this.commands.filter(c => c.check());
  }

  execute(commandId, ...args) {
    const cmd = this.commands.find(c => c.id === commandId);
    if (!cmd) return { success: false, message: `未知命令: ${commandId}` };
    if (!cmd.check()) return { success: false, message: '当前状态下无法执行此命令' };
    return cmd.execute(...args);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/commands.js
git commit -m "feat: add command definitions"
```

---

### Task 6: 定义教学场景 (scenarios.js)

**Files:**
- Create: `git-visualizer/js/scenarios.js`

**Description:** 定义 4 个教学场景，每个场景包含多个步骤，每个步骤包含引导文字、可用命令、预期操作。

- [ ] **Step 1: 编写 scenarios.js**

```javascript
const SCENARIOS = [
  {
    id: 'local',
    title: '📍 本地仓库基础',
    subtitle: '学习如何初始化仓库、添加文件、提交更改',
    steps: [
      {
        id: 'local-1',
        instruction: '点击 git init 初始化一个新的 Git 仓库',
        hint: 'tip: git init 会在当前目录创建一个 .git 文件夹',
        availableCommands: ['init'],
        lockedCommands: ['add', 'commit', 'status', 'log', 'branch', 'checkout', 'merge', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'local-2',
        instruction: '现在用 git add 将文件添加到暂存区',
        hint: 'index.html 和 style.css 是未跟踪的红色文件，add 后变绿色',
        availableCommands: ['add'],
        lockedCommands: ['commit', 'status', 'log', 'branch', 'checkout', 'merge', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'local-3',
        instruction: '执行 git commit 提交到仓库',
        hint: 'tip: 每次提交都会在时间线上生成一个新的节点',
        availableCommands: ['commit'],
        lockedCommands: ['status', 'log', 'branch', 'checkout', 'merge', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'local-4',
        instruction: '再创建一些新文件并提交一次，观察 commit 链的变化',
        hint: 'tip: 每次提交节点会串联成一条历史线',
        availableCommands: ['add', 'commit'],
        lockedCommands: ['log', 'branch', 'checkout', 'merge', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'local-5',
        instruction: '用 git status 查看仓库当前状态',
        hint: 'tip: status 是最常用的命令，随时可以查看仓库状态',
        availableCommands: ['status'],
        lockedCommands: ['log', 'branch', 'checkout', 'merge', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'local-6',
        instruction: '用 git log 查看提交历史',
        hint: 'tip: log 显示所有 commit 记录，包括 SHA、作者、时间',
        availableCommands: ['log'],
        lockedCommands: ['branch', 'checkout', 'merge', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      }
    ]
  },
  {
    id: 'branch',
    title: '🌿 分支操作',
    subtitle: '学习如何创建分支、切换分支、合并分支',
    steps: [
      {
        id: 'branch-1',
        instruction: '先做几次提交，为分支做准备',
        hint: 'tip: 分支是基于某个提交创建的',
        availableCommands: ['add', 'commit'],
        lockedCommands: ['branch', 'checkout', 'merge', 'log', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'branch-2',
        instruction: '用 git branch 创建一个新分支',
        hint: 'tip: 分支就像平行宇宙，互不干扰',
        availableCommands: ['branch'],
        lockedCommands: ['checkout', 'merge', 'log', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'branch-3',
        instruction: '用 git checkout 切换到新分支',
        hint: 'tip: HEAD 指针移到新分支上，后续提交将在新分支进行',
        availableCommands: ['checkout'],
        lockedCommands: ['add', 'commit', 'merge', 'log', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'branch-4',
        instruction: '在新分支上做两次提交，观察分叉',
        hint: 'tip: 分支分叉了！main 停在原地，新分支向前走了',
        availableCommands: ['add', 'commit'],
        lockedCommands: ['checkout', 'merge', 'log', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      },
      {
        id: 'branch-5',
        instruction: '切回 main 分支，然后合并新分支',
        hint: 'tip: 先 checkout main，再 merge feature',
        availableCommands: ['checkout', 'merge'],
        lockedCommands: ['add', 'commit', 'log', 'remote', 'push', 'pull', 'clone', 'restore', 'reset', 'revert']
      }
    ]
  },
  {
    id: 'remote',
    title: '☁️ 远程协作',
    subtitle: '学习如何连接远程仓库、推送和拉取代码',
    steps: [
      {
        id: 'remote-1',
        instruction: '先做一些提交作为基础',
        hint: 'tip: 需要有一些提交才能推送到远程',
        availableCommands: ['add', 'commit'],
        lockedCommands: ['remote', 'push', 'pull', 'clone', 'log', 'restore', 'reset', 'revert']
      },
      {
        id: 'remote-2',
        instruction: '用 git remote add 添加远程仓库',
        hint: 'tip: 远程仓库通常叫 origin，是云端备份',
        availableCommands: ['remote'],
        lockedCommands: ['push', 'pull', 'clone', 'log', 'restore', 'reset', 'revert']
      },
      {
        id: 'remote-3',
        instruction: '用 git push 推送到远程仓库',
        hint: 'tip: push 后，远程仓库会有和你本地一样的历史',
        availableCommands: ['push'],
        lockedCommands: ['pull', 'clone', 'log', 'restore', 'reset', 'revert']
      },
      {
        id: 'remote-4',
        instruction: '模拟队友推送了新代码，用 git pull 拉取',
        hint: 'tip: 在真实项目中，每天上班第一件事就是 git pull',
        availableCommands: ['pull'],
        lockedCommands: ['clone', 'log', 'restore', 'reset', 'revert']
      },
      {
        id: 'remote-5',
        instruction: '用 git clone 克隆仓库',
        hint: 'tip: clone 会把远程仓库完整复制到本地',
        availableCommands: ['clone'],
        lockedCommands: ['log', 'restore', 'reset', 'revert']
      }
    ]
  },
  {
    id: 'undo',
    title: '↩️ 撤销与修复',
    subtitle: '学习如何撤销修改、取消暂存、安全回退',
    steps: [
      {
        id: 'undo-1',
        instruction: '先做一次提交作为基础',
        hint: 'tip: 然后我们来模拟一些"错误"操作',
        availableCommands: ['add', 'commit'],
        lockedCommands: ['restore', 'reset', 'revert', 'log']
      },
      {
        id: 'undo-2',
        instruction: '修改一个已提交的文件（模拟误改）',
        hint: 'tip: 修改后文件会变为红色 modified 状态',
        availableCommands: [],
        lockedCommands: ['add', 'commit', 'restore', 'reset', 'revert', 'log'],
        autoExecute: () => {
          // 自动把某个 committed 文件改为 modified
          const committed = Object.entries(state.files).filter(([_, s]) => s === 'committed');
          if (committed.length > 0) {
            state.files[committed[0][0]] = 'modified';
            return { success: true, message: `修改了 ${committed[0][0]}` };
          }
          return { success: false, message: '没有可修改的文件' };
        }
      },
      {
        id: 'undo-3',
        instruction: '用 git restore 撤销修改，文件恢复原样',
        hint: 'tip: restore 让文件回到上一次提交的状态',
        availableCommands: ['restore'],
        lockedCommands: ['add', 'commit', 'reset', 'revert', 'log']
      },
      {
        id: 'undo-4',
        instruction: '修改文件并 git add（模拟错误暂存）',
        hint: 'tip: 不小心把错误文件加到了暂存区',
        availableCommands: ['add'],
        lockedCommands: ['commit', 'reset', 'revert', 'restore', 'log']
      },
      {
        id: 'undo-5',
        instruction: '用 git reset 取消暂存',
        hint: 'tip: reset 可以把文件从暂存区移回工作区',
        availableCommands: ['reset'],
        lockedCommands: ['commit', 'revert', 'restore', 'log']
      },
      {
        id: 'undo-6',
        instruction: '提交当前内容（模拟错误提交）',
        hint: 'tip: 然后我们用 revert 安全撤销',
        availableCommands: ['add', 'commit'],
        lockedCommands: ['revert', 'restore', 'log']
      },
      {
        id: 'undo-7',
        instruction: '用 git revert 创建一个撤销提交',
        hint: 'tip: revert 会生成一个新的"撤销提交"，不会删除历史，是安全的',
        availableCommands: ['revert'],
        lockedCommands: ['restore', 'log']
      }
    ]
  }
];
```

- [ ] **Step 2: 提交**

```bash
git add js/scenarios.js
git commit -m "feat: add teaching scenarios"
```

---

### Task 7: 实现主应用逻辑 (app.js)

**Files:**
- Create: `git-visualizer/js/app.js`

**Description:** 整合所有模块，处理 UI 事件、场景切换、命令执行、动画触发、UI 更新。

- [ ] **Step 1: 编写 app.js**

```javascript
// 全局实例
const gitState = new GitState();
const gitEngine = new GitEngine('gitCanvas');
const animator = new AnimationEngine(gitEngine);
const cmdManager = new CommandManager(gitState, gitEngine, animator);

let currentScenarioIdx = 0;
let currentStepIdx = 0;
let isExecuting = false;

// DOM 引用
const $ = (id) => document.getElementById(id);
const stepListEl = $('stepList');
const commandListEl = $('commandList');
const scenarioTitle = $('scenarioTitle');
const sceneSelect = $('sceneSelect');
const outputContent = $('outputContent');
const workspaceFiles = $('workspaceFiles');
const stagingFiles = $('stagingFiles');
const repoFiles = $('repoFiles');
const commandHint = $('commandHint');
const progressFill = $('progressFill');
const progressText = $('progressText');

// === 输出 ===
function appendOutput(text, type = 'info') {
  const div = document.createElement('div');
  div.className = `output-line ${type}`;
  if (type === 'command') {
    div.textContent = `$ ${text}`;
  } else {
    div.textContent = `> ${text}`;
  }
  outputContent.appendChild(div);
  outputContent.scrollTop = outputContent.scrollHeight;
}

function clearOutput() {
  outputContent.innerHTML = '';
}

// === 场景 ===
function loadScenario(index) {
  const scenario = SCENARIOS[index];
  if (!scenario) return;
  currentScenarioIdx = index;
  currentStepIdx = 0;
  scenarioTitle.textContent = `${scenario.title} — ${scenario.subtitle}`;
  
  // 如果是第一个场景且仓库未初始化，重置状态
  if (index === 0) {
    // 保持状态
  }
  
  renderSteps();
  renderCommands();
  updateProgress();
}

function renderSteps() {
  const scenario = SCENARIOS[currentScenarioIdx];
  stepListEl.innerHTML = '';
  
  scenario.steps.forEach((step, idx) => {
    const div = document.createElement('div');
    div.className = 'step-item';
    if (idx < currentStepIdx) div.classList.add('done');
    else if (idx === currentStepIdx) div.classList.add('active');
    else div.classList.add('locked');
    
    const numSpan = document.createElement('span');
    numSpan.className = 'step-number';
    numSpan.textContent = idx < currentStepIdx ? '✓' : idx + 1;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = step.instruction.length > 30 
      ? step.instruction.substring(0, 30) + '...' 
      : step.instruction;
    
    div.appendChild(numSpan);
    div.appendChild(textSpan);
    
    if (idx < currentStepIdx) {
      div.addEventListener('click', () => {
        currentStepIdx = idx;
        renderSteps();
        renderCommands();
        updateProgress();
      });
    }
    
    stepListEl.appendChild(div);
  });
}

function renderCommands() {
  const scenario = SCENARIOS[currentScenarioIdx];
  const step = scenario.steps[currentStepIdx];
  if (!step) return;
  
  commandHint.textContent = step.hint || '点击命令执行操作';
  
  // 先处理自动执行的步骤
  if (step.autoExecute) {
    setTimeout(() => {
      const result = step.autoExecute();
      if (result) {
        appendOutput(result.message, 'success');
        renderFileZones();
      }
    }, 500);
  }
  
  commandListEl.innerHTML = '';
  
  const available = new Set(step.availableCommands);
  const locked = new Set(step.lockedCommands);
  
  cmdManager.getAllCommands().forEach(cmd => {
    const btn = document.createElement('button');
    btn.className = 'command-btn';
    
    if (available.has(cmd.id)) {
      btn.classList.add('available');
      if (currentStepIdx > 0) btn.classList.add('hint-pulse');
      btn.addEventListener('click', () => executeCommand(cmd.id));
    } else {
      btn.classList.add('locked');
    }
    
    btn.textContent = cmd.label;
    btn.title = cmd.description;
    commandListEl.appendChild(btn);
  });
}

function updateProgress() {
  const scenario = SCENARIOS[currentScenarioIdx];
  if (!scenario) return;
  const total = scenario.steps.length;
  const done = currentStepIdx;
  const pct = Math.round((done / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${done} / ${total}`;
}

// === 文件区 ===
function renderFileZones() {
  const ws = [], st = [], rp = [];
  
  Object.entries(gitState.files).forEach(([name, status]) => {
    if (status === 'untracked') {
      ws.push(`<span class="file-tag untracked">${name}</span>`);
    } else if (status === 'staged') {
      st.push(`<span class="file-tag staged">${name}</span>`);
    } else if (status === 'modified') {
      ws.push(`<span class="file-tag modified">${name}</span>`);
    } else if (status === 'committed') {
      rp.push(`<span class="file-tag committed">${name}</span>`);
    }
  });
  
  workspaceFiles.innerHTML = ws.join('') || '<span style="color:#555; font-size:11px;">空</span>';
  stagingFiles.innerHTML = st.join('') || '<span style="color:#555; font-size:11px;">空</span>';
  repoFiles.innerHTML = rp.join('') || '<span style="color:#555; font-size:11px;">空</span>';
}

// === 命令执行 ===
function executeCommand(commandId) {
  if (isExecuting) return;
  
  const scenario = SCENARIOS[currentScenarioIdx];
  const step = scenario.steps[currentStepIdx];
  if (!step) return;
  
  // 检查命令是否在当前步骤可用
  if (!step.availableCommands.includes(commandId)) {
    appendOutput('当前步骤不可用此命令', 'error');
    return;
  }
  
  isExecuting = true;
  
  appendOutput(cmdManager.commands.find(c => c.id === commandId).label, 'command');
  
  // 执行命令
  const result = cmdManager.execute(commandId);
  
  if (result.success) {
    appendOutput(result.message, 'success');
    
    // 渲染
    gitEngine.lastState = gitState.getRenderData();
    gitEngine.render(gitEngine.lastState);
    renderFileZones();
    
    // 触发动画
    let animTask = null;
    
    if (commandId === 'add') {
      // 文件飞入动画
      animTask = () => animator.flyFile(
        { x: 80, y: 200 },
        { x: 250, y: 200 },
        '#f39c12',
        () => { isExecuting = false; renderCommands(); }
      );
    } else if (commandId === 'commit' && result.commit) {
      // 节点脉冲动画 — 找到新节点位置
      const pos = gitEngine.nodePositions.find(p => p.id === result.commit.id);
      if (pos) {
        animTask = () => animator.pulseNode(pos.x, pos.y, 18, () => {
          isExecuting = false; renderCommands();
        });
      }
    } else if (commandId === 'push' && result.pushedCommits) {
      animTask = () => animator.fadeInText('☁️ 推送到远程!', 350, 60, '#4ec9b0', () => {
        isExecuting = false; renderCommands();
      });
    } else if (commandId === 'pull' && result.pulledCommits) {
      animTask = () => animator.fadeInText('⬇️ 拉取完成!', 350, 60, '#27ae60', () => {
        isExecuting = false; renderCommands();
      });
    } else if (commandId === 'merge' && result.isMerge) {
      // 合并动画
      const pos = gitEngine.nodePositions.find(p => p.id === result.commit.id);
      if (pos) {
        animTask = () => animator.pulseNode(pos.x, pos.y, 18, () => {
          isExecuting = false; renderCommands();
        });
      } else {
        animTask = () => {
          gitEngine.render(gitEngine.lastState);
          isExecuting = false; renderCommands();
        };
      }
    } else if (commandId === 'branch') {
      animTask = () => animator.fadeInText('🌿 新分支创建!', 350, 200, '#27ae60', () => {
        isExecuting = false; renderCommands();
      });
    } else {
      animTask = () => {
        gitEngine.render(gitEngine.lastState);
        isExecuting = false; renderCommands();
      };
    }
    
    if (animTask) animTask();
    
    // 检查是否该进入下一步
    setTimeout(() => {
      // 检查是否所有可用命令都已执行过
      // 简化：执行一次后就进下一步
      if (!isExecuting) {
        advanceStep();
      }
    }, 1200);
    
  } else {
    appendOutput(result.message, 'error');
    isExecuting = false;
  }
}

function advanceStep() {
  const scenario = SCENARIOS[currentScenarioIdx];
  if (currentStepIdx < scenario.steps.length - 1) {
    currentStepIdx++;
  } else {
    // 场景完成
    appendOutput('🎉 恭喜完成本场景！可以切换到下一个场景', 'success');
    // 如果还有下一个场景，提示切换
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      appendOutput(`💡 试试选择场景: ${SCENARIOS[currentScenarioIdx + 1].title}`, 'info');
    }
  }
  renderSteps();
  renderCommands();
  updateProgress();
}

// === 场景切换 ===
sceneSelect.addEventListener('change', (e) => {
  const idx = parseInt(e.target.value);
  if (idx !== currentScenarioIdx) {
    loadScenario(idx);
    appendOutput(`切换到场景: ${SCENARIOS[idx].title}`, 'info');
  }
});

// === Canvas 点击 ===
document.getElementById('gitCanvas').addEventListener('click', (e) => {
  const rect = gitEngine.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const node = gitEngine.getNodeAt(x, y);
  if (node && node.commit) {
    appendOutput(`提交 ${node.id}: ${node.commit.message}`, 'info');
  }
});

// === 初始化 ===
function init() {
  loadScenario(0);
  gitEngine.render({ initialized: false });
  renderFileZones();
  appendOutput('欢迎使用 Git 可视化教室！选择一个场景开始学习。', 'welcome');
}

// 启动
document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 2: 验证**

浏览器打开 index.html，确认能够加载、场景显示、命令按钮可点击、Canvas 能渲染。

- [ ] **Step 3: 提交**

```bash
git add js/app.js
git commit -m "feat: add main application logic"
```

---

### Task 8: 集成测试与 Bug 修复

**Files:**
- Modify: `git-visualizer/index.html`
- Modify: potentially all JS files

**Description:** 完整走通 4 个场景，修复过程中发现的 Bug，确保 MVP 流畅可用。

- [ ] **Step 1: 功能走查**

打开 index.html，按顺序完成每个场景的全部步骤：
1. 场景"本地仓库基础"：init → add → commit → add+commit → status → log
2. 场景"分支操作"：多次 commit → branch → checkout → commit → checkout+merge
3. 场景"远程协作"：commit → remote → push → pull → clone
4. 场景"撤销修复"：commit → 自动修改 → restore → add → reset → add+commit → revert

记录每个步骤的实际表现与预期差异。

- [ ] **Step 2: 修复所有 Bug**

针对 Step 1 发现的问题逐一修复。常见问题：
- Canvas 尺寸响应式不对
- 分支切换后 commit 链显示异常
- 动画触发时机不准
- 命令可用性判断逻辑错误
- 场景步骤推进逻辑

- [ ] **Step 3: 做一次完整流程测试**

确认所有 4 个场景可顺利完成，无 JS 报错，视觉效果符合设计。

- [ ] **Step 4: 提交最终修复**

```bash
git add -A
git commit -m "fix: resolve integration issues and polish MVP"
```

---

## 自审清单

1. **Spec 覆盖度**：设计文档中的所有功能点都对应到具体的 Task：
   - 三栏布局 → Task 1
   - Git 状态模拟 → Task 2
   - Canvas 渲染（节点、分支、连线）→ Task 3
   - 动画效果 → Task 4
   - 命令定义 → Task 5
   - 4 个场景定义 → Task 6
   - 应用整合 → Task 7
   - 集成测试 → Task 8

2. **占位符检查**：无 "TBD"、"TODO" 等占位符，所有代码均为完整实现。

3. **类型一致性**：state.js 中的方法签名（返回 `{success, message, ...}`）与 commands.js 和 app.js 中的使用方式一致。
