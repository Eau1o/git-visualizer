import { CommandDef, Scenario, ScenarioStep } from '../types';
import { GitState } from '../state/GitState';

const SCENE_1_STEPS: ScenarioStep[] = [
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
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'local',
    title: '📍 本地仓库基础',
    subtitle: '学习如何初始化仓库、添加文件、提交更改',
    steps: SCENE_1_STEPS,
  },
];

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
