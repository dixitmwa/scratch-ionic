import React, { createContext, useContext, useState } from 'react';

interface PlaygroundContextType {
  isBackFromPlaygroundRef: React.MutableRefObject<boolean>;
  setIsBackFromPlayground: (value: boolean) => void;
  bufferBase64Ref: React.MutableRefObject<string>;
  setBufferBase64: (value: string) => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isBackFromPlaygroundRef = React.useRef<boolean>(false);
  const setIsBackFromPlayground = (value: boolean) => {
    isBackFromPlaygroundRef.current = value;
  };
  const bufferBase64Ref = React.useRef<string>('');
  const setBufferBase64 = (value: string) => {
    bufferBase64Ref.current = value;
  };

  return (
    <PlaygroundContext.Provider value={{
      isBackFromPlaygroundRef,
      setIsBackFromPlayground,
      bufferBase64Ref,
      setBufferBase64
    }}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) throw new Error('usePlayground must be used within a PlaygroundProvider');
  return context;
}
