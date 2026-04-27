const SCENARIOS = [
  {
    id: 'local',
    title: '📍 本地仓库基础',
    subtitle: '学习如何初始化仓库、添加文件、提交更改',
    steps: [
      {
        id: 'local-1',
        instruction: '点击 git init 初始化一个新的 Git 仓库',
        hint: '💡 git init 会在当前目录创建一个 .git 文件夹，开始版本控制',
        availableCommands: ['init'],
        lockedCommands: ['add','commit','status','log','branch','checkout','merge','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'local-2',
        instruction: '用 git add 将文件添加到暂存区',
        hint: '💡 index.html 和 style.css 是未跟踪的红色文件，add 后变绿色',
        availableCommands: ['add'],
        lockedCommands: ['commit','status','log','branch','checkout','merge','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'local-3',
        instruction: '执行 git commit 提交到仓库',
        hint: '💡 每次提交都会在时间线上生成一个新的节点',
        availableCommands: ['commit'],
        lockedCommands: ['status','log','branch','checkout','merge','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'local-4',
        instruction: '再创建一些新文件并提交一次，观察 commit 链的变化',
        hint: '💡 每次提交节点会串联成一条历史线',
        availableCommands: ['add','commit'],
        lockedCommands: ['log','branch','checkout','merge','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'local-5',
        instruction: '用 git status 查看仓库当前状态',
        hint: '💡 status 是最常用的命令，随时查看仓库状态',
        availableCommands: ['status'],
        lockedCommands: ['log','branch','checkout','merge','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'local-6',
        instruction: '用 git log 查看提交历史',
        hint: '💡 log 显示所有 commit 记录，包括 SHA、消息',
        availableCommands: ['log'],
        lockedCommands: ['branch','checkout','merge','remote','push','pull','clone','restore','reset','revert']
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
        hint: '💡 分支是基于某个提交创建的',
        createFiles: ['app.js', 'utils.js'],
        availableCommands: ['add','commit'],
        lockedCommands: ['branch','checkout','merge','log','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'branch-2',
        instruction: '用 git branch 创建一个新分支',
        hint: '💡 分支就像平行宇宙，互不干扰',
        availableCommands: ['branch'],
        lockedCommands: ['checkout','merge','log','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'branch-3',
        instruction: '用 git checkout 切换到新分支',
        hint: '💡 HEAD 指针移到新分支上，后续提交将在新分支进行',
        availableCommands: ['checkout'],
        lockedCommands: ['add','commit','merge','log','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'branch-4',
        instruction: '在新分支上做两次提交，观察分叉',
        hint: '💡 分支分叉了！main 停在原地，新分支向前走了',
        availableCommands: ['add','commit'],
        lockedCommands: ['checkout','merge','log','remote','push','pull','clone','restore','reset','revert']
      },
      {
        id: 'branch-5',
        instruction: '切回 main 分支，然后合并新分支',
        hint: '💡 先 checkout main，再 merge feature，两条历史线汇合',
        availableCommands: ['checkout','merge'],
        lockedCommands: ['add','commit','log','remote','push','pull','clone','restore','reset','revert']
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
        hint: '💡 需要有一些提交才能推送到远程',
        createFiles: ['api.js', 'config.js'],
        availableCommands: ['add','commit'],
        lockedCommands: ['remote','push','pull','clone','log','restore','reset','revert']
      },
      {
        id: 'remote-2',
        instruction: '用 git remote add 添加远程仓库',
        hint: '💡 远程仓库通常叫 origin，是云端备份',
        availableCommands: ['remote'],
        lockedCommands: ['push','pull','clone','log','restore','reset','revert']
      },
      {
        id: 'remote-3',
        instruction: '用 git push 推送到远程仓库',
        hint: '💡 push 后，远程仓库会有和你本地一样的历史',
        availableCommands: ['push'],
        lockedCommands: ['pull','clone','log','restore','reset','revert']
      },
      {
        id: 'remote-4',
        instruction: '模拟队友推送了新代码，用 git pull 拉取',
        hint: '💡 每天上班第一件事就是 git pull',
        availableCommands: ['pull'],
        lockedCommands: ['clone','log','restore','reset','revert']
      },
      {
        id: 'remote-5',
        instruction: '用 git clone 克隆仓库',
        hint: '💡 clone 会把远程仓库完整复制到本地',
        availableCommands: ['clone'],
        lockedCommands: ['log','restore','reset','revert']
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
        hint: '💡 然后我们来模拟一些"错误"操作',
        availableCommands: ['add','commit'],
        lockedCommands: ['restore','reset','revert','log']
      },
      {
        id: 'undo-2',
        instruction: '模拟修改了已提交的文件',
        hint: '💡 文件从绿色变为红色 modified 状态',
        availableCommands: [],
        lockedCommands: ['add','commit','restore','reset','revert','log'],
        autoModify: true
      },
      {
        id: 'undo-3',
        instruction: '用 git restore 撤销修改，文件恢复原样',
        hint: '💡 restore 让文件回到上一次提交的状态',
        availableCommands: ['restore'],
        lockedCommands: ['add','commit','reset','revert','log']
      },
      {
        id: 'undo-4',
        instruction: '修改文件并 git add（模拟错误暂存）',
        hint: '💡 不小心把文件加到了暂存区',
        availableCommands: ['add'],
        lockedCommands: ['commit','reset','revert','restore','log']
      },
      {
        id: 'undo-5',
        instruction: '用 git reset 取消暂存',
        hint: '💡 reset 可以把文件从暂存区移回工作区',
        availableCommands: ['reset'],
        lockedCommands: ['commit','revert','restore','log']
      },
      {
        id: 'undo-6',
        instruction: '提交当前内容（模拟错误提交）',
        hint: '💡 然后用 revert 安全撤销',
        availableCommands: ['add','commit'],
        lockedCommands: ['revert','restore','log']
      },
      {
        id: 'undo-7',
        instruction: '用 git revert 创建一个撤销提交',
        hint: '💡 revert 生成一个新的"撤销提交"，不会删除历史，安全可靠',
        availableCommands: ['revert'],
        lockedCommands: ['restore','log']
      }
    ]
  }
];
