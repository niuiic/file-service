import { loadConfig } from '@/share/config'
import type { DynamicModule } from '@nestjs/common'
import { Global, Module } from '@nestjs/common'
import { Providers } from '../symbol'

@Global()
@Module({})
export class ConfigModule {
  static forRoot(configPath: string): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: Providers.Config,
          useFactory: () => loadConfig(configPath)
        }
      ],
      exports: [Providers.Config]
    }
  }
}
