import { Module } from '@nestjs/common'
import { FileDao } from './file.dao'
import { FileController } from './file.controller'
import { FileService } from './file.service'

@Module({
  providers: [FileDao, FileService],
  controllers: [FileController]
})
export class FileModule {}
