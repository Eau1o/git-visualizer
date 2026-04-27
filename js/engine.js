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
    this.nodePositions = [];
    this.lastState = null;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w > 0) this.canvas.width = w;
    if (h > 0) this.canvas.height = h;
  }

  _getBranchColor(branchName) {
    if (!this.branchColors[branchName]) {
      this.branchColors[branchName] = this.availableColors[this.colorIndex % this.availableColors.length];
      this.colorIndex++;
    }
    return this.branchColors[branchName];
  }

  render(state) {
    this.lastState = state;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

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

    const branchList = Object.keys(state.branches);
    const layout = this._calculateLayout(state.commits, state.branches, branchList);

    this._drawConnections(ctx, layout);
    this._drawNodes(ctx, layout, state);
    this._drawBranchLabels(ctx, layout, state);
    this._drawHEAD(ctx, layout, state);

    if (state.remoteUrl) {
      this._drawRemote(ctx, w, state);
    }

    this.nodePositions = layout.positions;
  }

  _calculateLayout(commits, branches, branchList) {
    const positions = [];
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

    const ySpacing = this.nodeSpacingY;

    branchList.forEach((branch, bi) => {
      const chain = chainMap[branch] || [];
      chain.forEach((commitId, ci) => {
        const x = this.startX + ci * this.nodeSpacingX + bi * 8;
        const y = this.startY + bi * ySpacing;
        const existing = positions.find(p => p.id === commitId);
        if (!existing) {
          const commit = commits.find(c => c.id === commitId);
          positions.push({
            id: commitId, x, y, lane: bi, branch,
            commit,
            isMerge: commit?.isMerge || false,
            isRevert: commit?.isRevert || false,
            isMergePoint: false
          });
        }
      });
    });

    return { positions };
  }

  _drawConnections(ctx, layout) {
    layout.positions.forEach(pos => {
      const commit = pos.commit;
      if (!commit || !commit.parent) return;

      const parent = layout.positions.find(p => p.id === commit.parent);
      if (parent) {
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = this._getBranchColor(pos.branch);
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      if (commit.isMerge && commit.parents && commit.parents.length > 1) {
        const secondParent = layout.positions.find(p => p.id === commit.parents[1]);
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
    const currentCommit = state.branches[state.head];

    layout.positions.forEach(pos => {
      const isCurrent = pos.id === currentCommit;
      const radius = isCurrent ? this.nodeRadius : this.nodeRadius - 2;

      ctx.shadowColor = pos.isMerge ? 'rgba(240,80,50,0.4)' : 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = pos.isMerge ? 12 : 6;

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
      ctx.shadowBlur = 0;

      ctx.strokeStyle = isCurrent ? '#fff' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isCurrent ? 2.5 : 1;
      ctx.stroke();

      if (isCurrent) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(240,80,50,0.5)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(240,80,50,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

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
    Object.entries(state.branches).forEach(([branchName, commitId]) => {
      if (!commitId) return;
      const pos = layout.positions.find(p => p.id === commitId);
      if (!pos) return;

      const color = this._getBranchColor(branchName);
      const isHEAD = state.head === branchName;
      const label = isHEAD ? `${branchName} (HEAD)` : branchName;

      ctx.font = '12px sans-serif';
      const textWidth = ctx.measureText(label).width;
      const padX = 8, padY = 4;
      const labelW = textWidth + padX * 2;
      const labelH = 22;

      const lx = pos.x + this.nodeRadius - 4;
      const ly = pos.y - this.nodeRadius - labelH - 4;

      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      this._roundRect(ctx, lx, ly, labelW, labelH, 4);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

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

    ctx.fillStyle = 'rgba(240,80,50,0.6)';
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

    ctx.fillStyle = '#444';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️', rx, ry);

    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.fillText('远程仓库', rx, ry + 24);

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
