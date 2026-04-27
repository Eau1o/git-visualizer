import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';

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
  return (
    <AbsoluteFill>
      <GitGraph renderData={afterState} hoveredNode={hoveredNode} />
    </AbsoluteFill>
  );
};
