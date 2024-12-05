import { Global, Module } from '@nestjs/common'
import type { AppConfig } from '../config/loadConfig'
import Redis from 'ioredis'

export type Cache = Redis

@Global()
@Module({
  providers: [
    {
      provide: 'CACHE',
      useFactory: (config: AppConfig) =>
        new Redis({
          port: config.cache.port,
          host: config.cache.host,
          username: config.cache.username,
          password: config.cache.password,
          db: config.cache.db
        }),
      inject: ['CONFIG']
    }
  ],
  exports: ['CACHE']
})
export class CacheModule {}
