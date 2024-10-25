import { Module } from '@nestjs/common'
import { FileDao } from './file.dao'
import { FileController } from './file.controller'
import { FileService } from './file.service'
import { db } from '@/share/db/db'

@Module({
  providers: [
    {
      provide: 'DB',
      useValue: db
    },
    FileDao,
    FileService
  ],
  controllers: [FileController]
})
export class FileModule {}
