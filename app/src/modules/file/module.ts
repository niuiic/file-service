import { Module } from '@nestjs/common'
import { FileDeleteController } from './controller/delete'
import { FileQueryController } from './controller/query'
import { FileUploadController } from './controller/upload'
import { FileDownloadController } from './controller/download'
import { FileChunkController } from './controller/chunk'
import { MultipartUploadDAO } from './service/multipartUpload.dao'
import { FilesDAO } from './service/files.dao'

@Module({
  controllers: [
    FileQueryController,
    FileUploadController,
    FileDeleteController,
    FileDownloadController,
    FileChunkController
  ],
  providers: [MultipartUploadDAO, FilesDAO]
})
export class FileModule {}
