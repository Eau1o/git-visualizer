class GitState {
  constructor() {
    this.reset();
  }

  reset() {
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

  init() {
    if (this.initialized) return { success: false, message: '仓库已初始化' };
    this.initialized = true;
    if (!this.branches) this.branches = {};
    if (!this.files) this.files = {};
    this.branches['main'] = null;
    this.head = 'main';
    this.currentBranch = 'main';
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
    return { success: true, message: `已将 ${names.length} 个文件添加到暂存区` };
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
    this.stagedFiles.forEach(f => { this.files[f] = 'committed'; });
    this.stagedFiles.clear();
    return { success: true, message: `[${this.currentBranch}] ${id} ${message || '新提交'}`, commit };
  }

  branch(name) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (this.branches[name]) return { success: false, message: `分支 ${name} 已存在` };
    this.branches[name] = this.branches[this.head];
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
    const isAncestor = this._isAncestor(theirCommit, ourCommit);
    if (!isAncestor) {
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
      this.branches[this.currentBranch] = theirCommit;
      return { success: true, message: `已将 ${branchName} 合并到 ${this.currentBranch}（快进合并）`, isFastForward: true };
    }
  }

  status() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    const untracked = Object.entries(this.files).filter(([_, s]) => s === 'untracked').map(([f]) => f);
    const staged = Object.entries(this.files).filter(([_, s]) => s === 'staged').map(([f]) => f);
    const modified = Object.entries(this.files).filter(([_, s]) => s === 'modified').map(([f]) => f);
    return { success: true, message: '查看仓库状态', untracked, staged, modified };
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

  remote(url) {
    this.remoteUrl = url || 'origin';
    return { success: true, message: `添加远程仓库 ${this.remoteUrl}` };
  }

  push() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.remoteUrl) return { success: false, message: '没有配置远程仓库，请先 git remote add' };
    const currentCommit = this.branches[this.currentBranch];
    if (!currentCommit) return { success: false, message: '没有可推送的提交' };
    const newCommits = this._getNewCommits(currentCommit);
    newCommits.forEach(c => this.remoteCommits.push({...c}));
    return { success: true, message: `已推送 ${newCommits.length} 个提交到远程`, pushedCommits: newCommits };
  }

  pull() {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (!this.remoteUrl) return { success: false, message: '没有配置远程仓库' };
    if (this.remoteCommits.length === 0) return { success: false, message: '远程仓库没有新的提交' };
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

  restore(filename) {
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

  reset(target) {
    if (!this.initialized) return { success: false, message: '请先初始化仓库' };
    if (target === 'staged') {
      const staged = [...this.stagedFiles];
      if (staged.length === 0) return { success: false, message: '暂存区为空' };
      staged.forEach(f => { this.files[f] = 'modified'; });
      this.stagedFiles.clear();
      return { success: true, message: `已取消 ${staged.length} 个文件的暂存`, unstagedFiles: staged };
    }
    if (target === 'commit' && this.commits.length > 0) {
      const currentCommit = this.branches[this.currentBranch];
      if (!currentCommit) return { success: false, message: '没有可回退的提交' };
      const commit = this.commits.find(c => c.id === currentCommit);
      if (commit && commit.parent) {
        this.branches[this.currentBranch] = commit.parent;
        this.commits = this.commits.filter(c => c.id !== currentCommit);
        return { success: true, message: `已回退到上一个提交` };
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

  _generateId() {
    return 'abcdefghijklmnopqrstuvwxyz0123456789'.split('').sort(() => Math.random() - 0.5).slice(0, 7).join('');
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
