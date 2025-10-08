// correlation id header used across services
export const CORRELATION_ID_HEADER = 'x-correlation-id';

// default logger level if not configured
export const DEFAULT_LOG_LEVEL = 'info';

// supported pino levels as a tuple for reuse
export const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
] as const;
