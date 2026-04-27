import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerRef } from '@remotion/player';
import { GitState } from './state/GitState';
import { defineCommands, SCENARIOS } from './lib/commands';
import { Layout } from './components/Layout';
import { StepPanel } from './components/StepPanel';
import { TerminalCommands } from './components/TerminalCommands';
import { OutputLog } from './components/OutputLog';
import { AnimationStage } from './components/AnimationStage';
import { TeachingOverlay } from './components/TeachingOverlay';
import { GitRenderData, CommandDef } from './types';

type LogEntry = { text: string; type: 'command' | 'success' | 'error' | 'info' | 'welcome' };

const gitState = new GitState();
const commands = defineCommands(gitState);

function getRenderData(): GitRenderData {
  return gitState.getRenderData();
}

export default function App() {
  const [currentScenarioIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepExecutedCommands, setStepExecutedCommands] = useState<Set<string>>(new Set());
  const [renderData, setRenderData] = useState<GitRenderData>(getRenderData());
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: '欢迎使用 Git 可视化教室！', type: 'welcome' },
  ]);
  const [animatingOperation, setAnimatingOperation] = useState<string | null>(null);
  const [beforeState, setBeforeState] = useState<GitRenderData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [teachingProgress, setTeachingProgress] = useState(0);

  const playerRef = useRef<PlayerRef>(null);

  const scenario = SCENARIOS[currentScenarioIdx];
  const step = scenario?.steps[currentStepIdx];

  // Process createFiles when entering a step
  useEffect(() => {
    const currentStep = scenario?.steps[currentStepIdx];
    if (currentStep?.createFiles) {
      let changed = false;
      currentStep.createFiles.forEach((f: string) => {
        if (!gitState.files[f]) {
          gitState.createFile(f);
          changed = true;
        }
      });
      if (changed) {
        setRenderData(getRenderData());
      }
    }
  }, [currentScenarioIdx, currentStepIdx, scenario]);

  const appendLog = useCallback((text: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { text, type }]);
  }, []);

  const advanceStep = () => {
    if (currentStepIdx < scenario.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      setStepExecutedCommands(new Set());
    } else {
      appendLog('🎉 恭喜完成本场景！', 'success');
    }
  };

  const finishCommand = (commandId: string) => {
    if (!step) return;

    setStepExecutedCommands((prev) => {
      const next = new Set(prev);
      next.add(commandId);

      const allDone = step.availableCommands.every((c) => next.has(c));
      if (allDone) {
        setTimeout(() => advanceStep(), 600);
      }

      return next;
    });

    setCompletedSteps((prev) => new Set(prev).add(step.id));
  };

  const finishCommandRef = useRef(finishCommand);
  finishCommandRef.current = finishCommand;

  const pendingCommandRef = useRef<string | null>(null);

  const handleAnimationComplete = useCallback(() => {
    const after = getRenderData();
    setRenderData(after);
    setIsAnimating(false);
    setAnimatingOperation(null);
    setBeforeState(null);

    if (pendingCommandRef.current) {
      finishCommandRef.current(pendingCommandRef.current);
      pendingCommandRef.current = null;
    }
  }, []);

  const executeCommand = useCallback(
    (commandId: string) => {
      if (isAnimating || !step) return;
      if (!step.availableCommands.includes(commandId)) {
        appendLog('当前步骤不可用此命令', 'error');
        return;
      }

      const cmd = commands.find((c) => c.id === commandId);
      if (!cmd) return;

      const before = getRenderData();
      appendLog(cmd.label, 'command');
      const result = cmd.execute();

      if (!result.success) {
        appendLog(result.message, 'error');
        return;
      }

      appendLog(result.message, 'success');

      if (['init', 'add', 'commit'].includes(commandId)) {
        setBeforeState(before);
        setAnimatingOperation(commandId);
        setIsAnimating(true);
        setTeachingProgress(0.5);
        pendingCommandRef.current = commandId;
      } else {
        const after = getRenderData();
        setRenderData(after);
        finishCommand(commandId);
      }
    },
    [isAnimating, step, commands, appendLog],
  );

  const available = step
    ? commands.filter((c) => step.availableCommands.includes(c.id) && c.check()).map((c) => c.id)
    : [];

  const totalSteps = scenario?.steps.length || 0;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps.size / totalSteps) * 100) : 0;

  return (
    <Layout
      progress={progressPct}
      progressText={`${completedSteps.size} / ${totalSteps}`}
      left={
        <StepPanel
          scenario={scenario}
          currentStep={currentStepIdx}
          completedSteps={completedSteps}
          onStepClick={(idx) => {
            setCurrentStepIdx(idx);
            setStepExecutedCommands(new Set());
          }}
        />
      }
      center={
        <div className="w-full h-full relative">
          <AnimationStage
            operation={animatingOperation}
            beforeState={beforeState || renderData}
            afterState={renderData}
            playing={isAnimating}
            onComplete={handleAnimationComplete}
            playerRef={playerRef}
          />
          <TeachingOverlay
            visible={isAnimating}
            operation={animatingOperation}
            progress={teachingProgress}
          />
        </div>
      }
      bottomLeft={
        <OutputLog entries={logs} />
      }
      bottomRight={
        <TerminalCommands
          commands={commands}
          availableCommands={available}
          onExecute={executeCommand}
        />
      }
    />
  );
}
