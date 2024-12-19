import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import { FileDeleteController } from './controller/delete'
import { FileQueryController } from './controller/query'
import { FileUploadController } from './controller/upload'
import { FileDeleteService } from './service/delete'
import { FileQueryService } from './service/query'
import { FileUploadService } from './service/upload'

@Module({
  controllers: [
    FileQueryController,
    FileUploadController,
    FileDeleteController
  ],
  providers: [FileDAO, FileQueryService, FileUploadService, FileDeleteService]
})
export class FileModule {}
