import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { GitRenderData } from '../types';
import { InitScene } from '../remotion/operations/InitScene';
import { AddScene } from '../remotion/operations/AddScene';
import { CommitScene } from '../remotion/operations/CommitScene';
import { GitGraph } from '../remotion/GitGraph';

interface AnimationStageProps {
  operation: string | null;
  beforeState: GitRenderData;
  afterState: GitRenderData;
  playing: boolean;
  hoveredNode?: string | null;
  onNodeHover?: (id: string | null) => void;
  onComplete: () => void;
  playerRef: React.RefObject<PlayerRef | null>;
}

const SCENE_MAP: Record<string, React.FC<any>> = {
  init: InitScene,
  add: AddScene,
  commit: CommitScene,
};

const SCENE_DURATIONS: Record<string, number> = {
  init: 45,
  add: 30,
  commit: 36,
};

export const AnimationStage: React.FC<AnimationStageProps> = ({
  operation,
  beforeState,
  afterState,
  playing,
  hoveredNode,
  onNodeHover,
  onComplete,
  playerRef,
}) => {
  const scene = operation ? SCENE_MAP[operation] : null;
  const duration = operation ? SCENE_DURATIONS[operation] ?? 30 : 30;
  const calledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (playing && playerRef.current) {
      calledRef.current = false;
      playerRef.current.seekTo(0);
      playerRef.current.play();
    }
  }, [playing, operation, playerRef]);

  // Listen for the Remotion Player 'ended' event via PlayerEmitter
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handler = () => {
      if (!calledRef.current) {
        calledRef.current = true;
        onCompleteRef.current();
      }
    };

    player.addEventListener('ended', handler);
    return () => {
      player.removeEventListener('ended', handler);
    };
  }, [playerRef, operation]); // Re-attach listener when Player remounts (scene change)

  if (!scene) {
    return (
      <div className="w-full h-full">
        {!afterState.initialized ? (
          <svg width="100%" height="100%" viewBox="0 0 800 400">
            <text x="400" y="180" textAnchor="middle" fill="#656D76" fontSize={20} fontFamily="Space Grotesk, sans-serif">
              尚未初始化 Git 仓库
            </text>
            <text x="400" y="210" textAnchor="middle" fill="#959DA5" fontSize={14} fontFamily="Space Grotesk, sans-serif">
              点击右侧 git init 开始
            </text>
          </svg>
        ) : afterState.commits.length === 0 ? (
          <svg width="100%" height="100%" viewBox="0 0 800 400">
            <text x="400" y="180" textAnchor="middle" fill="#656D76" fontSize={20} fontFamily="Space Grotesk, sans-serif">
              仓库已初始化，尚无提交
            </text>
            <text x="400" y="210" textAnchor="middle" fill="#959DA5" fontSize={14} fontFamily="Space Grotesk, sans-serif">
              创建文件并执行 git add / git commit
            </text>
          </svg>
        ) : (
          <GitGraph renderData={afterState} hoveredNode={hoveredNode} />
        )}
      </div>
    );
  }

  return (
    <Player
      ref={playerRef as React.RefObject<PlayerRef>}
      component={scene}
      durationInFrames={duration}
      compositionWidth={700}
      compositionHeight={400}
      fps={30}
      inputProps={{
        beforeState,
        afterState,
        hoveredNode,
        onNodeHover,
      }}
      controls={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
