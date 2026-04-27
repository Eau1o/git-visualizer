import React, { useEffect, useRef } from 'react';

interface LogEntry {
  text: string;
  type: 'command' | 'success' | 'error' | 'info' | 'welcome';
}

interface OutputLogProps {
  entries: LogEntry[];
}

const COLORS: Record<string, string> = {
  command: 'text-[#4EC9B0]',
  success: 'text-[#2DA44E]',
  error: 'text-[#E74C3C]',
  info: 'text-[#656D76]',
  welcome: 'text-[#656D76] italic',
};

export const OutputLog: React.FC<OutputLogProps> = ({ entries }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="p-4">
      <div className="font-semibold text-xs text-[#656D76] mb-2 uppercase tracking-wider">
        输出
      </div>
      <div className="font-mono text-sm space-y-1">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`${COLORS[entry.type] || 'text-[#656D76]'} leading-relaxed animate-[fadeIn_0.2s_ease]`}
          >
            {entry.type === 'command' ? `$ ${entry.text}` : `> ${entry.text}`}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
