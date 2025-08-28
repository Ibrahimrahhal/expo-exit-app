/**
 * Options for configuring the app exit behavior
 */
export interface ExitOptions {
  /** Custom error message to use when forcing app termination */
  errorMessage?: string;
  /** Whether to try Updates.reloadAsync() first (default: true) */
  useReload?: boolean;
  /** Delay in milliseconds before attempting force termination (default: 100) */
  forceDelay?: number;
}

/**
 * Exit strategies available for terminating the app
 */
export enum ExitStrategy {
  /** Use BackHandler.exitApp() - standard Android exit */
  BACK_HANDLER = 'backHandler',
  /** Use Updates.reloadAsync() to reload the app */
  RELOAD = 'reload',
  /** Force crash the app with an unhandled error */
  FORCE_CRASH = 'forceCrash',
  /** Try reload first, then fallback to BackHandler and force crash */
  GRACEFUL = 'graceful',
}

/**
 * Result of an exit attempt
 */
export interface ExitResult {
  /** Whether the exit attempt was successful */
  success: boolean;
  /** The strategy that was used */
  strategy: ExitStrategy;
  /** Error message if the exit failed */
  error?: string;
}
