import React, { useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { GitRenderData } from '../types';
import { InitScene } from '../remotion/operations/InitScene';
import { AddScene } from '../remotion/operations/AddScene';
import { CommitScene } from '../remotion/operations/CommitScene';
import { StaticScene } from '../remotion/operations/StaticScene';

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
  const scene = operation ? SCENE_MAP[operation] : StaticScene;
  const duration = operation ? SCENE_DURATIONS[operation] ?? 30 : 1;
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
  }, [playerRef, operation]);

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
