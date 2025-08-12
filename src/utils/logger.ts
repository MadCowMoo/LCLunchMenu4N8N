// Log levels in order of increasing severity
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// Simple logger interface
export interface Logger {
  debug: (message: string, meta?: Record<string, any>) => void;
  info: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, meta?: Record<string, any>) => void;
  setLevel?: (level: LogLevel) => void;
}

// Console logger implementation with level filtering
export class ConsoleLogger implements Logger {
  private level: LogLevel = 'info';
  private readonly levelWeights: Record<LogLevel, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };

  constructor(level?: LogLevel) {
    // Get log level from environment variable if not explicitly provided
    const envLevel = process.env.LC_LUNCH_MENU_LOG_LEVEL?.toLowerCase() as LogLevel;
    const defaultLevel: LogLevel = 'info';
    
    // Use provided level, then environment variable, then default
    this.setLevel(level || (this.isValidLogLevel(envLevel) ? envLevel : defaultLevel));
  }

  private isValidLogLevel(level: any): level is LogLevel {
    return level && Object.keys(this.levelWeights).includes(level);
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelWeights[level] <= this.levelWeights[this.level];
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
  
  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, meta || '');
    }
  }
  
  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, meta || '');
    }
  }
  
  error(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, meta || '');
    }
  }
}

/**
 * Creates a logger instance with the specified level or from environment
 * @param level Optional log level to use (overrides environment variable)
 * @param logger Optional existing logger to wrap (for n8n compatibility)
 * @returns A configured Logger instance
 */
export function createLogger(level?: LogLevel, logger?: any): Logger {
  // If a full logger is provided, use it directly
  if (logger && 
      typeof logger.debug === 'function' &&
      typeof logger.info === 'function' &&
      typeof logger.warn === 'function' &&
      typeof logger.error === 'function') {
    return logger as Logger;
  }
  
  // If it's an n8n logger or similar with just a log method
  if (logger && logger.log) {
    return {
      debug: (message, meta) => logger.log(message, meta),
      info: (message, meta) => logger.log(message, meta),
      warn: (message, meta) => logger.log(`WARN: ${message}`, meta),
      error: (message, meta) => logger.log(`ERROR: ${message}`, meta)
    };
  }
  
  // Fallback to console logger with specified or default level
  return new ConsoleLogger(level);
}
