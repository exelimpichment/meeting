import { LOG_LEVELS } from '@/libs/logging/src/constants';

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LoggerModuleOptions {
  level?: LogLevel;
  serviceName?: string;
  base?: Record<string, unknown>;
  prettyPrint?: boolean;
}

export interface RequestContextStore {
  correlationId: string;
}
