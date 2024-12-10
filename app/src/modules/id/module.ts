import type { AppConfig } from '@/share/config'
import { Global, Module } from '@nestjs/common'
import { SnowflakeIdGenerator } from 'snowflake-id'

@Global()
@Module({
  providers: [
    {
      provide: 'ID',
      useFactory: (config: AppConfig) =>
        new SnowflakeIdGenerator(config.clusterId, config.machineId),
      inject: ['CONFIG']
    }
  ],
  exports: ['ID']
})
export class IdModule {}
