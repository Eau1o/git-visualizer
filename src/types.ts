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
  untracked?: string[];
  staged?: string[];
  modified?: string[];
  commits?: Commit[];
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
