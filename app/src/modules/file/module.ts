import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import { FileController } from './controller'
import { FileService } from './service'

@Module({
  providers: [FileDAO, FileService],
  controllers: [FileController]
})
export class FileModule {}
