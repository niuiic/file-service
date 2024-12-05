import { Global, Module } from '@nestjs/common'
import { loadConfig } from './loadConfig'

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: loadConfig
    }
  ],
  exports: ['CONFIG']
})
export class ConfigModule {}
