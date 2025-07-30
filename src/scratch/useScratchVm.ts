import {useContext} from 'react';
import {ScratchCtx} from './ScratchProvider';

/**
 * Convenience hook that returns the VM stored in ScratchProvider.
 * Throws an error if the provider is missing so you notice immediately.
 */
export default function useScratchVm() {
  const ctx = useContext(ScratchCtx);
  if (!ctx) {
    throw new Error('ScratchProvider is missing — wrap your app with <ScratchProvider>.');
  }
  return ctx.vm;
}
