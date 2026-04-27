import React from 'react';
import { GitRenderData, FileStatus } from '../types';

interface FileZonesProps {
  data: GitRenderData;
}

const STATUS_ORDER: FileStatus[] = ['untracked', 'modified', 'staged', 'committed'];

const ZONE_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  workspace: { label: '📁 工作区', bg: '#FFF0EB', text: '#E74C3C', border: '#E74C3C' },
  staging: { label: '📦 暂存区', bg: '#FEF7E0', text: '#F39C12', border: '#F39C12' },
  repo: { label: '🗄️ 仓库', bg: '#EAF6ED', text: '#2DA44E', border: '#2DA44E' },
};

export const FileZones: React.FC<FileZonesProps> = ({ data }) => {
  const wsFiles = Object.entries(data.files)
    .filter(([_, s]) => s === 'untracked' || s === 'modified')
    .map(([f]) => f);
  const stFiles = Object.entries(data.files)
    .filter(([_, s]) => s === 'staged')
    .map(([f]) => f);
  const repoFiles = Object.entries(data.files)
    .filter(([_, s]) => s === 'committed')
    .map(([f]) => f);

  const zones = [
    { key: 'workspace', files: wsFiles },
    { key: 'staging', files: stFiles },
    { key: 'repo', files: repoFiles },
  ] as const;

  return (
    <div className="flex items-stretch gap-0">
      {zones.map((zone, i) => {
        const colors = ZONE_COLORS[zone.key];
        return (
          <React.Fragment key={zone.key}>
            <div
              className="flex-1 px-4 py-3 rounded-lg"
              style={{ background: colors.bg }}
            >
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: colors.text }}
              >
                {colors.label}
              </div>
              <div className="flex gap-1.5 flex-wrap min-h-[22px]">
                {zone.files.length > 0 ? (
                  zone.files.map((f) => (
                    <span
                      key={f}
                      className="inline-block px-2 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: '#fff',
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {f}
                    </span>
                  ))
                ) : (
                  <span
                    className="text-xs"
                    style={{ color: `${colors.text}80` }}
                  >
                    空
                  </span>
                )}
              </div>
            </div>
            {i < 2 && (
              <div className="flex items-center px-2 text-lg text-[#D0D7DE] select-none">
                →
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
