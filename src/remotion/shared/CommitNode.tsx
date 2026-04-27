import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { NodePosition } from '../../types';

interface CommitNodeProps {
  node: NodePosition;
  isCurrent: boolean;
  isHovered: boolean;
  delay?: number;
}

export const CommitNode: React.FC<CommitNodeProps> = ({
  node,
  isCurrent,
  isHovered,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const radius = isCurrent ? 20 : 16;
  const adjustedFrame = Math.max(0, frame - delay);

  const appear = spring({
    frame: adjustedFrame,
    fps: 30,
    config: { damping: 15, stiffness: 80 },
  });

  const pulseOpacity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.3, 0.6],
  );

  const gradientId = `grad-${node.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) scale(${appear * (isHovered ? 1.15 : 1)})`}
      style={{ cursor: 'pointer' }}
    >
      {isCurrent && (
        <circle
          r={radius + 4}
          fill="none"
          stroke="#F05032"
          strokeWidth={2}
          opacity={pulseOpacity}
        />
      )}

      {isHovered && (
        <circle
          r={radius + 6}
          fill="none"
          stroke="#F05032"
          strokeWidth={2}
          opacity={0.3}
        />
      )}

      <defs>
        <radialGradient id={gradientId} cx="30%" cy="30%">
          <stop offset="0%" stopColor={node.isMerge ? '#FF8A65' : '#FF6B4A'} />
          <stop offset="100%" stopColor={node.isMerge ? '#F05032' : '#D93A1A'} />
        </radialGradient>
      </defs>

      <circle r={radius} fill={`url(#${gradientId})`} />
      <circle r={radius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

      {node.isMerge && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={11}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          M
        </text>
      )}

      <text
        y={radius + 14}
        textAnchor="middle"
        fill="#656D76"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
      >
        {node.id.substring(0, 6)}
      </text>

      <text
        y={radius + 28}
        textAnchor="middle"
        fill="#656D76"
        fontSize={11}
        fontFamily="Space Grotesk, sans-serif"
      >
        {node.commit.message.length > 20
          ? node.commit.message.substring(0, 20) + '...'
          : node.commit.message}
      </text>
    </g>
  );
};
