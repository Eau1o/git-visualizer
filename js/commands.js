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
          return Object.values(this.state.files).some(s => s === 'untracked' || s === 'modified');
        },
        execute: () => this.state.add()
      },
      {
        id: 'commit',
        label: 'git commit',
        description: '提交暂存区的更改',
        group: 'base',
        check: () => this.state.initialized && this.state.stagedFiles.size > 0,
        execute: (message) => this.state.commit(message || '更新文件')
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
          if (!this.state.initialized || this.state.commits.length === 0) return false;
          const name = this.state.currentBranch === 'main' ? 'feature-login' : 'feature-ui';
          return !this.state.branches[name];
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
          return Object.keys(this.state.branches).filter(b => b !== this.state.head).length > 0;
        },
        execute: () => {
          const others = Object.keys(this.state.branches).filter(b => b !== this.state.head);
          if (!others.length) return { success: false, message: '没有其他分支可切换' };
          return this.state.checkout(others[0]);
        }
      },
      {
        id: 'merge',
        label: 'git merge',
        description: '合并指定分支到当前分支',
        group: 'branch',
        check: () => {
          if (!this.state.initialized || this.state.commits.length === 0) return false;
          return Object.keys(this.state.branches).filter(b => b !== this.state.head).length > 0;
        },
        execute: () => {
          const others = Object.keys(this.state.branches).filter(b => b !== this.state.head);
          if (!others.length) return { success: false, message: '没有其他分支可合并' };
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
        check: () => this.state.initialized && !!this.state.remoteUrl && !!this.state.branches[this.state.head],
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
        check: () => this.state.initialized && !!this.state.remoteUrl,
        execute: () => this.state.clone()
      },
      {
        id: 'restore',
        label: 'git restore',
        description: '撤销工作区的修改',
        group: 'undo',
        check: () => this.state.initialized && Object.values(this.state.files).some(s => s === 'modified'),
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

  getAllCommands() { return this.commands; }
  getAvailableCommands() { return this.commands.filter(c => c.check()); }

  execute(commandId, ...args) {
    const cmd = this.commands.find(c => c.id === commandId);
    if (!cmd) return { success: false, message: `未知命令: ${commandId}` };
    if (!cmd.check()) return { success: false, message: '当前状态下无法执行此命令' };
    return cmd.execute(...args);
  }
}
