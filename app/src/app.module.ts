import { Module } from '@nestjs/common'
import { FileModule } from './modules/file/file.module'
import { DBModule } from './modules/db/db.module'
import { ConfigModule } from './modules/config/config.module'
import { IdModule } from './modules/id/id.module'
import { CacheModule } from './modules/cache/cache.module'

@Module({
  imports: [ConfigModule, DBModule, FileModule, IdModule, CacheModule]
})
export class AppModule {}
