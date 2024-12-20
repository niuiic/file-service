import { Module } from '@nestjs/common'
import { FilesDAO } from './dao/files'
import { FileDeleteController } from './controller/delete'
import { FileQueryController } from './controller/query'
import { FileUploadController } from './controller/upload'
import { FileDeleteService } from './service/delete'
import { FileQueryService } from './service/query'
import { FileUploadService } from './service/upload'
import { FileDownloadController } from './controller/download'
import { FileChunkController } from './controller/chunk'
import { FileChunkService } from './service/chunk'
import { UploadDAO } from './dao/upload'

@Module({
  controllers: [
    FileQueryController,
    FileUploadController,
    FileDeleteController,
    FileDownloadController,
    FileChunkController
  ],
  providers: [
    FilesDAO,
    UploadDAO,
    FileQueryService,
    FileUploadService,
    FileDeleteService,
    FileChunkService
  ]
})
export class FileModule {}
