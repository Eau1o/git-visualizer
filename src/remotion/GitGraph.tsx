import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { GitRenderData, NodePosition } from '../types';
import { CommitNode } from './shared/CommitNode';
import { BranchLabel } from './shared/BranchLabel';
import { ConnectionLine } from './shared/ConnectionLine';

interface GitGraphProps {
  renderData: GitRenderData;
  hoveredNode?: string | null;
  onNodeHover?: (id: string | null) => void;
}

const BRANCH_COLORS = ['#F05032', '#2DA44E', '#1F6FEB', '#9B59B6', '#E67E22', '#1ABC9C'];

function calculateLayout(data: GitRenderData): {
  positions: NodePosition[];
  branchColors: Record<string, string>;
} {
  const positions: NodePosition[] = [];
  const drawn = new Set<string>();
  const branchColors: Record<string, string> = {};
  let colorIndex = 0;

  if (!data.initialized || data.commits.length === 0) {
    return { positions: [], branchColors: {} };
  }

  const branchList = Object.keys(data.branches);

  branchList.forEach((branch) => {
    if (!branchColors[branch]) {
      branchColors[branch] = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
      colorIndex++;
    }

    const chain: string[] = [];
    let current = data.branches[branch];
    while (current) {
      if (drawn.has(current)) break;
      chain.unshift(current);
      drawn.add(current);
      const commit = data.commits.find((c) => c.id === current);
      current = commit ? commit.parent : null;
    }

    const bi = branchList.indexOf(branch);
    chain.forEach((commitId, ci) => {
      const x = 80 + ci * 90 + bi * 8;
      const y = 70 + bi * 70;
      const existing = positions.find((p) => p.id === commitId);
      if (!existing) {
        const commit = data.commits.find((c) => c.id === commitId)!;
        positions.push({
          id: commitId,
          x,
          y,
          branch,
          commit,
          isMerge: commit.isMerge || false,
          isRevert: commit.isRevert || false,
        });
      }
    });
  });

  return { positions, branchColors };
}

export const GitGraph: React.FC<GitGraphProps> = ({
  renderData,
  hoveredNode = null,
}) => {
  const { positions, branchColors } = useMemo(
    () => calculateLayout(renderData),
    [renderData],
  );

  if (!renderData.initialized) {
    return (
      <AbsoluteFill className="flex items-center justify-center">
        <p className="text-[#656D76] font-heading text-lg">
          {'尚未初始化 Git 仓库'}
        </p>
        <p className="text-[#959DA5] text-sm mt-2">
          {'点击右侧 git init 开始'}
        </p>
      </AbsoluteFill>
    );
  }

  if (renderData.commits.length === 0) {
    return (
      <AbsoluteFill className="flex items-center justify-center">
        <p className="text-[#656D76] font-heading text-lg">
          {'仓库已初始化，尚无提交'}
        </p>
        <p className="text-[#959DA5] text-sm mt-2">
          {'创建文件并执行 git add / git commit'}
        </p>
      </AbsoluteFill>
    );
  }

  const currentCommit = renderData.branches[renderData.head!];

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        {/* Connection lines */}
        {positions.map((pos) => {
          if (!pos.commit || !pos.commit.parent) return null;
          const parent = positions.find((p) => p.id === pos.commit.parent);
          if (!parent) return null;
          return (
            <ConnectionLine
              key={`line-${pos.id}`}
              fromX={parent.x}
              fromY={parent.y}
              toX={pos.x}
              toY={pos.y}
              color={branchColors[pos.branch] || '#656D76'}
            />
          );
        })}

        {/* Merge lines */}
        {positions.map((pos) => {
          if (
            !pos.isMerge ||
            !pos.commit.parents ||
            pos.commit.parents.length < 2
          )
            return null;
          const secondParent = positions.find(
            (p) => p.id === pos.commit.parents[1],
          );
          if (!secondParent) return null;
          return (
            <ConnectionLine
              key={`merge-${pos.id}`}
              fromX={secondParent.x}
              fromY={secondParent.y}
              toX={pos.x}
              toY={pos.y}
              color={branchColors[pos.branch] || '#656D76'}
              isMerge
            />
          );
        })}

        {/* Branch labels */}
        {Object.entries(renderData.branches).map(([branchName, commitId]) => {
          if (!commitId) return null;
          const pos = positions.find((p) => p.id === commitId);
          if (!pos) return null;
          return (
            <BranchLabel
              key={`branch-${branchName}`}
              branchName={branchName}
              node={pos}
              isHEAD={renderData.head === branchName}
              color={branchColors[branchName] || '#656D76'}
            />
          );
        })}

        {/* Commit nodes */}
        {positions.map((pos) => (
          <CommitNode
            key={`node-${pos.id}`}
            node={pos}
            isCurrent={pos.id === currentCommit}
            isHovered={hoveredNode === pos.id}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
