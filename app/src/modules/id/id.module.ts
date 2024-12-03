import { Global, Module } from '@nestjs/common'
import { SnowflakeIdGenerator } from 'snowflake-id'

@Global()
@Module({
  providers: [
    {
      provide: 'ID',
      useValue: new SnowflakeIdGenerator()
    }
  ],
  exports: ['ID']
})
export class IdModule {}
