import { loadConfig } from '@/share/config'
import { Global, Module } from '@nestjs/common'

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
