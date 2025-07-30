import React, {createContext, useEffect, useRef, useState} from 'react';
import VM from 'scratch-vm';
import AudioEngine from 'scratch-audio';
import { ScratchStorage } from 'scratch-storage';

type Ctx = {vm: VM};
export const ScratchCtx = createContext<Ctx>(null as any);

export const ScratchProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [vm] = useState(() => new VM());

  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current) {
      if (!vm.storage) {
        const storage = new ScratchStorage();
        vm.attachStorage(storage);
      }
      vm.attachAudioEngine && vm.attachAudioEngine(new (window.AudioContext || window.webkitAudioContext)());
      vm.setCompatibilityMode(true);
      vm.setTurboMode(false);
      vm.start();
      loaded.current = true;
    }
  }, [vm]);

  return <ScratchCtx.Provider value={{vm}}>{children}</ScratchCtx.Provider>;
};
