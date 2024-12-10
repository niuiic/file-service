import { loadConfig } from '@/share/config'
import type { DynamicModule } from '@nestjs/common'
import { Global, Module } from '@nestjs/common'

@Global()
@Module({})
export class ConfigModule {
  static forRoot(configPath: string): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG',
          useFactory: () => loadConfig(configPath)
        }
      ],
      exports: ['CONFIG']
    }
  }
}
