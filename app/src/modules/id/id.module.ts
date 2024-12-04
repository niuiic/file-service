import { Global, Module } from '@nestjs/common'
import { SnowflakeIdGenerator } from 'snowflake-id'
import type { AppConfig } from '../config/config.module'

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
