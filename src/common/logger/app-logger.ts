/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from '@nestjs/common';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export class AppLogger extends Logger {
  protected readonly context: string;
  private readonly isDev: boolean;

  constructor(context: string) {
    super(context);
    this.context = context;
    this.isDev = process.env.NODE_ENV !== 'production';
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.getTimestamp();
    const levelColor = this.getLevelColor(level);
    const contextColor = '\x1b[36m';
    const resetColor = '\x1b[0m';
    const boldColor = '\x1b[1m';

    let formattedMessage = `${boldColor}[${timestamp}]${resetColor} ${levelColor}[${level}]${resetColor} ${contextColor}[${this.context}]${resetColor} ${message}`;

    if (data) {
      const dataStr =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      formattedMessage += `\n${dataStr}`;
    }

    return formattedMessage;
  }

  private getLevelColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[35m', // Magenta
      [LogLevel.INFO]: '\x1b[34m', // Blue
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.SUCCESS]: '\x1b[32m', // Green
    };
    return colors[level] || '\x1b[0m';
  }

  debug(message: string, data?: any): void {
    if (this.isDev) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  log(message: string, data?: any): void {
    this.info(message, data);
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  error(message: string, error?: any, data?: any): void {
    let errorData = error;
    if (error instanceof Error) {
      errorData = {
        message: error.message,
        stack: error.stack,
        ...data,
      };
    } else if (data) {
      errorData = { ...error, ...data };
    }

    console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
  }

  success(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, data));
  }

  logRequest(method: string, path: string, query?: any, body?: any): void {
    const requestData = {
      method,
      path,
      ...(query && { query }),
      ...(body && { body }),
    };
    this.info('📨 Incoming Request', requestData);
  }

  logResponse(statusCode: number, duration: number, data?: any): void {
    const icon = statusCode >= 400 ? '❌' : statusCode >= 300 ? '↪️' : '✅';
    const responseData = {
      statusCode,
      duration: `${duration}ms`,
      ...(data && { data }),
    };
    this.info(`${icon} Response Sent`, responseData);
  }

  logDatabase(
    operation: string,
    table: string,
    duration: number,
    data?: any,
  ): void {
    const operationData = {
      operation,
      table,
      duration: `${duration}ms`,
      ...(data && { data }),
    };
    this.info('🗄️ Database Operation', operationData);
  }

  logAuthentication(action: string, userId?: string, email?: string): void {
    const authData = {
      action,
      ...(userId && { userId }),
      ...(email && { email }),
    };
    this.info('🔐 Authentication', authData);
  }

  logAuthorization(
    action: string,
    resource: string,
    allowed: boolean,
    userId?: string,
  ): void {
    const icon = allowed ? '✅' : '❌';
    const authData = {
      icon,
      action,
      resource,
      allowed,
      ...(userId && { userId }),
    };
    this.info(`Authorization Check`, authData);
  }

  logDataOperation(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    entity: string,
    id?: string,
    duration?: number,
    result?: any,
  ): void {
    const icon = '📝';
    const operationData = {
      operation,
      entity,
      ...(id && { id }),
      ...(duration && { duration: `${duration}ms` }),
      ...(result && { result }),
    };
    this.success(`${icon} ${operation} ${entity}`, operationData);
  }

  logWarningDetails(
    warning: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH',
    details?: any,
  ): void {
    const icon =
      severity === 'HIGH' ? '⚠️' : severity === 'MEDIUM' ? '⚡' : 'ℹ️';
    const warningData = { warning, severity, ...(details && { details }) };
    this.warn(`${icon} ${warning}`, warningData);
  }

  logErrorDetails(
    error: string,
    code: string,
    statusCode: number,
    context?: any,
  ): void {
    const errorData = {
      error,
      code,
      statusCode,
      timestamp: this.getTimestamp(),
      ...(context && { context }),
    };
    this.error('❌ Error Occurred', null, errorData);
  }

  logPerformance(
    operation: string,
    duration: number,
    threshold: number = 1000,
  ): void {
    const slow = duration > threshold;
    const icon = slow ? '🐢' : '⚡';
    const performanceData = {
      operation,
      duration: `${duration}ms`,
      slow,
      ...(slow && { recommendation: `Consider optimizing ${operation}` }),
    };
    slow
      ? this.warn(`${icon} Slow Operation`, performanceData)
      : this.info(`${icon} Fast Operation`, performanceData);
  }
}
