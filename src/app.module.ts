import { Module } from '@nestjs/common'
import { FileModule } from './modules/file/file.module'
import { DBModule } from './modules/db/db.module'

@Module({ imports: [DBModule, FileModule] })
export class AppModule {}
