/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AppLogger } from '../logger';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.getArgByIndex(0) as Request;
    const response = context.getArgByIndex(1) as Response;
    const { method, url, query, body } = request;

    const startTime = Date.now();

    this.logger.logRequest(
      method,
      url,
      query,
      body && Object.keys(body).length > 0 ? body : undefined,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.logResponse(response.statusCode, duration);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.getStatus ? error.getStatus() : 500;

        this.logger.logErrorDetails(
          'HTTP Request Failed',
          'HTTP_ERROR',
          statusCode,
          {
            method,
            url,
            duration: `${duration}ms`,
            error: error.message,
          },
        );

        throw error;
      }),
    );
  }
}
