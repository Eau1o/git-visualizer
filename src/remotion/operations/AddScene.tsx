import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { GitRenderData } from '../../types';
import { GitGraph } from '../GitGraph';

export interface AddSceneProps {
  beforeState: GitRenderData;
  afterState: GitRenderData;
  hoveredNode?: string | null;
  onNodeHover?: (id: string | null) => void;
}

export const AddScene: React.FC<AddSceneProps> = ({
  beforeState,
  afterState,
  hoveredNode,
}) => {
  const frame = useCurrentFrame();
  const duration = 30;

  const movedFiles = Object.keys(beforeState.files).filter(
    (f) =>
      beforeState.files[f] === 'untracked' && afterState.files[f] === 'staged',
  );

  const easeProgress = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 80 },
  });

  const fileX = interpolate(easeProgress, [0, 1], [150, 350]);
  const fileY = interpolate(easeProgress, [0, 1], [200, 180]);
  const fileScale = interpolate(easeProgress, [0, 0.5, 1], [1, 1.2, 1]);

  return (
    <AbsoluteFill>
      {/* Fade from before to after state */}
      <div
        style={{ opacity: interpolate(frame, [0, duration * 0.3], [1, 0]) }}
      >
        <GitGraph renderData={beforeState} hoveredNode={hoveredNode} />
      </div>
      <div
        style={{
          opacity: interpolate(frame, [duration * 0.3, duration], [0, 1]),
        }}
      >
        <GitGraph renderData={afterState} hoveredNode={hoveredNode} />
      </div>

      {/* Flying file label */}
      <div
        style={{
          position: 'absolute',
          left: fileX,
          top: fileY,
          opacity: interpolate(frame, [0, duration * 0.85, duration], [1, 1, 0]),
        }}
      >
        <div
          style={{
            background: '#FF6B4A',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            boxShadow: '0 4px 12px rgba(240,80,50,0.3)',
            transform: `scale(${fileScale})`,
          }}
        >
          {movedFiles[0] || 'index.html'}
        </div>
      </div>

      {/* Completion flash */}
      {frame > duration - 5 && (
        <AbsoluteFill
          style={{
            background: 'rgba(45, 164, 78, 0.1)',
            opacity: interpolate(
              Math.min(frame - (duration - 5), 5),
              [0, 2.5, 5],
              [0, 0.3, 0],
            ),
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
