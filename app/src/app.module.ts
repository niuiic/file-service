import { Module } from '@nestjs/common'
import { FileModule } from './modules/file/file.module'
import { DBModule } from './modules/db/db.module'
import { ConfigModule } from './modules/config/config.module'
import { IdModule } from './modules/id/id.module'
import { CacheModule } from './modules/cache/cache.module'
import { S3Module } from './modules/s3/s3.module'
import { isMockMode } from './share/mode'
import { configPath, configPathMock } from './share/config'

@Module({
  imports: [
    ConfigModule.forRoot(isMockMode() ? configPathMock : configPath),
    DBModule,
    FileModule,
    IdModule,
    CacheModule,
    S3Module
  ]
})
export class AppModule {}
