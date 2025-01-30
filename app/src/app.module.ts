import type { DynamicModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { configPath, configPathMock } from './share/config'
import { CacheModule } from './modules/cache/cache.module'
import { ConfigModule } from './modules/config/config.module'
import { DBModule } from './modules/db/db.module'
import { FileModule } from './modules/file/file.module'
import { IdModule } from './modules/id/id.module'
import { S3Module } from './modules/s3/s3.module'
import { LoggerModule } from './modules/logger/logger.module'
import { APP_INTERCEPTOR } from '@nestjs/core'
import {
  PerformanceLoggingInterceptor,
  ResponseTransformInterceptor
} from './share/interceptor'
import { TimeModule } from './modules/time/time.module'
import { TaskModule } from './modules/task/task.module'

@Module({})
export class AppModule {
  static forRoot(inMockMode: boolean): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(inMockMode ? configPathMock : configPath),
        DBModule,
        FileModule,
        IdModule,
        CacheModule,
        S3Module,
        LoggerModule,
        TimeModule,
        TaskModule
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: PerformanceLoggingInterceptor
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ResponseTransformInterceptor
        }
      ]
    }
  }
}
