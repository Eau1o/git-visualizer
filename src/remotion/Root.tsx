import React from 'react';
import { Composition } from 'remotion';
import { InitScene } from './operations/InitScene';
import { AddScene } from './operations/AddScene';
import { CommitScene } from './operations/CommitScene';
import { GitRenderData } from '../types';

const emptyData: GitRenderData = {
  initialized: true,
  commits: [],
  branches: { main: null },
  head: 'main',
  currentBranch: 'main',
  files: {},
  stagedFiles: [],
  remoteCommits: [],
  remoteUrl: null,
};

const defaultProps = {
  beforeState: emptyData,
  afterState: emptyData,
  hoveredNode: null,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InitScene"
        component={InitScene as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={45}
        fps={30}
        width={700}
        height={400}
        defaultProps={defaultProps}
      />
      <Composition
        id="AddScene"
        component={AddScene as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={30}
        fps={30}
        width={700}
        height={400}
        defaultProps={defaultProps}
      />
      <Composition
        id="CommitScene"
        component={CommitScene as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={36}
        fps={30}
        width={700}
        height={400}
        defaultProps={defaultProps}
      />
    </>
  );
};
