import winston from 'winston';

export interface LoggingConfig {
  /** Loki push URL. If not provided, falls back to `process.env.LOKI_URL` */
  lokiUrl?: string;
  /** Application identifier that will be stored as the `app` label in Loki. */
  appName: string;
  /** Enables the coloured console output. Defaults to `true`. */
  enableConsole?: boolean;
}

/**
 * Replaces the global `console` implementation with a wrapper that forwards
 * every log to Winston. The Winston instance is configured with the Loki
 * transport so that all logs are shipped to Grafana Loki while still keeping
 * the original behaviour (printing to stdout/stderr). This way, the rest of
 * the codebase can continue to rely on standard `console.log` usage without
 * any modifications.
 */
export function initializeLogging(config: LoggingConfig): void {
  // Keep references to the original console methods so we can still write to
  // stdout/stderr even after we monkey-patch `console`.
  const originalConsole: Record<keyof Console, (...args: unknown[]) => void> = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    debug: console.debug.bind(console),
    trace: console.trace.bind(console),
    assert: console.assert.bind(console),
    clear: console.clear.bind(console),
    count: console.count.bind(console),
    countReset: console.countReset.bind(console),
    dir: console.dir.bind(console),
    dirxml: console.dirxml.bind(console),
    group: console.group.bind(console),
    groupCollapsed: console.groupCollapsed.bind(console),
    groupEnd: console.groupEnd.bind(console),
    table: console.table.bind(console),
    time: console.time.bind(console),
    timeEnd: console.timeEnd.bind(console),
    timeLog: console.timeLog.bind(console),
    timeStamp: console.timeStamp.bind(console),
    profile: console.profile?.bind(console) ?? (() => { }),
    profileEnd: console.profileEnd?.bind(console) ?? (() => { }),
    exception: (console as any).exception?.bind(console) ?? (() => { }),
  } as unknown as Record<keyof Console, (...args: unknown[]) => void>;

  const transports: winston.transport[] = [];

  // Resolve Loki push URL. Accept both explicit config and process env to
  // maintain backward-compatibility.
  const lokiUrl = config.lokiUrl ?? process.env.LOKI_URL;

  if (!lokiUrl) {
    originalConsole.warn('Loki URL not provided — logs will only be output to console.');
  }

  if (config.enableConsole !== false) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple()
        ),
      })
    );
  }

  const winstonLogger = winston.createLogger({
    level: 'debug',
    transports,
  });

  /**
   * Pushes a single log entry to Loki using the minimal HTTP interface.
   * We intentionally fire-and-forget (no await) so that application logic
   * is never blocked by logging operations. Errors are swallowed after
   * being written to the original console to avoid recursive failure
   * loops.
   */
  const sendToLoki = async (level: string, message: string): Promise<void> => {
    if (!lokiUrl) return;

    try {
      const payload = {
        streams: [
          {
            stream: { app: config.appName, level },
            values: [[(Date.now() * 1_000_000).toString(), message]], // nanoseconds
          },
        ],
      };

      // Using the global fetch available in Node >=18.
      await fetch(lokiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // 2-second timeout – fetch API doesn't support native timeout yet;
        // we rely on underlying socket default which is acceptable for
        // non-blocking fire-and-forget scenario.
      });
    } catch (err) {
      // Don't re-throw – just surface the problem for debugging.
      originalConsole.error('Failed to send log to Loki:', err);
    }
  };

  // Build replacement console with dual logging (stdout + Loki).
  const proxyLogger = {
    info: (...args: unknown[]): void => {
      originalConsole.info(...args);
      const message = args.map(String).join(' ');
      winstonLogger.info(message);
      void sendToLoki('info', message);
    },
    error: (...args: unknown[]): void => {
      originalConsole.error(...args);
      const message = args.map(String).join(' ');
      winstonLogger.error(message);
      void sendToLoki('error', message);
    },
    warn: (...args: unknown[]): void => {
      originalConsole.warn(...args);
      const message = args.map(String).join(' ');
      winstonLogger.warn(message);
      void sendToLoki('warn', message);
    },
    debug: (...args: unknown[]): void => {
      originalConsole.debug(...args);
      const message = args.map(String).join(' ');
      winstonLogger.debug(message);
      void sendToLoki('debug', message);
    },
    log: (...args: unknown[]): void => {
      originalConsole.log(...args);
      const message = args.map(String).join(' ');
      winstonLogger.info(message);
      void sendToLoki('info', message);
    },
    trace: (...args: unknown[]): void => {
      originalConsole.trace(...args);
      const message = args.map(String).join(' ');
      winstonLogger.verbose(message);
      void sendToLoki('trace', message);
    },
  } as Partial<Console>;

  Object.assign(console, proxyLogger);
  originalConsole.info(`Logging initialized for ${config.appName}`);
}

// Re-export winston so consumers can create child loggers if needed.
export { winston };
