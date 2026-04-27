import React from 'react';

interface LayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
  progress?: number;
  progressText?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  left,
  center,
  bottomLeft,
  bottomRight,
  progress = 0,
  progressText = '0 / 0',
}) => {
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
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
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
