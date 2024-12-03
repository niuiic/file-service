import { Module } from '@nestjs/common'
import { FileDAO } from './file.dao'
import { FileController } from './file.controller'
import { FileService } from './file.service'

@Module({
  providers: [FileDAO, FileService],
  controllers: [FileController]
})
export class FileModule {}
