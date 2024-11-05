import { Module } from '@nestjs/common'
import { FileModule } from './modules/file/file.module'
import { DBModule } from './modules/db/db.module'
import { ConfigModule } from './modules/config/config.module'

@Module({ imports: [ConfigModule, DBModule, FileModule] })
export class AppModule {}
