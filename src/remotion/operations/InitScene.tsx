import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';

export interface InitSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode?: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const InitScene: React.FC<InitSceneProps> = ({
  afterState,
  hoveredNode,
}) => {
  const frame = useCurrentFrame();
  const duration = 45;

  const opacity = interpolate(frame, [0, duration * 0.3], [0, 1]);
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <GitGraph renderData={afterState} hoveredNode={hoveredNode} />
    </AbsoluteFill>
  );
};
