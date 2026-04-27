// === 全局实例 ===
const gitState = new GitState();
const gitEngine = new GitEngine('gitCanvas');
const animator = new AnimationEngine(gitEngine);
const cmdManager = new CommandManager(gitState, gitEngine, animator);

let currentScenarioIdx = 0;
let currentStepIdx = 0;
let isExecuting = false;
let executedCommands = new Set();

// === DOM 引用 ===
const $ = id => document.getElementById(id);
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
  div.textContent = type === 'command' ? `$ ${text}` : `> ${text}`;
  outputContent.appendChild(div);
  outputContent.scrollTop = outputContent.scrollHeight;
}

// === 场景 ===
function loadScenario(index) {
  const scenario = SCENARIOS[index];
  if (!scenario) return;
  currentScenarioIdx = index;
  currentStepIdx = 0;
  executedCommands.clear();
  scenarioTitle.textContent = `${scenario.title} — ${scenario.subtitle}`;
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
    textSpan.textContent = step.instruction.length > 26 ? step.instruction.substring(0, 26) + '...' : step.instruction;

    div.appendChild(numSpan);
    div.appendChild(textSpan);

    if (idx < currentStepIdx) {
      div.addEventListener('click', () => {
        currentStepIdx = idx;
        executedCommands.clear();
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
  commandListEl.innerHTML = '';

  // 处理 autoModify 步骤
  if (step.autoModify) {
    const committed = Object.entries(gitState.files).filter(([_, s]) => s === 'committed');
    if (committed.length > 0) {
      gitState.files[committed[0][0]] = 'modified';
      appendOutput(`🔄 模拟修改: ${committed[0][0]}`, 'info');
      renderFileZones();
    }
  }

  // 自动跳过无可执行命令的步骤（如 autoModify）
  if (step.availableCommands.length === 0) {
    setTimeout(advanceStep, 800);
    return;
  }

  // 创建步骤需要的文件
  if (step.createFiles && Array.isArray(step.createFiles)) {
    step.createFiles.forEach(f => {
      if (!gitState.files[f]) gitState.createFile(f);
    });
    renderFileZones();
  }

  const available = new Set(step.availableCommands);
  cmdManager.getAllCommands().forEach(cmd => {
    const btn = document.createElement('button');
    btn.className = 'command-btn';
    if (available.has(cmd.id)) {
      btn.classList.add('available');
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
  const pct = Math.round((currentStepIdx / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${currentStepIdx} / ${total}`;
}

// === 文件区域 ===
function renderFileZones() {
  const ws = [], st = [], rp = [];
  if (!gitState || !gitState.files) return;
  Object.entries(gitState.files).forEach(([name, status]) => {
    if (status === 'untracked' || status === 'modified') {
      ws.push(`<span class="file-tag ${status}">${name}</span>`);
    } else if (status === 'staged') {
      st.push(`<span class="file-tag staged">${name}</span>`);
    } else if (status === 'committed') {
      rp.push(`<span class="file-tag committed">${name}</span>`);
    }
  });
  workspaceFiles.innerHTML = ws.join('') || '<span style="color:#555;font-size:11px;">空</span>';
  stagingFiles.innerHTML = st.join('') || '<span style="color:#555;font-size:11px;">空</span>';
  repoFiles.innerHTML = rp.join('') || '<span style="color:#555;font-size:11px;">空</span>';
}

// === 命令执行 ===
function executeCommand(commandId) {
  if (isExecuting) return;
  const scenario = SCENARIOS[currentScenarioIdx];
  const step = scenario.steps[currentStepIdx];
  if (!step) return;
  if (!step.availableCommands.includes(commandId)) {
    appendOutput('当前步骤不可用此命令', 'error');
    return;
  }

  isExecuting = true;
  const cmdLabel = cmdManager.commands.find(c => c.id === commandId).label;
  appendOutput(cmdLabel, 'command');

  const result = cmdManager.execute(commandId);
  if (result.success) {
    appendOutput(result.message, 'success');
    gitEngine.lastState = gitState.getRenderData();
    gitEngine.render(gitEngine.lastState);
    renderFileZones();

    const runAnim = (animFn) => {
      if (animFn) { animFn(); } else {
        gitEngine.render(gitEngine.lastState);
        isExecuting = false;
        renderCommands();
      }
    };

    if (commandId === 'commit' && result.commit) {
      const pos = gitEngine.nodePositions.find(p => p.id === result.commit.id);
      if (pos) { animator.pulseNode(pos.x, pos.y, 18, () => { isExecuting = false; renderCommands(); }); }
      else { isExecuting = false; renderCommands(); }
    } else if (commandId === 'merge' && result.isMerge && result.commit) {
      const pos = gitEngine.nodePositions.find(p => p.id === result.commit.id);
      if (pos) { animator.pulseNode(pos.x, pos.y, 18, () => { isExecuting = false; renderCommands(); }); }
      else { isExecuting = false; renderCommands(); }
    } else if (commandId === 'push' && result.pushedCommits) {
      animator.fadeInText('☁️ 推送成功!', gitEngine.canvas.width * 0.5, 80, '#4ec9b0', () => { isExecuting = false; renderCommands(); });
    } else if (commandId === 'pull' && result.pulledCommits) {
      animator.fadeInText('⬇️ 拉取完成!', gitEngine.canvas.width * 0.5, 80, '#27ae60', () => { isExecuting = false; renderCommands(); });
    } else if (commandId === 'branch') {
      animator.fadeInText('🌿 新分支已创建!', gitEngine.canvas.width * 0.3, 80, '#27ae60', () => { isExecuting = false; renderCommands(); });
    } else if (commandId === 'init') {
      const cw = gitEngine.canvas.width;
      const ch = gitEngine.canvas.height;
      gitEngine.render(gitEngine.lastState);
      animator.fadeInText('✅ 仓库已初始化!', cw * 0.4, ch * 0.5, '#4ec9b0', () => {
        isExecuting = false;
        renderCommands();
      });
    } else {
      gitEngine.render(gitEngine.lastState);
      setTimeout(() => { isExecuting = false; renderCommands(); }, 200);
    }

    const stepCmds = step.availableCommands;
    executedCommands.add(commandId);
    const allDone = stepCmds.every(c => executedCommands.has(c));

    if (allDone) {
      setTimeout(advanceStep, 600);
    } else {
      // 步内还有未执行的命令，提示用户
      setTimeout(() => {
        const remaining = stepCmds.filter(c => !executedCommands.has(c));
        const labels = remaining.map(c => cmdManager.commands.find(cmd => cmd.id === c)?.label || c);
        appendOutput(`💡 该步骤还需执行: ${labels.join(', ')}`, 'info');
      }, 500);
    }
  } else {
    appendOutput(result.message, 'error');
    isExecuting = false;
  }
}

function advanceStep() {
  const scenario = SCENARIOS[currentScenarioIdx];
  if (!scenario) return;
  if (currentStepIdx < scenario.steps.length - 1) {
    currentStepIdx++;
  } else {
    appendOutput('🎉 恭喜完成本场景！', 'success');
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      appendOutput(`💡 试试切换到: ${SCENARIOS[currentScenarioIdx + 1].title}`, 'info');
    }
  }
  renderSteps();
  renderCommands();
  updateProgress();
}

// === 事件绑定 ===
sceneSelect.addEventListener('change', e => {
  const idx = parseInt(e.target.value);
  if (idx !== currentScenarioIdx) {
    loadScenario(idx);
    appendOutput(`切换到场景: ${SCENARIOS[idx].title}`, 'info');
  }
});

document.getElementById('gitCanvas').addEventListener('click', e => {
  const rect = gitEngine.canvas.getBoundingClientRect();
  const node = gitEngine.getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
  if (node && node.commit) {
    appendOutput(`📌 ${node.id}: ${node.commit.message}`, 'info');
  }
});

// === 初始化 ===
function init() {
  loadScenario(0);
  gitEngine.render({ initialized: false });
  renderFileZones();
  appendOutput('欢迎使用 Git 可视化教室！', 'welcome');
}

document.addEventListener('DOMContentLoaded', init);
