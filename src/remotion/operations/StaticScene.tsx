import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';
import { RemotionFrameProvider } from '../shared/useFrame';

interface StaticSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode?: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const StaticScene: React.FC<StaticSceneProps> = ({
  afterState,
  hoveredNode,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RemotionFrameProvider frame={frame}>
        <GitGraph renderData={afterState} hoveredNode={hoveredNode} />
      </RemotionFrameProvider>
    </AbsoluteFill>
  );
};
