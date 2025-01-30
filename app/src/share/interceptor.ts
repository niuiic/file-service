import type { Logger } from '@/modules/logger/logger.module'
import { Providers } from '@/modules/symbol'
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor
} from '@nestjs/common'
import { Inject, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { throwError, type Observable } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'

@Injectable()
export class PerformanceLoggingInterceptor<T>
  implements NestInterceptor<T, any>
{
  constructor(@Inject(Providers.Logger) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const url = context.switchToHttp().getRequest().url
    const startTime = Date.now()

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now()
        const duration = endTime - startTime
        this.logger.info({ url, duration })
      })
    )
  }
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, any>
{
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const skipTransformResponse = this.reflector.get<boolean>(
      'skipTransformResponse',
      context.getHandler()
    )

    if (skipTransformResponse) {
      return next.handle()
    }

    return next.handle().pipe(
      map((data) => ({ code: 200, data })),
      catchError((err) =>
        throwError(() => ({
          code: 500,
          msg: err.message || 'An unexpected error occurred'
        }))
      )
    )
  }
}

export const SkipTransformResponse = () =>
  SetMetadata('skipTransformResponse', true)
