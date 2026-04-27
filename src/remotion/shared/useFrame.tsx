import React, { createContext, useContext } from 'react';

const FrameContext = createContext<number>(999);

export const FrameProvider = FrameContext.Provider;

/** Read the current Remotion frame, or 999 (static/complete) outside a Player. */
export const useFrame = (): number => useContext(FrameContext);

/**
 * Wraps children with the frame from useCurrentFrame().
 * Used inside operation scenes rendered by <Player>.
 */
export const RemotionFrameProvider: React.FC<{
  frame: number;
  children: React.ReactNode;
}> = ({ frame, children }) => {
  return <FrameProvider value={frame}>{children}</FrameProvider>;
};
