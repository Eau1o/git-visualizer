import React from 'react';
import { spring } from 'remotion';
import { useFrame } from './useFrame';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  isMerge?: boolean;
  delay?: number;
  frame?: number;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  color,
  isMerge = false,
  delay = 0,
  frame: _frame,
}) => {
  const ctxFrame = useFrame();
  const frame = _frame ?? ctxFrame;
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 20, stiffness: 60 },
  });

  const endX = fromX + (toX - fromX) * progress;
  const endY = fromY + (toY - fromY) * progress;

  return (
    <line
      x1={fromX}
      y1={fromY}
      x2={endX}
      y2={endY}
      stroke={color}
      strokeWidth={isMerge ? 2 : 2.5}
      strokeDasharray={isMerge ? '5 3' : 'none'}
      opacity={progress}
    />
  );
};
