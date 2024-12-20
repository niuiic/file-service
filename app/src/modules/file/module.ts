import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import { FileDeleteController } from './controller/delete'
import { FileQueryController } from './controller/query'
import { FileUploadController } from './controller/upload'
import { FileDeleteService } from './service/delete'
import { FileQueryService } from './service/query'
import { FileUploadService } from './service/upload'
import { FileDownloadController } from './controller/download'
import { FileChunkController } from './controller/chunk'
import { FileChunkService } from './service/chunk'

@Module({
  controllers: [
    FileQueryController,
    FileUploadController,
    FileDeleteController,
    FileDownloadController,
    FileChunkController
  ],
  providers: [
    FileDAO,
    FileQueryService,
    FileUploadService,
    FileDeleteService,
    FileChunkService
  ]
})
export class FileModule {}
