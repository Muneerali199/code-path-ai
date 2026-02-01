import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const loggingService = this.loggingService;

    // Capture the original end method to intercept the response
    const originalEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
      // Log the request after response is sent
      loggingService.logHttpRequest(req, res, startTime);
      
      // Call the original end method
      return originalEnd(chunk, encoding, callback);
    } as any;

    next();
  }
}