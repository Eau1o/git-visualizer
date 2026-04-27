import React from 'react';
import { spring } from 'remotion';
import { NodePosition } from '../../types';
import { useFrame } from './useFrame';

interface BranchLabelProps {
  branchName: string;
  node: NodePosition;
  isHEAD: boolean;
  color: string;
  delay?: number;
  frame?: number;
}

const BRANCH_COLORS: Record<string, string> = {
  main: '#F05032',
  'feature-login': '#2DA44E',
  'feature-ui': '#1F6FEB',
};

export const BranchLabel: React.FC<BranchLabelProps> = ({
  branchName,
  node,
  isHEAD,
  color: _color,
  delay = 0,
  frame: _frame,
}) => {
  const ctxFrame = useFrame();
  const frame = _frame ?? ctxFrame;
  const bgColor = BRANCH_COLORS[branchName] || '#656D76';

  const appear = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 15, stiffness: 100 },
  });

  const label = isHEAD ? `${branchName} (HEAD)` : branchName;
  const labelW = label.length * 8 + 24;
  const lx = node.x + 20;
  const ly = node.y - 20;

  return (
    <g
      transform={`translate(0, ${(1 - appear) * -10})`}
      opacity={appear}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={lx}
        y={ly - 12}
        width={labelW}
        height={22}
        rx={6}
        fill={bgColor}
        opacity={0.95}
      />
      <text
        x={lx + labelW / 2}
        y={ly + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
};
