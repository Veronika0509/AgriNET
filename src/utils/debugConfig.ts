/**
 * Debug configuration for enabling/disabling console logging
 * Change the flags below to enable or disable debugging for specific features
 */

interface DebugConfig {
  comments: boolean;
  charts: boolean;
  general: boolean;
}

// Set these flags to true to enable debugging, false to disable
const DEBUG_FLAGS: DebugConfig = {
  comments: false,  // Enable console logging for comment-related operations
  charts: false,    // Enable console logging for chart operations
  general: false,   // Enable general debugging
};

/**
 * Conditionally log to console based on debug flag
 */
export const debugLog = {
  comments: (...args: any[]) => {
    if (DEBUG_FLAGS.comments) {
      console.log('[COMMENTS]', ...args);
    }
  },

  commentsError: (...args: any[]) => {
    if (DEBUG_FLAGS.comments) {
      console.error('[COMMENTS ERROR]', ...args);
    }
  },

  commentsWarn: (...args: any[]) => {
    if (DEBUG_FLAGS.comments) {
      console.warn('[COMMENTS WARNING]', ...args);
    }
  },

  charts: (...args: any[]) => {
    if (DEBUG_FLAGS.charts) {
      console.log('[CHARTS]', ...args);
    }
  },

  chartsError: (...args: any[]) => {
    if (DEBUG_FLAGS.charts) {
      console.error('[CHARTS ERROR]', ...args);
    }
  },

  general: (...args: any[]) => {
    if (DEBUG_FLAGS.general) {
      console.log('[DEBUG]', ...args);
    }
  },
};

/**
 * Enable or disable specific debug flags at runtime
 */
export const setDebugFlag = (flag: keyof DebugConfig, enabled: boolean): void => {
  DEBUG_FLAGS[flag] = enabled;
  console.log(`Debug flag '${flag}' set to: ${enabled}`);
};

/**
 * Get current debug configuration
 */
export const getDebugConfig = (): DebugConfig => {
  return { ...DEBUG_FLAGS };
};