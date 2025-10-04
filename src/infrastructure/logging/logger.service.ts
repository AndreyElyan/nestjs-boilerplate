import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface ILogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  trace?: string;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context?: string;
  private logFormat: 'json' | 'text';
  private logLevel: LogLevel;

  constructor(private readonly configService: ConfigService) {
    this.logFormat = this.configService.get<'json' | 'text'>('LOG_FORMAT', 'json');
    this.logLevel = this.configService.get<LogLevel>('LOG_LEVEL', LogLevel.INFO);
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string | ILogContext): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: string | ILogContext): void {
    this.writeLog(LogLevel.ERROR, message, context, trace);
  }

  warn(message: string, context?: string | ILogContext): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: string | ILogContext): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string | ILogContext): void {
    this.writeLog(LogLevel.VERBOSE, message, context);
  }

  private writeLog(
    level: LogLevel,
    message: string,
    context?: string | ILogContext,
    trace?: string,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = this.buildLogEntry(level, message, context, trace);

    if (this.logFormat === 'json') {
      this.writeJsonLog(logEntry);
    } else {
      this.writeTextLog(logEntry);
    }
  }

  private buildLogEntry(
    level: LogLevel,
    message: string,
    context?: string | ILogContext,
    trace?: string,
  ): ILogEntry {
    const entry: ILogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (typeof context === 'string') {
      entry.context = context || this.context;
    } else if (context) {
      entry.context = this.context;
      entry.requestId = context.requestId;
      entry.correlationId = context.correlationId;
      entry.userId = context.userId;
      entry.metadata = context.metadata;
    } else {
      entry.context = this.context;
    }

    if (trace) {
      entry.trace = trace;
    }

    return entry;
  }

  private writeJsonLog(entry: ILogEntry): void {
    const output = JSON.stringify(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  private writeTextLog(entry: ILogEntry): void {
    const { timestamp, level, context, message, requestId, trace } = entry;
    const contextStr = context ? `[${context}]` : '';
    const requestIdStr = requestId ? `[${requestId}]` : '';
    const output = `${timestamp} ${level.toUpperCase()} ${contextStr}${requestIdStr} ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(output);
        if (trace) {
          console.error(trace);
        }
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.VERBOSE];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }
}
