import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';
import { RemotionFrameProvider } from '../shared/useFrame';

export interface CommitSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode?: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const CommitScene: React.FC<CommitSceneProps> = ({
  beforeState,
  afterState,
  hoveredNode,
}) => {
  const frame = useCurrentFrame();
  const duration = 36;

  return (
    <AbsoluteFill>
      <RemotionFrameProvider frame={frame}>
        <div
          style={{ opacity: interpolate(frame, [0, duration * 0.2], [1, 0]) }}
        >
          <GitGraph renderData={beforeState} hoveredNode={hoveredNode} />
        </div>
        <div
          style={{
            opacity: interpolate(frame, [duration * 0.2, duration], [0, 1]),
          }}
        >
          <GitGraph renderData={afterState} hoveredNode={hoveredNode} />
        </div>
      </RemotionFrameProvider>

      {/* Pulse ring at end */}
      {frame >= duration - 8 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 30%, rgba(240,80,50,${interpolate(Math.min(frame - (duration - 8), 8), [0, 8], [0.15, 0])}) 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
