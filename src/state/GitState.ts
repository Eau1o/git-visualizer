import { Commit, CommandResult, GitRenderData, FileStatus } from '../types';

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
    const names = filenames || Object.keys(this.files).filter(
      f => this.files[f] === 'untracked' || this.files[f] === 'modified'
    );
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
    const stagedFiles = [...this.stagedFiles];
    stagedFiles.forEach(f => { this.files[f] = 'committed'; });
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

  merge(branchName: string): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.branches[branchName]) return { success: false, message: `分支 ${branchName} 不存在` };
    if (branchName === this.currentBranch) return { success: false, message: '不能合并自己' };
    const theirCommit = this.branches[branchName];
    const ourCommit = this.branches[this.currentBranch!];
    if (theirCommit === null) return { success: false, message: `${branchName} 没有可合并的提交` };
    if (ourCommit === theirCommit) return { success: false, message: `${branchName} 已经是最新的了` };
    const isAncestor = this.isAncestor(theirCommit, ourCommit);
    if (!isAncestor) {
      const id = this.generateId();
      const mergeCommit: Commit = {
        id,
        message: `合并分支 ${branchName}`,
        parent: ourCommit,
        branch: this.currentBranch!,
        timestamp: Date.now(),
        isMerge: true,
        isRevert: false,
        parents: [ourCommit!, theirCommit!],
      };
      this.commits.push(mergeCommit);
      this.branches[this.currentBranch!] = id;
      return { success: true, message: `已将 ${branchName} 合并到 ${this.currentBranch}（合并提交）`, commit: mergeCommit, isMerge: true };
    } else {
      this.branches[this.currentBranch!] = theirCommit;
      return { success: true, message: `已将 ${branchName} 合并到 ${this.currentBranch}（快进合并）`, isFastForward: true };
    }
  }

  remote(url?: string): CommandResult {
    this.remoteUrl = url || 'origin';
    return { success: true, message: `添加远程仓库 ${this.remoteUrl}` };
  }

  push(): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.remoteUrl) return { success: false, message: '没有配置远程仓库，请先 git remote add' };
    const currentCommit = this.branches[this.currentBranch!];
    if (!currentCommit) return { success: false, message: '没有可推送的提交' };
    const newCommits = this.getNewCommits(currentCommit);
    newCommits.forEach(c => this.remoteCommits.push({ ...c }));
    return { success: true, message: `已推送 ${newCommits.length} 个提交到远程`, pushedCommits: newCommits };
  }

  pull(): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.remoteUrl) return { success: false, message: '没有配置远程仓库' };
    if (this.remoteCommits.length === 0) return { success: false, message: '远程仓库没有新的提交' };
    const pulled: Commit[] = [];
    this.remoteCommits.forEach(rc => {
      if (!this.commits.find(c => c.id === rc.id)) {
        const newCommit: Commit = {
          ...rc,
          branch: this.currentBranch!,
          parent: this.branches[this.currentBranch!],
        };
        this.commits.push(newCommit);
        this.branches[this.currentBranch!] = newCommit.id;
        pulled.push(newCommit);
      }
    });
    this.remoteCommits = [];
    return { success: true, message: `已拉取 ${pulled.length} 个提交`, pulledCommits: pulled };
  }

  restore(filename?: string): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!filename) {
      const modified = Object.entries(this.files).filter(([_, s]) => s === 'modified').map(([f]) => f);
      if (modified.length === 0) return { success: false, message: '没有需要恢复的已修改文件' };
      modified.forEach(f => { this.files[f] = 'committed'; });
      return { success: true, message: `已恢复 ${modified.length} 个文件`, restoredFiles: modified };
    }
    if (this.files[filename] !== 'modified') return { success: false, message: `文件 ${filename} 未被修改` };
    this.files[filename] = 'committed';
    return { success: true, message: `已恢复文件 ${filename}` };
  }

  reset(target?: string): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (target === 'staged' || this.stagedFiles.size > 0) {
      const stagedList = [...this.stagedFiles];
      if (stagedList.length === 0) return { success: false, message: '暂存区为空' };
      stagedList.forEach(f => { this.files[f] = 'modified'; });
      this.stagedFiles.clear();
      return { success: true, message: `已取消 ${stagedList.length} 个文件的暂存`, unstagedFiles: stagedList };
    }
    if (this.commits.length > 0) {
      const currentCommit = this.branches[this.currentBranch!];
      if (!currentCommit) return { success: false, message: '没有可回退的提交' };
      const commit = this.commits.find(c => c.id === currentCommit);
      if (commit && commit.parent) {
        this.branches[this.currentBranch!] = commit.parent;
        this.commits = this.commits.filter(c => c.id !== currentCommit);
        return { success: true, message: '已回退到上一个提交' };
      } else {
        this.branches[this.currentBranch!] = null;
        this.commits = this.commits.filter(c => c.id !== currentCommit);
        return { success: true, message: '已回退到初始状态' };
      }
    }
    return { success: false, message: '没有可重置的内容' };
  }

  revert(): CommandResult {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    const currentCommit = this.branches[this.currentBranch!];
    if (!currentCommit) return { success: false, message: '没有可撤销的提交' };
    const id = this.generateId();
    const revertCommit: Commit = {
      id,
      message: `撤销提交 ${currentCommit}`,
      parent: currentCommit,
      branch: this.currentBranch!,
      timestamp: Date.now(),
      isMerge: false,
      isRevert: true,
      parents: [currentCommit],
    };
    this.commits.push(revertCommit);
    this.branches[this.currentBranch!] = id;
    return { success: true, message: `已创建撤销提交 ${id}`, commit: revertCommit };
  }

  getNewCommits(fromId: string): Commit[] {
    const result: Commit[] = [];
    const commits = this.commits;
    let current: Commit | undefined = commits.find(c => c.id === fromId);
    while (current) {
      if (this.remoteCommits.find(rc => rc.id === current!.id)) break;
      result.unshift(current);
      current = commits.find(c => c.id === current!.parent);
    }
    return result;
  }

  isAncestor(commitId: string | null, ancestorId: string | null): boolean {
    if (!commitId || !ancestorId) return false;
    if (commitId === ancestorId) return true;
    const commit = this.commits.find(c => c.id === commitId);
    if (!commit) return false;
    return this.isAncestor(commit.parent, ancestorId);
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
    return 'abcdefghijklmnopqrstuvwxyz0123456789'
      .split('')
      .sort(() => Math.random() - 0.5)
      .slice(0, 7)
      .join('');
  }
}
