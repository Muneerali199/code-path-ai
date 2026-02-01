import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import * as cluster from 'cluster';
import { LoggingService } from '../logging/logging.service';

export interface MonitoringMetrics {
  cpu: {
    usage: number;
    count: number;
    model: string;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  network: {
    interfaces: any;
  };
  process: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
  app: {
    activeUsers: number;
    activeConnections: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private activeConnections: number = 0;
  private activeUsers: Set<string> = new Set();

  constructor(private readonly loggingService: LoggingService) {
    // Start periodic metrics collection
    this.startMetricsCollection();
  }

  getMetrics(): MonitoringMetrics {
    return {
      cpu: this.getCpuMetrics(),
      memory: this.getMemoryMetrics(),
      disk: this.getDiskMetrics(),
      network: this.getNetworkMetrics(),
      process: this.getProcessMetrics(),
      app: this.getAppMetrics(),
    };
  }

  incrementRequestCount() {
    this.requestCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  setActiveConnections(count: number) {
    this.activeConnections = count;
  }

  addActiveUser(userId: string) {
    this.activeUsers.add(userId);
  }

  removeActiveUser(userId: string) {
    this.activeUsers.delete(userId);
  }

  getHealthStatus(): any {
    const metrics = this.getMetrics();
    
    // Determine health based on thresholds
    const isHealthy = 
      metrics.cpu.usage < 80 &&
      metrics.memory.usage < 80 &&
      metrics.disk.usage < 90 &&
      metrics.app.errorRate < 0.05; // Less than 5% error rate

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
      metrics,
    };
  }

  private getCpuMetrics() {
    const cpus = os.cpus();
    const avgCpu = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + (total - idle) / total;
    }, 0) / cpus.length;

    return {
      usage: parseFloat((avgCpu * 100).toFixed(2)),
      count: cpus.length,
      model: cpus[0]?.model || 'Unknown',
    };
  }

  private getMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = (used / total) * 100;

    return {
      total,
      free,
      used,
      usage: parseFloat(usage.toFixed(2)),
    };
  }

  private getDiskMetrics() {
    // Note: This is a simplified version. A real implementation would use a library like 'diskusage'
    // For now, we'll use OS stats which don't provide disk usage directly
    // In a real app, you might use a library like 'diskusage' or 'fs' to get actual disk usage
    
    // Using a placeholder implementation
    const total = os.totalmem(); // Placeholder
    const free = os.freemem();  // Placeholder
    const used = total - free;
    const usage = (used / total) * 100;

    return {
      total,
      free,
      used,
      usage: parseFloat(usage.toFixed(2)),
    };
  }

  private getNetworkMetrics() {
    return {
      interfaces: os.networkInterfaces(),
    };
  }

  private getProcessMetrics() {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  private getAppMetrics() {
    const timeWindow = 60; // Last 60 seconds
    const requestsPerSecond = this.requestCount / timeWindow;
    const errorRate = this.errorCount > 0 ? this.errorCount / this.requestCount : 0;

    return {
      activeUsers: this.activeUsers.size,
      activeConnections: this.activeConnections,
      requestsPerSecond: parseFloat(requestsPerSecond.toFixed(2)),
      errorRate: parseFloat(errorRate.toFixed(4)),
    };
  }

  private startMetricsCollection() {
    // Collect metrics periodically
    setInterval(() => {
      const metrics = this.getMetrics();
      
      // Log metrics periodically
      this.loggingService.info('System metrics collected', 'MONITORING', {
        cpuUsage: metrics.cpu.usage,
        memoryUsage: metrics.memory.usage,
        activeConnections: metrics.app.activeConnections,
        requestsPerSecond: metrics.app.requestsPerSecond,
      });

      // Reset counters periodically (for rates)
      this.requestCount = 0;
      this.errorCount = 0;
    }, 60000); // Every minute
  }

  // Method to track API usage
  trackApiUsage(userId: string, endpoint: string, duration: number, success: boolean) {
    this.addActiveUser(userId);
    
    if (!success) {
      this.incrementErrorCount();
    }
    
    this.loggingService.info(`API call to ${endpoint} by user ${userId}`, 'API_USAGE', {
      userId,
      endpoint,
      duration,
      success,
    });
  }

  // Method to track AI usage
  trackAiUsage(userId: string, provider: string, model: string, tokensUsed: number, duration: number) {
    this.loggingService.info(`AI request to ${provider}/${model} by user ${userId}`, 'AI_USAGE', {
      userId,
      provider,
      model,
      tokensUsed,
      duration,
    });
  }

  // Method to track file operations
  trackFileOperation(userId: string, operation: string, filePath: string, fileSize?: number) {
    this.loggingService.info(`File operation ${operation} on ${filePath} by user ${userId}`, 'FILE_OP', {
      userId,
      operation,
      filePath,
      fileSize,
    });
  }
}