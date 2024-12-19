import type { DynamicModule } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { FileModule } from './modules/file/module'
import { DBModule } from './modules/db/module'
import { ConfigModule } from './modules/config/module'
import { IdModule } from './modules/id/module'
import { CacheModule } from './modules/cache/module'
import { S3Module } from './modules/s3/module'
import { configPath, configPathMock } from './share/config'

@Module({})
export class AppModule {
  static forRoot(isMockMode: boolean): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot(isMockMode ? configPathMock : configPath),
        DBModule,
        FileModule,
        IdModule,
        CacheModule,
        S3Module
      ]
    }
  }
}
