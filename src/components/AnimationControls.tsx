import React from 'react';

interface AnimationControlsProps {
  playing: boolean;
  currentFrame: number;
  totalFrames: number;
  onPlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReplay: () => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  playing,
  currentFrame,
  totalFrames,
  onPlay,
  onStepBack,
  onStepForward,
  onReplay,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-border">
      <div className="flex items-center gap-2">
        <button
          onClick={onStepBack}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#656D76] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors disabled:opacity-30"
          disabled={currentFrame <= 0}
          title="上一步"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onPlay}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-accent/60 text-accent hover:bg-[#FFF0EB] transition-colors"
          title={playing ? '暂停' : '播放'}
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1" width="3" height="10" rx="1" fill="currentColor"/>
              <rect x="7" y="1" width="3" height="10" rx="1" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M5 3L12 8L5 13V3Z" fill="currentColor"/>
            </svg>
          )}
        </button>
        <button
          onClick={onStepForward}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#656D76] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors disabled:opacity-30"
          disabled={currentFrame >= totalFrames}
          title="下一步"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onReplay}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#656D76] hover:text-[#1F2328] hover:bg-[#F6F8FA] transition-colors"
          title="回放"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 8C2 4.69 4.69 2 8 2C10.22 2 12.1 3.21 13.06 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 2V5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <span className="text-xs font-mono text-[#656D76] tabular-nums">
        {currentFrame}/{totalFrames}
      </span>
    </div>
  );
};
