import React from 'react';
import { interpolate } from 'remotion';

interface TeachingOverlayProps {
  visible: boolean;
  operation: string | null;
  progress: number;
}

const TEACHING_TEXTS: Record<string, { title: string; desc: string }> = {
  init: {
    title: '📁 初始化仓库',
    desc: 'git init 创建 .git 目录，开始版本控制',
  },
  add: {
    title: '📄 暂存文件',
    desc: '文件从 Working Directory 移动到 Staging Area',
  },
  commit: {
    title: '✅ 创建提交',
    desc: '新 commit 已创建，分支指针前移',
  },
};

export const TeachingOverlay: React.FC<TeachingOverlayProps> = ({
  visible,
  operation,
  progress,
}) => {
  if (!visible || !operation || !TEACHING_TEXTS[operation]) return null;

  const text = TEACHING_TEXTS[operation];
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
        background: 'rgba(13, 17, 23, 0.9)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 12,
        fontFamily: 'Space Grotesk, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity 0.3s',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {text.title}
      </div>
      <div style={{ fontSize: 12, color: '#8B949E' }}>{text.desc}</div>
    </div>
  );
};
