import { BackHandler } from 'react-native';
import { ExitOptions, ExitStrategy, ExitResult } from './types';

// Dynamic import for expo-updates to handle missing types
let Updates: any;
try {
  Updates = require('expo-updates');
} catch (error) {
  // expo-updates not available, will handle gracefully
  Updates = { isEnabled: false, reloadAsync: null };
}

/**
 * ExitApp class provides methods to gracefully exit an Expo application
 */
export class ExitApp {
  private static defaultOptions: Required<ExitOptions> = {
    errorMessage: 'App terminated',
    useReload: true,
    forceDelay: 100,
  };

  /**
   * Exit the app using the graceful strategy (reload -> BackHandler -> force crash)
   */
  static async exit(options: ExitOptions = {}): Promise<ExitResult> {
    const config = { ...this.defaultOptions, ...options };
    return this.exitWithStrategy(ExitStrategy.GRACEFUL, config);
  }

  /**
   * Exit the app using a specific strategy
   */
  static async exitWithStrategy(
    strategy: ExitStrategy,
    options: ExitOptions = {}
  ): Promise<ExitResult> {
    const config = { ...this.defaultOptions, ...options };

    try {
      switch (strategy) {
        case ExitStrategy.BACK_HANDLER:
          return this.exitWithBackHandler();

        case ExitStrategy.RELOAD:
          return await this.exitWithReload();

        case ExitStrategy.FORCE_CRASH:
          return this.exitWithForceCrash(config.errorMessage, config.forceDelay);

        case ExitStrategy.GRACEFUL:
        default:
          return await this.exitGracefully(config);
      }
    } catch (error) {
      return {
        success: false,
        strategy,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Exit using BackHandler.exitApp() - works on Android
   */
  private static exitWithBackHandler(): ExitResult {
    try {
      BackHandler.exitApp();
      return {
        success: true,
        strategy: ExitStrategy.BACK_HANDLER,
      };
    } catch (error) {
      return {
        success: false,
        strategy: ExitStrategy.BACK_HANDLER,
        error: error instanceof Error ? error.message : 'BackHandler failed',
      };
    }
  }

  /**
   * Exit using Updates.reloadAsync() - reloads the app
   */
  private static async exitWithReload(): Promise<ExitResult> {
    try {
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
        return {
          success: true,
          strategy: ExitStrategy.RELOAD,
        };
      } else {
        return {
          success: false,
          strategy: ExitStrategy.RELOAD,
          error: 'Updates not enabled',
        };
      }
    } catch (error) {
      return {
        success: false,
        strategy: ExitStrategy.RELOAD,
        error: error instanceof Error ? error.message : 'Reload failed',
      };
    }
  }

  /**
   * Force crash the app with an unhandled error
   */
  private static exitWithForceCrash(
    errorMessage: string,
    delay: number
  ): ExitResult {
    try {
      setTimeout(() => {
        // Try using ErrorUtils if available (React Native specific)
        if (
          typeof global !== 'undefined' &&
          (global as any).ErrorUtils &&
          typeof (global as any).ErrorUtils.reportFatalError === 'function'
        ) {
          (global as any).ErrorUtils.reportFatalError(new Error(errorMessage));
        } else {
          // Fallback: throw an unhandled error
          throw new Error(errorMessage);
        }
      }, delay);

      return {
        success: true,
        strategy: ExitStrategy.FORCE_CRASH,
      };
    } catch (error) {
      return {
        success: false,
        strategy: ExitStrategy.FORCE_CRASH,
        error: error instanceof Error ? error.message : 'Force crash failed',
      };
    }
  }

  /**
   * Try graceful exit strategies in order: reload -> BackHandler -> force crash
   */
  private static async exitGracefully(
    config: Required<ExitOptions>
  ): Promise<ExitResult> {
    // First try: Updates.reloadAsync() if enabled and requested
    if (config.useReload) {
      const reloadResult = await this.exitWithReload();
      if (reloadResult.success) {
        return reloadResult;
      }
    }

    // Second try: BackHandler.exitApp()
    const backHandlerResult = this.exitWithBackHandler();
    if (backHandlerResult.success) {
      return backHandlerResult;
    }

    // Final try: Force crash
    return this.exitWithForceCrash(config.errorMessage, config.forceDelay);
  }

  /**
   * Check if the current platform supports BackHandler.exitApp()
   */
  static isBackHandlerSupported(): boolean {
    return typeof BackHandler?.exitApp === 'function';
  }

  /**
   * Check if Updates.reloadAsync() is available and enabled
   */
  static isReloadSupported(): boolean {
    return Updates.isEnabled && typeof Updates.reloadAsync === 'function';
  }

  /**
   * Get information about available exit strategies on the current platform
   */
  static getSupportedStrategies(): ExitStrategy[] {
    const strategies: ExitStrategy[] = [ExitStrategy.FORCE_CRASH]; // Always available

    if (this.isBackHandlerSupported()) {
      strategies.push(ExitStrategy.BACK_HANDLER);
    }

    if (this.isReloadSupported()) {
      strategies.push(ExitStrategy.RELOAD);
    }

    strategies.push(ExitStrategy.GRACEFUL); // Always available
    return strategies;
  }
}
