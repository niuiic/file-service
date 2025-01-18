import type { AppConfig } from '@/share/config'
import { Global, Module } from '@nestjs/common'
import Redis from 'ioredis'
import { Providers } from '../symbol'

export type CacheClient = Redis

@Global()
@Module({
  providers: [
    {
      provide: Providers.CacheClient,
      useFactory: (config: AppConfig) =>
        new Redis({
          port: config.cache.port,
          host: config.cache.host,
          username: config.cache.username,
          password: config.cache.password,
          db: config.cache.database
        }),
      inject: [Providers.Config]
    }
  ],
  exports: [Providers.CacheClient]
})
export class CacheModule {}
