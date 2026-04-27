class AnimationEngine {
  constructor(engine) {
    this.engine = engine;
    this.queue = [];
    this.running = false;
    this.onComplete = null;
  }

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

  flyFile(fromPos, toPos, color, callback) {
    const duration = 500;
    const start = performance.now();
    const ctx = this.engine.ctx;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const x = fromPos.x + (toPos.x - fromPos.x) * ease;
      const y = fromPos.y + (toPos.y - fromPos.y) * ease;

      this.engine.render(this.engine.lastState);

      ctx.save();
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
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  pulseNode(nodeX, nodeY, radius, callback) {
    const duration = 600;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
      const alpha = Math.sin(progress * Math.PI) * 0.5;

      this.engine.render(this.engine.lastState);

      const ctx = this.engine.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, radius * scale + 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(240, 80, 50, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

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
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(240, 80, 50, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  fadeInText(text, x, y, color, callback) {
    const duration = 400;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      this.engine.render(this.engine.lastState);

      const ctx = this.engine.ctx;
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.fillStyle = color || '#27ae60';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y - 10 * (1 - progress));
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

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
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  }

  flashZone(zoneElement, color) {
    if (!zoneElement) return;
    const originalBg = zoneElement.style.background;
    zoneElement.style.transition = 'background 0.3s';
    zoneElement.style.background = color;
    setTimeout(() => { zoneElement.style.background = originalBg; }, 400);
  }
}
