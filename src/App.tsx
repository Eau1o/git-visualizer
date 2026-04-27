import React, { useState, useRef, useEffect } from 'react';
import { PlayerRef } from '@remotion/player';
import { GitState } from './state/GitState';
import { defineCommands, SCENARIOS } from './lib/commands';
import { Layout } from './components/Layout';
import { StepPanel } from './components/StepPanel';
import { TerminalCommands } from './components/TerminalCommands';
import { OutputLog } from './components/OutputLog';
import { AnimationStage } from './components/AnimationStage';
import { TeachingOverlay } from './components/TeachingOverlay';
import { GitRenderData } from './types';

type LogEntry = { text: string; type: 'command' | 'success' | 'error' | 'info' | 'welcome' };

const gitState = new GitState();
const commands = defineCommands(gitState);

function getRenderData(): GitRenderData {
  return gitState.getRenderData();
}

const ANIM_DURATION: Record<string, number> = {
  init: 1700,
  add: 1200,
  commit: 1400,
};

export default function App() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepExecutedCommands, setStepExecutedCommands] = useState<Set<string>>(new Set());
  const [renderData, setRenderData] = useState<GitRenderData>(getRenderData());
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: '欢迎使用 Git 可视化教室！', type: 'welcome' },
  ]);
  const [animOperation, setAnimOperation] = useState<string | null>(null);
  const [beforeState, setBeforeState] = useState<GitRenderData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [teachingProgress, setTeachingProgress] = useState(0);

  const playerRef = useRef<PlayerRef>(null);
  const animTimer = useRef<ReturnType<typeof setTimeout>>();

  const scenario = SCENARIOS[0];
  const step = scenario?.steps[currentStepIdx];

  // Process createFiles when entering a step
  useEffect(() => {
    if (step?.createFiles) {
      let changed = false;
      step.createFiles.forEach((f) => {
        if (!gitState.files[f]) {
          gitState.createFile(f);
          changed = true;
        }
      });
      if (changed) setRenderData(getRenderData());
    }
  }, [currentStepIdx]);

  const available = step
    ? commands.filter((c) => step.availableCommands.includes(c.id) && c.check()).map((c) => c.id)
    : [];

  const execCmd = (commandId: string) => {
    if (isAnimating || !step) return;
    if (!step.availableCommands.includes(commandId)) {
      appendLog('当前步骤不可用此命令', 'error');
      return;
    }

    const cmd = commands.find((c) => c.id === commandId);
    if (!cmd) return;

    appendLog(cmd.label, 'command');
    const before = getRenderData();
    const result = cmd.execute();
    if (!result.success) { appendLog(result.message, 'error'); return; }
    appendLog(result.message, 'success');

    // For non-animated commands, finish and advance inline
    if (!['init', 'add', 'commit'].includes(commandId)) {
      setRenderData(getRenderData());
      finishStepInline(commandId);
      return;
    }

    // Animated commands: set animation state, start timeout
    setBeforeState(before);
    setAnimOperation(commandId);
    setIsAnimating(true);
    setTeachingProgress(0.5);

    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => {
      setRenderData(getRenderData());
      setIsAnimating(false);
      setAnimOperation(null);
      setBeforeState(null);
      setTeachingProgress(0);

      // After animation done, complete the step and advance
      finishStepInline(commandId);
    }, ANIM_DURATION[commandId] || 1500);
  };

  // Complete a command execution and advance step if all commands done
  const finishStepInline = (cmdId: string) => {
    const nextExecuted = new Set(stepExecutedCommands);
    nextExecuted.add(cmdId);

    const done = step ? step.availableCommands.every((c) => nextExecuted.has(c)) : false;

    if (done) {
      const nextIdx = currentStepIdx + 1;
      if (nextIdx < scenario.steps.length) {
        setCurrentStepIdx(nextIdx);
        setStepExecutedCommands(new Set());
      } else {
        appendLog('🎉 恭喜完成本场景！', 'success');
      }
    } else {
      setStepExecutedCommands(nextExecuted);
    }

    if (step) setCompletedSteps((prev) => new Set(prev).add(step.id));
  };

  // Wrap to ensure it has access to latest state
  const execCmdRef = useRef(execCmd);
  execCmdRef.current = execCmd;

  const appendLog = (text: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { text, type }]);
  };

  // Refs for latest state values so finishStepInline works from timeout
  const stepRef = useRef(step);
  stepRef.current = step;
  const stepExecutedRef = useRef(stepExecutedCommands);
  stepExecutedRef.current = stepExecutedCommands;
  const currentStepIdxRef = useRef(currentStepIdx);
  currentStepIdxRef.current = currentStepIdx;

  return (
    <Layout
      progress={completedSteps.size > 0 ? Math.round((completedSteps.size / scenario.steps.length) * 100) : 0}
      progressText={`${completedSteps.size} / ${scenario.steps.length}`}
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
            operation={animOperation}
            beforeState={beforeState || renderData}
            afterState={renderData}
            playing={isAnimating}
            onComplete={() => {}}
            playerRef={playerRef}
          />
          <TeachingOverlay
            visible={isAnimating}
            operation={animOperation}
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
          onExecute={(id) => execCmdRef.current(id)}
        />
      }
    />
  );
}
