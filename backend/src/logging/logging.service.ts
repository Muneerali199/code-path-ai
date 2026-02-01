import { Injectable, Logger, Scope } from '@nestjs/common';
import { Request, Response } from 'express';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
  meta?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  activeConnections: number;
  requestsPerSecond: number;
}

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);
  private logs: LogEntry[] = [];
  private readonly maxLogEntries = 10000; // Keep last 10k entries

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      context,
      meta,
      userId,
      requestId,
    };

    // Store in memory (in a real app, you'd store in a database or external service)
    this.logs.push(logEntry);

    // Trim logs if too many
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Also log to console
    switch (level) {
      case 'info':
        this.logger.log(message, context);
        break;
      case 'warn':
        this.logger.warn(message, context);
        break;
      case 'error':
        this.logger.error(message, context);
        break;
      case 'debug':
        this.logger.debug(message, context);
        break;
    }
  }

  info(message: string, context?: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log('info', message, context, meta, userId, requestId);
  }

  warn(message: string, context?: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log('warn', message, context, meta, userId, requestId);
  }

  error(message: string, context?: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log('error', message, context, meta, userId, requestId);
  }

  debug(message: string, context?: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log('debug', message, context, meta, userId, requestId);
  }

  getLogs(limit: number = 100, offset: number = 0, filters?: { level?: string; context?: string; userId?: string }): LogEntry[] {
    let filteredLogs = this.logs;

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters?.context) {
      filteredLogs = filteredLogs.filter(log => log.context === filters.context);
    }

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  getLogCount(filters?: { level?: string; context?: string; userId?: string }): number {
    let count = this.logs.length;

    if (filters?.level) {
      count = this.logs.filter(log => log.level === filters.level).length;
    }

    if (filters?.context) {
      count = this.logs.filter(log => log.context === filters.context).length;
    }

    if (filters?.userId) {
      count = this.logs.filter(log => log.userId === filters.userId).length;
    }

    return count;
  }

  clearLogs() {
    this.logs = [];
  }

  // Middleware-like method to log HTTP requests
  logHttpRequest(req: Request, res: Response, startTime: number) {
    const duration = Date.now() - startTime;
    const logMeta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      durationMs: duration,
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    const message = `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`;

    this.log(level, message, 'HTTP', logMeta);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}