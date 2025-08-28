import { useCallback } from 'react';
import { ExitApp } from './ExitApp';
import { ExitOptions, ExitStrategy, ExitResult } from './types';

/**
 * React hook for gracefully exiting the app
 */
export function useExitApp() {
  const exit = useCallback(
    async (options?: ExitOptions): Promise<ExitResult> => {
      return ExitApp.exit(options);
    },
    []
  );

  const exitWithStrategy = useCallback(
    async (
      strategy: ExitStrategy,
      options?: ExitOptions
    ): Promise<ExitResult> => {
      return ExitApp.exitWithStrategy(strategy, options);
    },
    []
  );

  const isBackHandlerSupported = useCallback((): boolean => {
    return ExitApp.isBackHandlerSupported();
  }, []);

  const isReloadSupported = useCallback((): boolean => {
    return ExitApp.isReloadSupported();
  }, []);

  const getSupportedStrategies = useCallback((): ExitStrategy[] => {
    return ExitApp.getSupportedStrategies();
  }, []);

  return {
    exit,
    exitWithStrategy,
    isBackHandlerSupported,
    isReloadSupported,
    getSupportedStrategies,
  };
}
