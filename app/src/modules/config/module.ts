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
          useFactory: () => {
            const config = loadConfig(configPath)

            if (config.upload.maxBlobSize < config.upload.chunkSize) {
              throw new Error('配置中maxBlobSize不能小于chunkSize')
            }
            if (config.upload.chunkSize < 5 * 1024 ** 2) {
              throw new Error('配置中chunkSize不能小于5M')
            }

            return config
          }
        }
      ],
      exports: ['CONFIG']
    }
  }
}
