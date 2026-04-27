# Git 可视化教室（Remotion 版）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有纯 HTML/Canvas 的 Git 可视化教室重构为 React + Remotion Player 交互式教学应用（原型：场景 1，5 个操作）

**Architecture:** Vite + React 18 + TypeScript 作为应用框架，Remotion 负责所有动画渲染（每个 Git 操作为一个 Composition），@remotion/player 嵌入并支持 scrub/step/replay。UI 用 Tailwind CSS，明亮开发者风格。

**Tech Stack:** Vite + React 18 + TypeScript + Remotion 4.x + @remotion/player + Tailwind CSS + Space Grotesk / JetBrains Mono 字体

---

## 文件结构

```
git-visualizer/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── remotion.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── state/
│   │   └── GitState.ts
│   ├── lib/
│   │   └── commands.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── StepPanel.tsx
│   │   ├── TerminalCommands.tsx
│   │   ├── OutputLog.tsx
│   │   ├── AnimationStage.tsx
│   │   ├── AnimationControls.tsx
│   │   └── TeachingOverlay.tsx
│   └── remotion/
│       ├── Root.tsx
│       ├── GitGraph.tsx
│       ├── operations/
│       │   ├── InitScene.tsx
│       │   ├── AddScene.tsx
│       │   └── CommitScene.tsx
│       └── shared/
│           ├── CommitNode.tsx
│           ├── BranchLabel.tsx
│           └── ConnectionLine.tsx
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`, `tsconfig.node.json`
- Create: `tailwind.config.js`, `postcss.config.js`
- Create: `remotion.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: all empty subdirectories

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "git-visualizer",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "remotion": "^4.0.242",
    "@remotion/player": "^4.0.242"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.6.3",
    "vite": "^6.0.5"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

`vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

`remotion.config.ts`:
```ts
import { Config } from '@remotion/cli/config';

Config.overrideWebpackConfig((config) => {
  return config;
});
```

- [ ] **Step 3: 创建 TypeScript 配置**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "remotion.config.ts"]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 创建 Tailwind + PostCSS 配置**

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: '#F05032',
        'surface': '#F6F8FA',
        'border': '#D0D7DE',
        'terminal': '#0D1117',
        'success': '#2DA44E',
      },
    },
  },
  plugins: [],
};
```

`postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: 创建 index.html 和入口文件**

`index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git 可视化教室</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F6F8FA;
  color: #1F2328;
}
```

- [ ] **Step 6: 创建目录结构**

```bash
mkdir -p src/state src/lib src/components src/remotion/operations src/remotion/shared
```

- [ ] **Step 7: 安装依赖并验证**

```bash
npm install
npm run dev
```

Expected: Vite dev server starts on http://localhost:5173, shows blank page

- [ ] **Step 8: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js remotion.config.ts index.html src/main.tsx src/index.css
git rm -r css/ js/ docs/ .superpowers/ .worktrees/
git rm index.html
git commit -m "feat: scaffold Vite + React + Remotion project"
```

---

### Task 2: Git 引擎（TypeScript 移植）

**Files:**
- Create: `src/types.ts`
- Create: `src/state/GitState.ts`
- Create: `src/lib/commands.ts`

- [ ] **Step 1: 创建类型定义**

`src/types.ts`:
```ts
export type FileStatus = 'untracked' | 'staged' | 'committed' | 'modified';

export interface Commit {
  id: string;
  message: string;
  parent: string | null;
  branch: string;
  timestamp: number;
  isMerge: boolean;
  isRevert: boolean;
  parents: string[];
}

export interface CommandResult {
  success: boolean;
  message: string;
  commit?: Commit;
  isMerge?: boolean;
  isFastForward?: boolean;
  pushedCommits?: Commit[];
  pulledCommits?: Commit[];
  restoredFiles?: string[];
  unstagedFiles?: string[];
}

export interface GitRenderData {
  initialized: boolean;
  commits: Commit[];
  branches: Record<string, string | null>;
  head: string | null;
  currentBranch: string | null;
  files: Record<string, FileStatus>;
  stagedFiles: string[];
  remoteCommits: Commit[];
  remoteUrl: string | null;
}

export interface CommandDef {
  id: string;
  label: string;
  group: 'base' | 'branch' | 'remote' | 'undo';
  check: () => boolean;
  execute: (...args: string[]) => CommandResult;
}

export interface ScenarioStep {
  id: string;
  instruction: string;
  hint: string;
  availableCommands: string[];
  lockedCommands: string[];
  createFiles?: string[];
  autoModify?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  steps: ScenarioStep[];
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  branch: string;
  commit: Commit;
  isMerge: boolean;
  isRevert: boolean;
}
```

- [ ] **Step 2: 移植 GitState 类（TypeScript）**

`src/state/GitState.ts`:
```ts
import { Commit, CommandResult, FileStatus, GitRenderData } from '../types';

export class GitState {
  initialized = false;
  commits: Commit[] = [];
  branches: Record<string, string | null> = {};
  head: string | null = null;
  currentBranch: string | null = null;
  files: Record<string, FileStatus> = {};
  stagedFiles: Set<string> = new Set();
  remoteCommits: Commit[] = [];
  remoteUrl: string | null = null;

  private initDefaults(): void {
    this.initialized = false;
    this.commits = [];
    this.branches = {};
    this.head = null;
    this.currentBranch = null;
    this.files = {};
    this.stagedFiles = new Set();
    this.remoteCommits = [];
    this.remoteUrl = null;
  }

  constructor() {
    this.initDefaults();
  }

  init(): CommandResult {
    if (this.initialized) return { success: false, message: '仓库已初始化' };
    this.initialized = true;
    this.branches['main'] = null;
    this.head = 'main';
    this.currentBranch = 'main';
    return { success: true, message: '已初始化空的 Git 仓库' };
  }

  createFile(filename: string): CommandResult {
    if (this.files[filename]) return { success: false, message: `文件 ${filename} 已存在` };
    this.files[filename] = 'untracked';
    return { success: true, message: `创建文件 ${filename}` };
  }

  add(filenames?: string[]): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库 (git init)' };
    const names = filenames || Object.keys(this.files).filter(f => this.files[f] === 'untracked' || this.files[f] === 'modified');
    if (names.length === 0) return { success: false, message: '没有可添加的文件' };
    names.forEach(f => {
      if (this.files[f]) {
        this.files[f] = 'staged';
        this.stagedFiles.add(f);
      }
    });
    return { success: true, message: `已将 ${names.length} 个文件添加到暂存区` };
  }

  commit(message?: string): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.stagedFiles.size === 0) return { success: false, message: '暂存区为空，请先 git add' };
    const id = this.generateId();
    const parentCommit = this.branches[this.currentBranch!];
    const commit: Commit = {
      id,
      message: message || '新提交',
      parent: parentCommit,
      branch: this.currentBranch!,
      timestamp: Date.now(),
      isMerge: false,
      isRevert: false,
      parents: parentCommit ? [parentCommit] : [],
    };
    this.commits.push(commit);
    this.branches[this.currentBranch!] = id;
    this.stagedFiles.forEach(f => { this.files[f] = 'committed'; });
    this.stagedFiles.clear();
    return { success: true, message: `[${this.currentBranch}] ${id} ${message || '新提交'}`, commit };
  }

  status(): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    const untracked = Object.entries(this.files).filter(([_, s]) => s === 'untracked').map(([f]) => f);
    const staged = Object.entries(this.files).filter(([_, s]) => s === 'staged').map(([f]) => f);
    const modified = Object.entries(this.files).filter(([_, s]) => s === 'modified').map(([f]) => f);
    return { success: true, message: '查看仓库状态', untracked, staged, modified };
  }

  log(): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.commits.length === 0) return { success: false, message: '没有提交记录' };
    const commitChain: Commit[] = [];
    let currentId = this.branches[this.currentBranch!];
    while (currentId) {
      const commit = this.commits.find(c => c.id === currentId);
      if (!commit) break;
      commitChain.push(commit);
      currentId = commit.parent;
    }
    return { success: true, message: '查看提交历史', commits: commitChain };
  }

  branch(name: string): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.branches[name]) return { success: false, message: `分支 ${name} 已存在` };
    this.branches[name] = this.branches[this.head!];
    return { success: true, message: `创建分支 ${name}` };
  }

  checkout(target: string): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.branches[target]) return { success: false, message: `分支 ${target} 不存在` };
    this.head = target;
    this.currentBranch = target;
    return { success: true, message: `切换到分支 ${target}` };
  }

  remote(url?: string): CommandResult {
    this.remoteUrl = url || 'origin';
    return { success: true, message: `添加远程仓库 ${this.remoteUrl}` };
  }

  getRenderData(): GitRenderData {
    return {
      initialized: this.initialized,
      commits: [...this.commits],
      branches: { ...this.branches },
      head: this.head,
      currentBranch: this.currentBranch,
      files: { ...this.files },
      stagedFiles: [...this.stagedFiles],
      remoteCommits: [...this.remoteCommits],
      remoteUrl: this.remoteUrl,
    };
  }

  private generateId(): string {
    return 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
      .sort(() => Math.random() - 0.5).slice(0, 7).join('');
  }
}
```

- [ ] **Step 3: 创建命令定义和场景数据**

`src/lib/commands.ts`:
```ts
import { CommandDef, Scenario } from '../types';
import { GitState } from '../state/GitState';

export function defineCommands(state: GitState): CommandDef[] {
  return [
    {
      id: 'init',
      label: 'git init',
      group: 'base',
      check: () => !state.initialized,
      execute: () => {
        const result = state.init();
        if (result.success) {
          state.createFile('index.html');
          state.createFile('style.css');
        }
        return result;
      },
    },
    {
      id: 'add',
      label: 'git add',
      group: 'base',
      check: () => {
        if (!state.initialized) return false;
        return Object.values(state.files).some(s => s === 'untracked' || s === 'modified');
      },
      execute: () => state.add(),
    },
    {
      id: 'commit',
      label: 'git commit',
      group: 'base',
      check: () => state.initialized && state.stagedFiles.size > 0,
      execute: (message?: string) => state.commit(message || '更新文件'),
    },
    {
      id: 'status',
      label: 'git status',
      group: 'base',
      check: () => state.initialized,
      execute: () => state.status(),
    },
    {
      id: 'log',
      label: 'git log',
      group: 'base',
      check: () => state.initialized && state.commits.length > 0,
      execute: () => state.log(),
    },
  ];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'local',
    title: '📍 本地仓库基础',
    subtitle: '学习如何初始化仓库、添加文件、提交更改',
    steps: [
      {
        id: 'local-1',
        instruction: '点击 git init 初始化一个新的 Git 仓库',
        hint: '💡 git init 会在当前目录创建一个 .git 文件夹',
        availableCommands: ['init'],
        lockedCommands: ['add', 'commit', 'status', 'log'],
      },
      {
        id: 'local-2',
        instruction: '用 git add 将文件添加到暂存区',
        hint: '💡 index.html 和 style.css 是未跟踪文件，add 后变绿色',
        availableCommands: ['add'],
        lockedCommands: ['commit', 'status', 'log'],
      },
      {
        id: 'local-3',
        instruction: '执行 git commit 提交到仓库',
        hint: '💡 每次提交都会在时间线上生成一个新的节点',
        availableCommands: ['commit'],
        lockedCommands: ['status', 'log'],
      },
      {
        id: 'local-4',
        instruction: '再创建一些新文件并提交一次',
        hint: '💡 每次提交节点会串联成一条历史线',
        createFiles: ['README.md'],
        availableCommands: ['add', 'commit'],
        lockedCommands: ['log'],
      },
      {
        id: 'local-5',
        instruction: '用 git status 查看仓库当前状态',
        hint: '💡 status 是最常用的命令，随时查看仓库状态',
        availableCommands: ['status'],
        lockedCommands: ['log'],
      },
      {
        id: 'local-6',
        instruction: '用 git log 查看提交历史',
        hint: '💡 log 显示所有 commit 记录，包括 SHA、消息',
        availableCommands: ['log'],
        lockedCommands: [],
      },
    ],
  },
];
```

- [ ] **Step 4: 验证编译**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/state/GitState.ts src/lib/commands.ts
git commit -m "feat: add GitState TypeScript port and command definitions"
```

---

### Task 3: UI 布局组件

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/StepPanel.tsx`
- Create: `src/components/TerminalCommands.tsx`
- Create: `src/components/OutputLog.tsx`

- [ ] **Step 1: 创建 Layout 主框架**

`src/components/Layout.tsx`:
```tsx
import React from 'react';

interface LayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
  progress?: number;
  progressText?: string;
}

export const Layout: React.FC<LayoutProps> = ({ left, center, bottomLeft, bottomRight, progress = 0, progressText = '0 / 0' }) => {
  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-heading font-bold text-lg text-[#1F2328]">
            Git 可视化教室
          </h1>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm text-[#656D76]">交互式 Git 学习</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-40 h-1.5 bg-[#E8ECF0] rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-[#656D76] font-mono">{progressText}</span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Steps */}
        <aside className="w-60 flex-shrink-0 bg-white border-r border-border overflow-y-auto">
          {left}
        </aside>

        {/* Center: Animation stage */}
        <main className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          <div className="flex-1 rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-12 h-1 bg-accent" />
            {center}
          </div>
        </main>
      </div>

      {/* Bottom bar */}
      <div className="flex h-40 border-t border-border">
        <div className="flex-1 border-r border-border overflow-y-auto bg-white">
          {bottomLeft}
        </div>
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          {bottomRight}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 创建 StepPanel**

`src/components/StepPanel.tsx`:
```tsx
import React from 'react';
import { Scenario, ScenarioStep } from '../types';

interface StepPanelProps {
  scenario: Scenario;
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick: (stepIndex: number) => void;
}

export const StepPanel: React.FC<StepPanelProps> = ({
  scenario,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="p-4">
      <h2 className="font-heading font-semibold text-sm text-[#1F2328] mb-1">
        {scenario.title}
      </h2>
      <p className="text-xs text-[#656D76] mb-4">{scenario.subtitle}</p>
      <div className="space-y-1">
        {scenario.steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = completedSteps.has(step.id);
          const isLocked = !isDone && !isActive;

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && onStepClick(idx)}
              disabled={isLocked}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150
                ${isActive ? 'bg-[#FFF0EB] text-accent font-semibold' : ''}
                ${isDone ? 'text-[#2DA44E]' : ''}
                ${isLocked ? 'text-[#959DA5] cursor-not-allowed' : 'hover:bg-[#F6F8FA]'}
              `}
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0
                ${isActive ? 'bg-accent text-white' : ''}
                ${isDone ? 'bg-[#2DA44E] text-white' : ''}
                ${isLocked ? 'bg-[#E8ECF0] text-[#959DA5]' : ''}
                ${!isActive && !isDone && !isLocked ? 'bg-[#E8ECF0] text-[#656D76]' : ''}
              `}>
                {isDone ? '✓' : idx + 1}
              </span>
              <span className="text-sm truncate">{step.instruction}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 3: 创建 TerminalCommands**

`src/components/TerminalCommands.tsx`:
```tsx
import React from 'react';
import { CommandDef } from '../types';

interface TerminalCommandsProps {
  commands: CommandDef[];
  availableCommands: string[];
  onExecute: (commandId: string) => void;
}

export const TerminalCommands: React.FC<TerminalCommandsProps> = ({
  commands,
  availableCommands,
  onExecute,
}) => {
  return (
    <div className="p-4">
      <div className="bg-terminal rounded-lg p-3 font-mono text-sm">
        {commands.map(cmd => {
          const isAvailable = availableCommands.includes(cmd.id);
          return (
            <button
              key={cmd.id}
              onClick={() => isAvailable && onExecute(cmd.id)}
              disabled={!isAvailable}
              className={`
                w-full text-left px-3 py-2 rounded-md transition-all duration-150
                flex items-center gap-2
                ${isAvailable
                  ? 'text-[#E6EDF3] hover:bg-[#161B22] active:scale-[0.98] cursor-pointer'
                  : 'text-[#484F58] cursor-not-allowed'}
              `}
            >
              <span className={isAvailable ? 'text-[#3FB950]' : 'text-[#484F58]'}>$</span>
              <span>{cmd.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: 创建 OutputLog**

`src/components/OutputLog.tsx`:
```tsx
import React, { useEffect, useRef } from 'react';

interface LogEntry {
  text: string;
  type: 'command' | 'success' | 'error' | 'info' | 'welcome';
}

interface OutputLogProps {
  entries: LogEntry[];
}

export const OutputLog: React.FC<OutputLogProps> = ({ entries }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const colors: Record<string, string> = {
    command: 'text-[#4EC9B0]',
    success: 'text-[#2DA44E]',
    error: 'text-[#E74C3C]',
    info: 'text-[#656D76]',
    welcome: 'text-[#656D76] italic',
  };

  return (
    <div className="p-4">
      <div className="font-semibold text-xs text-[#656D76] mb-2 uppercase tracking-wider">输出</div>
      <div className="font-mono text-sm space-y-1">
        {entries.map((entry, i) => (
          <div key={i} className={`${colors[entry.type]} leading-relaxed animate-[fadeIn_0.2s_ease]`}>
            {entry.type === 'command' ? `$ ${entry.text}` : `> ${entry.text}`}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
```

- [ ] **Step 5: 验证编译**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/components/Layout.tsx src/components/StepPanel.tsx src/components/TerminalCommands.tsx src/components/OutputLog.tsx
git commit -m "feat: add UI layout components"
```

---

### Task 4: Remotion 共享组件

**Files:**
- Create: `src/remotion/shared/CommitNode.tsx`
- Create: `src/remotion/shared/BranchLabel.tsx`
- Create: `src/remotion/shared/ConnectionLine.tsx`
- Create: `src/remotion/GitGraph.tsx`

- [ ] **Step 1: 创建 CommitNode**

`src/remotion/shared/CommitNode.tsx`:
```tsx
import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { NodePosition } from '../../types';

interface CommitNodeProps {
  node: NodePosition;
  isCurrent: boolean;
  isHovered: boolean;
  delay?: number;
}

export const CommitNode: React.FC<CommitNodeProps> = ({ node, isCurrent, isHovered, delay = 0 }) => {
  const frame = useCurrentFrame();
  const radius = isCurrent ? 20 : 16;
  const hoverScale = isHovered ? 1.15 : 1;

  const appear = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 15, stiffness: 80 },
  });

  const pulseOpacity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.3, 0.6],
  );

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) scale(${appear * hoverScale})`}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow ring for current node */}
      {isCurrent && (
        <circle
          r={radius + 4}
          fill="none"
          stroke="#F05032"
          strokeWidth={2}
          opacity={pulseOpacity}
        />
      )}

      {/* Hover ring */}
      {isHovered && (
        <circle
          r={radius + 6}
          fill="none"
          stroke="#F05032"
          strokeWidth={2}
          opacity={0.3}
        />
      )}

      {/* Main circle */}
      <defs>
        <radialGradient id={`grad-${node.id}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor={node.isMerge ? '#FF8A65' : '#FF6B4A'} />
          <stop offset="100%" stopColor={node.isMerge ? '#F05032' : '#D93A1A'} />
        </radialGradient>
      </defs>

      <circle r={radius} fill={`url(#grad-${node.id})`} />
      <circle r={radius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

      {/* Merge marker */}
      {node.isMerge && (
        <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight="bold">
          M
        </text>
      )}

      {/* SHA label */}
      <text
        y={radius + 14}
        textAnchor="middle"
        fill="#656D76"
        fontSize={10}
        fontFamily="JetBrains Mono"
      >
        {node.id.substring(0, 6)}
      </text>

      {/* Message label */}
      <text
        y={radius + 28}
        textAnchor="middle"
        fill="#656D76"
        fontSize={11}
        fontFamily="Space Grotesk"
      >
        {node.commit.message.length > 20
          ? node.commit.message.substring(0, 20) + '…'
          : node.commit.message}
      </text>
    </g>
  );
};
```

- [ ] **Step 2: 创建 BranchLabel**

`src/remotion/shared/BranchLabel.tsx`:
```tsx
import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { NodePosition } from '../../types';

interface BranchLabelProps {
  branchName: string;
  node: NodePosition;
  isHEAD: boolean;
  color: string;
  delay?: number;
}

const BRANCH_COLORS: Record<string, string> = {
  main: '#F05032',
  'feature-login': '#2DA44E',
  'feature-ui': '#1F6FEB',
};

export const BranchLabel: React.FC<BranchLabelProps> = ({
  branchName,
  node,
  isHEAD,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const bgColor = BRANCH_COLORS[branchName] || color;

  const appear = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  });

  const label = isHEAD ? `${branchName} (HEAD)` : branchName;
  const labelW = label.length * 8 + 20;
  const lx = node.x + 20;
  const ly = node.y - 20;

  return (
    <g
      transform={`translate(0, ${(1 - appear) * -10})`}
      opacity={appear}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={lx}
        y={ly - 12}
        width={labelW}
        height={22}
        rx={6}
        fill={bgColor}
        opacity={0.95}
      />
      <text
        x={lx + labelW / 2}
        y={ly + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={11}
        fontFamily="JetBrains Mono"
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
};
```

- [ ] **Step 3: 创建 ConnectionLine**

`src/remotion/shared/ConnectionLine.tsx`:
```tsx
import React from 'react';
import { useCurrentFrame, spring } from 'remotion';
import { NodePosition } from '../../types';

interface ConnectionLineProps {
  from: NodePosition;
  to: NodePosition;
  color: string;
  isMerge?: boolean;
  delay?: number;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  from,
  to,
  color,
  isMerge = false,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 20, stiffness: 60 },
  });

  const endX = from.x + (to.x - from.x) * progress;
  const endY = from.y + (to.y - from.y) * progress;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={endX}
      y2={endY}
      stroke={color}
      strokeWidth={isMerge ? 2 : 2.5}
      strokeDasharray={isMerge ? '5 3' : 'none'}
      opacity={progress}
    />
  );
};
```

- [ ] **Step 4: 创建 GitGraph（主 Composition）**

`src/remotion/GitGraph.tsx`:
```tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GitRenderData, NodePosition } from '../types';
import { CommitNode } from './shared/CommitNode';
import { BranchLabel } from './shared/BranchLabel';
import { ConnectionLine } from './shared/ConnectionLine';

interface GitGraphProps {
  renderData: GitRenderData;
  hoveredNode: string | null;
  onNodeHover?: (id: string | null) => void;
}

const BRANCH_COLORS = ['#F05032', '#2DA44E', '#1F6FEB', '#9B59B6', '#E67E22', '#1ABC9C'];

function calculateLayout(data: GitRenderData): { positions: NodePosition[]; branchColors: Record<string, string> } {
  const positions: NodePosition[] = [];
  const drawn = new Set<string>();
  const branchColors: Record<string, string> = {};
  let colorIndex = 0;

  if (!data.initialized || data.commits.length === 0) {
    return { positions: [], branchColors: {} };
  }

  const branchList = Object.keys(data.branches);

  branchList.forEach((branch) => {
    if (!branchColors[branch]) {
      branchColors[branch] = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
      colorIndex++;
    }

    const chain: string[] = [];
    let current = data.branches[branch];
    while (current) {
      if (drawn.has(current)) break;
      chain.unshift(current);
      drawn.add(current);
      const commit = data.commits.find(c => c.id === current);
      current = commit ? commit.parent : null;
    }

    const bi = branchList.indexOf(branch);
    chain.forEach((commitId, ci) => {
      const x = 80 + ci * 90 + bi * 8;
      const y = 70 + bi * 70;
      const existing = positions.find(p => p.id === commitId);
      if (!existing) {
        const commit = data.commits.find(c => c.id === commitId)!;
        positions.push({
          id: commitId,
          x, y,
          branch,
          commit,
          isMerge: commit.isMerge || false,
          isRevert: commit.isRevert || false,
        });
      }
    });
  });

  return { positions, branchColors };
}

export const GitGraph: React.FC<GitGraphProps> = ({ renderData, hoveredNode }) => {
  if (!renderData.initialized) {
    return (
      <AbsoluteFill className="flex items-center justify-center">
        <p className="text-[#656D76] font-heading text-lg">尚未初始化 Git 仓库</p>
        <p className="text-[#959DA5] text-sm mt-2">点击右侧 git init 开始</p>
      </AbsoluteFill>
    );
  }

  if (renderData.commits.length === 0) {
    return (
      <AbsoluteFill className="flex items-center justify-center">
        <p className="text-[#656D76] font-heading text-lg">仓库已初始化，尚无提交</p>
        <p className="text-[#959DA5] text-sm mt-2">创建文件并执行 git add / git commit</p>
      </AbsoluteFill>
    );
  }

  const { positions, branchColors } = calculateLayout(renderData);
  const currentCommit = renderData.branches[renderData.head!];

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        {/* Connection lines */}
        {positions.map(pos => {
          const commit = pos.commit;
          if (!commit || !commit.parent) return null;
          const parent = positions.find(p => p.id === commit.parent);
          if (!parent) return null;
          return (
            <ConnectionLine
              key={`line-${pos.id}`}
              from={parent}
              to={pos}
              color={branchColors[pos.branch]}
            />
          );
        })}

        {/* Merge lines */}
        {positions.map(pos => {
          if (!pos.isMerge || !pos.commit.parents || pos.commit.parents.length < 2) return null;
          const secondParent = positions.find(p => p.id === pos.commit.parents[1]);
          if (!secondParent) return null;
          return (
            <ConnectionLine
              key={`merge-${pos.id}`}
              from={secondParent}
              to={pos}
              color={branchColors[pos.branch]}
              isMerge
            />
          );
        })}

        {/* Branch labels */}
        {Object.entries(renderData.branches).map(([branchName, commitId]) => {
          if (!commitId) return null;
          const pos = positions.find(p => p.id === commitId);
          if (!pos) return null;
          return (
            <BranchLabel
              key={`branch-${branchName}`}
              branchName={branchName}
              node={pos}
              isHEAD={renderData.head === branchName}
              color={branchColors[branchName]}
            />
          );
        })}

        {/* Commit nodes */}
        {positions.map(pos => (
          <CommitNode
            key={`node-${pos.id}`}
            node={pos}
            isCurrent={pos.id === currentCommit}
            isHovered={hoveredNode === pos.id}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 5: 验证编译**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/remotion/shared/CommitNode.tsx src/remotion/shared/BranchLabel.tsx src/remotion/shared/ConnectionLine.tsx src/remotion/GitGraph.tsx
git commit -m "feat: add Remotion Git graph components"
```

---

### Task 5: Remotion 操作场景 + 教学引导

**Files:**
- Create: `src/remotion/Root.tsx`
- Create: `src/remotion/operations/InitScene.tsx`
- Create: `src/remotion/operations/AddScene.tsx`
- Create: `src/remotion/operations/CommitScene.tsx`
- Create: `src/components/TeachingOverlay.tsx`

- [ ] **Step 1: 创建 Operation 基类场景（InitScene）**

`src/remotion/operations/InitScene.tsx`:
```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';

interface InitSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const InitScene: React.FC<InitSceneProps> = ({
  afterState,
  hoveredNode,
  onNodeHover,
}) => {
  const frame = useCurrentFrame();
  const duration = 45;

  const opacity = interpolate(frame, [0, duration * 0.3], [0, 1]);
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      <GitGraph
        renderData={afterState}
        hoveredNode={hoveredNode}
        onNodeHover={onNodeHover}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: 创建 AddScene（文件飞入动画）**

`src/remotion/operations/AddScene.tsx`:
```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';

interface AddSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const AddScene: React.FC<AddSceneProps> = ({
  beforeState,
  afterState,
  hoveredNode,
  onNodeHover,
}) => {
  const frame = useCurrentFrame();
  const duration = 30;

  // Files that moved from workspace to staging
  const movedFiles = Object.keys(beforeState.files).filter(f =>
    beforeState.files[f] === 'untracked' && afterState.files[f] === 'staged'
  );

  const progress = interpolate(frame, [0, duration], [0, 1]);
  const easeProgress = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 80 },
  });

  // File flying from workspace (left side of graph) to staging (center)
  const fileX = interpolate(easeProgress, [0, 1], [150, 350]);
  const fileY = interpolate(easeProgress, [0, 1], [200, 180]);
  const fileOpacity = interpolate(frame, [0, duration * 0.8], [1, 1]);
  const fileDoneOpacity = interpolate(frame, [duration * 0.8, duration], [1, 0]);

  return (
    <AbsoluteFill>
      {/* Git graph fades in from before state */}
      <div style={{ opacity: interpolate(frame, [0, 10], [1, 0]) }}>
        <GitGraph
          renderData={beforeState}
          hoveredNode={hoveredNode}
          onNodeHover={onNodeHover}
        />
      </div>
      <div style={{ opacity: interpolate(frame, [10, duration], [0, 1]) }}>
        <GitGraph
          renderData={afterState}
          hoveredNode={hoveredNode}
          onNodeHover={onNodeHover}
        />
      </div>

      {/* Flying file */}
      <div
        style={{
          position: 'absolute',
          left: fileX,
          top: fileY,
          opacity: fileOpacity,
        }}
      >
        <div
          style={{
            background: '#FF6B4A',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: 'JetBrains Mono',
            boxShadow: '0 4px 12px rgba(240,80,50,0.3)',
            transform: `scale(${interpolate(easeProgress, [0, 0.5, 1], [1, 1.2, 1])})`,
          }}
        >
          {movedFiles[0] || 'index.html'}
        </div>
      </div>

      {/* Completion flash */}
      {frame > duration - 5 && (
        <AbsoluteFill
          style={{
            background: 'rgba(45, 164, 78, 0.1)',
            opacity: interpolate(frame, [duration - 5, duration], [0, 0.3, 0]),
          }}
        />
      )}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: 创建 CommitScene（新节点弹出）**

`src/remotion/operations/CommitScene.tsx`:
```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';

interface CommitSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const CommitScene: React.FC<CommitSceneProps> = ({
  beforeState,
  afterState,
  hoveredNode,
  onNodeHover,
}) => {
  const frame = useCurrentFrame();
  const duration = 36;

  return (
    <AbsoluteFill>
      <div style={{ opacity: interpolate(frame, [0, duration * 0.2], [1, 0]) }}>
        <GitGraph
          renderData={beforeState}
          hoveredNode={hoveredNode}
          onNodeHover={onNodeHover}
        />
      </div>
      <div style={{ opacity: interpolate(frame, [duration * 0.2, duration], [0, 1]) }}>
        <GitGraph
          renderData={afterState}
          hoveredNode={hoveredNode}
          onNodeHover={onNodeHover}
        />
      </div>

      {/* Pulse ring at end */}
      {frame >= duration - 8 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 30%, rgba(240,80,50,${interpolate(frame - (duration - 8), [0, 8], [0.15, 0])}) 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: 创建 Composition Root**

`src/remotion/Root.tsx`:
```tsx
import React from 'react';
import { Composition } from 'remotion';
import { InitScene } from './operations/InitScene';
import { AddScene } from './operations/AddScene';
import { CommitScene } from './operations/CommitScene';
import { GitRenderData } from '../types';

const emptyData: GitRenderData = {
  initialized: true,
  commits: [],
  branches: { main: null },
  head: 'main',
  currentBranch: 'main',
  files: {},
  stagedFiles: [],
  remoteCommits: [],
  remoteUrl: null,
};

export const RemotionRoot: React.FC = () => {
  const defaultProps = {
    beforeState: emptyData,
    afterState: emptyData,
    hoveredNode: null,
  };

  return (
    <>
      <Composition
        id="InitScene"
        component={InitScene}
        durationInFrames={45}
        fps={30}
        width={700}
        height={400}
        defaultProps={defaultProps}
      />
      <Composition
        id="AddScene"
        component={AddScene}
        durationInFrames={30}
        fps={30}
        width={700}
        height={400}
        defaultProps={defaultProps}
      />
      <Composition
        id="CommitScene"
        component={CommitScene}
        durationInFrames={36}
        fps={30}
        width={700}
        height={400}
        defaultProps={defaultProps}
      />
    </>
  );
};
```

- [ ] **Step 5: 创建 TeachingOverlay**

`src/components/TeachingOverlay.tsx`:
```tsx
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface TeachingOverlayProps {
  visible: boolean;
  operation: string | null;
  progress: number; // 0 to 1
}

const TEACHING_TEXTS: Record<string, { title: string; desc: string }> = {
  init: {
    title: '📁 初始化仓库',
    desc: 'git init 创建 .git 目录，开始版本控制',
  },
  add: {
    title: '📄 暂存文件',
    desc: '文件从 Working Directory 移动到 Staging Area',
  },
  commit: {
    title: '✅ 创建提交',
    desc: '新 commit 已创建，分支指针前移',
  },
};

export const TeachingOverlay: React.FC<TeachingOverlayProps> = ({
  visible,
  operation,
  progress,
}) => {
  if (!visible || !operation || !TEACHING_TEXTS[operation]) return null;

  const text = TEACHING_TEXTS[operation];
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
        background: 'rgba(13, 17, 23, 0.9)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 12,
        fontFamily: 'Space Grotesk, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {text.title}
      </div>
      <div style={{ fontSize: 12, color: '#8B949E' }}>
        {text.desc}
      </div>
    </div>
  );
};
```

- [ ] **Step 6: Commit**

```bash
git add src/remotion/Root.tsx src/remotion/operations/InitScene.tsx src/remotion/operations/AddScene.tsx src/remotion/operations/CommitScene.tsx src/components/TeachingOverlay.tsx
git commit -m "feat: add Remotion operation scenes and teaching overlay"
```

---

### Task 6: AnimationStage + AnimationControls + App 集成

**Files:**
- Create: `src/components/AnimationStage.tsx`
- Create: `src/components/AnimationControls.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: 创建 AnimationStage（Remotion Player 容器）**

`src/components/AnimationStage.tsx`:
```tsx
import React, { useRef, useCallback, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { GitRenderData } from '../types';
import { InitScene } from '../remotion/operations/InitScene';
import { AddScene } from '../remotion/operations/AddScene';
import { CommitScene } from '../remotion/operations/CommitScene';

interface AnimationStageProps {
  operation: string | null;
  beforeState: GitRenderData;
  afterState: GitRenderData;
  playing: boolean;
  hoveredNode: string | null;
  onNodeHover?: (id: string | null) => void;
  onComplete: () => void;
  onFrameUpdate: (frame: number) => void;
}

const SCENE_MAP: Record<string, { component: React.FC<any>; duration: number }> = {
  init: { component: InitScene, duration: 45 },
  add: { component: AddScene, duration: 30 },
  commit: { component: CommitScene, duration: 36 },
};

export const AnimationStage: React.FC<AnimationStageProps> = ({
  operation,
  beforeState,
  afterState,
  playing,
  hoveredNode,
  onNodeHover,
  onComplete,
  onFrameUpdate,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const completedRef = useRef(false);
  const scene = operation ? SCENE_MAP[operation] : null;
  const Component = scene?.component;

  useEffect(() => {
    if (playing && playerRef.current) {
      completedRef.current = false;
      playerRef.current.seekTo(0);
      playerRef.current.play();
    }
  }, [playing, operation]);

  const commonProps = {
    beforeState,
    afterState,
    hoveredNode,
    onNodeHover,
  };

  if (!Component) {
    // Static view - show current state via GitGraph
    return (
      <div className="w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 800 400">
          {!afterState.initialized ? (
            <>
              <text x="400" y="180" textAnchor="middle" fill="#656D76" fontSize={20} fontFamily="Space Grotesk">
                尚未初始化 Git 仓库
              </text>
              <text x="400" y="210" textAnchor="middle" fill="#959DA5" fontSize={14} fontFamily="Space Grotesk">
                点击右侧 git init 开始
              </text>
            </>
          ) : afterState.commits.length === 0 ? (
            <>
              <text x="400" y="180" textAnchor="middle" fill="#656D76" fontSize={20} fontFamily="Space Grotesk">
                仓库已初始化，尚无提交
              </text>
              <text x="400" y="210" textAnchor="middle" fill="#959DA5" fontSize={14} fontFamily="Space Grotesk">
                创建文件并执行 git add / git commit
              </text>
            </>
          ) : (
            <text x="400" y="200" textAnchor="middle" fill="#656D76" fontSize={16} fontFamily="Space Grotesk">
              准备就绪
            </text>
          )}
        </svg>
      </div>
    );
  }

  return (
    <Player
      ref={playerRef}
      component={Component}
      durationInFrames={scene.duration}
      compositionWidth={700}
      compositionHeight={400}
      fps={30}
      inputProps={commonProps}
      showPlaybackControls={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
```

- [ ] **Step 2: 创建 AnimationControls**

`src/components/AnimationControls.tsx`:
```tsx
import React from 'react';

interface AnimationControlsProps {
  playing: boolean;
  currentFrame: number;
  totalFrames: number;
  onPlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReplay: () => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  playing,
  currentFrame,
  totalFrames,
  onPlay,
  onStepBack,
  onStepForward,
  onReplay,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-border">
      <div className="flex items-center gap-2">
        <button
          onClick={onStepBack}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#656D76] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors disabled:opacity-30"
          disabled={currentFrame <= 0}
          title="上一步"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onPlay}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-accent/60 text-accent hover:bg-[#FFF0EB] transition-colors"
          title={playing ? '暂停' : '播放'}
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1" width="3" height="10" rx="1" fill="currentColor"/>
              <rect x="7" y="1" width="3" height="10" rx="1" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M5 3L12 8L5 13V3Z" fill="currentColor"/>
            </svg>
          )}
        </button>
        <button
          onClick={onStepForward}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#656D76] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors disabled:opacity-30"
          disabled={currentFrame >= totalFrames}
          title="下一步"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onReplay}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#656D76] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors"
          title="回放"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 8C2 4.69 4.69 2 8 2C10.22 2 12.1 3.21 13.06 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 2V5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <span className="text-xs font-mono text-[#656D76] tabular-nums">
        {Math.round(currentFrame / 30 * 10) / 10}s / {Math.round(totalFrames / 30 * 10) / 10}s
      </span>
    </div>
  );
};
```

- [ ] **Step 3: 创建 App.tsx（主控制器）**

`src/App.tsx`:
```tsx
import React, { useState, useCallback, useRef } from 'react';
import { PlayerRef } from '@remotion/player';
import { GitState } from './state/GitState';
import { defineCommands, SCENARIOS } from './lib/commands';
import { Layout } from './components/Layout';
import { StepPanel } from './components/StepPanel';
import { TerminalCommands } from './components/TerminalCommands';
import { OutputLog } from './components/OutputLog';
import { AnimationStage } from './components/AnimationStage';
import { TeachingOverlay } from './components/TeachingOverlay';
import { GitRenderData, CommandDef, ScenarioStep } from './types';

type LogEntry = { text: string; type: 'command' | 'success' | 'error' | 'info' | 'welcome' };

const gitState = new GitState();
const commands = defineCommands(gitState);

const getRenderData = (): GitRenderData => gitState.getRenderData();

function getStepAvailableCommands(
  allCmds: CommandDef[],
  step: ScenarioStep,
): string[] {
  const available = new Set(step.availableCommands);
  return allCmds.filter(c => available.has(c.id) && c.check()).map(c => c.id);
}

export default function App() {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepExecutedCommands, setStepExecutedCommands] = useState<Set<string>>(new Set());
  const [renderData, setRenderData] = useState<GitRenderData>(getRenderData());
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: '欢迎使用 Git 可视化教室！', type: 'welcome' },
  ]);
  const [animatingOperation, setAnimatingOperation] = useState<string | null>(null);
  const [beforeState, setBeforeState] = useState<GitRenderData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const scenario = SCENARIOS[currentScenarioIdx];
  const step = scenario?.steps[currentStepIdx];
  const available = step
    ? commands.filter(c => step.availableCommands.includes(c.id) && c.check()).map(c => c.id)
    : [];

  const appendLog = useCallback((text: string, type: LogEntry['type']) => {
    setLogs(prev => [...prev, { text, type }]);
  }, []);

  const advanceStep = useCallback(() => {
    if (currentStepIdx < scenario.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setStepExecutedCommands(new Set());
    } else {
      appendLog('🎉 恭喜完成本场景！', 'success');
    }
  }, [currentStepIdx, scenario, appendLog]);

  const executeCommand = useCallback((commandId: string) => {
    if (isAnimating || !step) return;
    if (!step.availableCommands.includes(commandId)) {
      appendLog('当前步骤不可用此命令', 'error');
      return;
    }

    const cmd = commands.find(c => c.id === commandId);
    if (!cmd) return;

    const before = getRenderData();
    appendLog(cmd.label, 'command');
    const result = cmd.execute();

    if (!result.success) {
      appendLog(result.message, 'error');
      return;
    }

    appendLog(result.message, 'success');
    const after = getRenderData();

    const finishCommand = () => {
      const nextExecuted = new Set(stepExecutedCommands);
      nextExecuted.add(commandId);
      setStepExecutedCommands(nextExecuted);
      setCompletedSteps(prev => new Set(prev).add(step.id));

      const allDone = step.availableCommands.every(c => nextExecuted.has(c));
      if (allDone) {
        setTimeout(advanceStep, 600);
      }
    };

    if (['init', 'add', 'commit'].includes(commandId)) {
      setBeforeState(before);
      setAnimatingOperation(commandId);
      setIsAnimating(true);
      // Animation complete handler will call finishCommand
      commandIdRef.current = { commandId, finishCommand };
    } else {
      setRenderData(after);
      finishCommand();
    }
  }, [isAnimating, step, stepExecutedCommands, appendLog, advanceStep]);

  const commandIdRef = useRef<{ commandId: string; finishCommand: () => void } | null>(null);

  const handleAnimationComplete = useCallback(() => {
    const after = getRenderData();
    setRenderData(after);
    setIsAnimating(false);
    setAnimatingOperation(null);
    setBeforeState(null);

    if (commandIdRef.current) {
      commandIdRef.current.finishCommand();
      commandIdRef.current = null;
    }
  }, []);

  const totalSteps = scenario?.steps.length || 0;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps.size / totalSteps) * 100) : 0;

  return (
    <Layout
      progress={progressPct}
      progressText={`${completedSteps.size} / ${totalSteps}`}
      left={
        <StepPanel
          scenario={scenario}
          currentStep={currentStepIdx}
          completedSteps={completedSteps}
          onStepClick={(idx) => {
            setCurrentStepIdx(idx);
            setCompletedSteps(new Set());
            setRenderData(getRenderData());
          }}
        />
      }
      center={
        <div className="w-full h-full relative">
          <AnimationStage
            operation={animatingOperation}
            beforeState={beforeState || renderData}
            afterState={renderData}
            playing={isAnimating}
            hoveredNode={hoveredNode}
            onNodeHover={setHoveredNode}
            onComplete={handleAnimationComplete}
            onFrameUpdate={() => {}}
          />
          <TeachingOverlay
            visible={isAnimating}
            operation={animatingOperation}
            progress={isAnimating ? 0.5 : 0}
          />
        </div>
      }
      bottomLeft={
        <OutputLog entries={logs} />
      }
      bottomRight={
        <TerminalCommands
          commands={commands}
          availableCommands={available}
          onExecute={(id) => {
            commandIdRef.current = id;
            executeCommand(id);
          }}
        />
      }
    />
  );
}
```

- [ ] **Step 4: 验证完整编译**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 5: 启动 dev server 验证渲染**

```bash
npm run dev
```

Expected: App loads in browser, shows layout with empty animation stage and terminal commands

- [ ] **Step 6: Commit**

```bash
git add src/components/AnimationStage.tsx src/components/AnimationControls.tsx src/App.tsx
git commit -m "feat: wire up App with Remotion Player integration"
```

---

### Task 7: 场景完成动画 + 微交互打磨

**Files:**
- Modify: `src/App.tsx`
- Create: `public/` structure

- [ ] **Step 1: 实现 step-level 完成反馈**

在 `App.tsx` 中，当步骤全部完成时，在动画舞台上显示完成动画：

`src/App.tsx` 中 `advanceStep` 修改：
```tsx
const advanceStep = useCallback(() => {
  if (currentStepIdx < scenario.steps.length - 1) {
    setCurrentStepIdx(prev => prev + 1);
    // Clear logs for new step
  } else {
    appendLog('🎉 恭喜完成本场景！', 'success');
    // Show scene completion on stage
    setSceneComplete(true);
    setTimeout(() => setSceneComplete(false), 3000);
  }
}, [currentStepIdx, scenario, appendLog]);
```

- [ ] **Step 2: 添加 step 完成动画（CSS keyframes）**

在 `src/index.css` 添加：
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes completePulse {
  0% { box-shadow: 0 0 0 0 rgba(45, 164, 78, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(45, 164, 78, 0); }
  100% { box-shadow: 0 0 0 0 rgba(45, 164, 78, 0); }
}

.step-complete {
  animation: completePulse 0.6s ease-out;
}

.glow-accent {
  box-shadow: 0 0 20px rgba(240, 80, 50, 0.15);
}
```

- [ ] **Step 3: 验证完整流程**

```bash
npm run dev
```

Expected: Complete flow through Scene 1 - init → add → commit → add/commit → status → log

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Scene 1 prototype with Remotion animations"
```
