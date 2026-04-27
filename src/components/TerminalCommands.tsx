import React from 'react';
import { CommandDef } from '../types';

interface TerminalCommandsProps {
  commands: CommandDef[];
  availableCommands: string[];
  onExecute: (commandId: string) => void;
}

export const TerminalCommands: React.FC<TerminalCommandsProps> = ({
  commands,
  availableCommands,
  onExecute,
}) => {
  return (
    <div className="p-4">
      <div className="bg-terminal rounded-lg p-3 font-mono text-sm">
        {commands.map(cmd => {
          const isAvailable = availableCommands.includes(cmd.id);
          return (
            <button
              key={cmd.id}
              onClick={() => isAvailable && onExecute(cmd.id)}
              disabled={!isAvailable}
              className={[
                'w-full text-left px-3 py-2 rounded-md transition-all duration-150 flex items-center gap-2',
                isAvailable
                  ? 'text-[#E6EDF3] hover:bg-[#161B22] active:scale-[0.98] cursor-pointer'
                  : 'text-[#484F58] cursor-not-allowed',
              ].join(' ')}
            >
              <span className={isAvailable ? 'text-[#3FB950]' : 'text-[#484F58]'}>$</span>
              <span>{cmd.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
