import { Module } from '@nestjs/common'
import { MultipartUploadDAO } from './service/multipartUpload.dao'
import { FilesDAO } from './service/files.dao'
import { FileQueryController } from './controller/fileQuery.controller'
import { FileDeleteController } from './controller/fileDelete.controller'
import { FileUploadController } from './controller/fileUpload.controller'
import { FileQueryService } from './service/fileQuery.service'
import { FileDownloadService } from './service/fileDownload.service'
import { FileDeleteService } from './service/fileDelete.service'
import { FileStreamUploadService } from './service/fileStreamUpload.service'
import { FileMultipartUploadService } from './service/fileMultipartUpload.service'
import { FileCreateVariantService } from './service/fileCreateVariant.service'
import {
  CreateJpegCompressed,
  CreatePngCompressed
} from './service/createVariant'
import { FileDownloadController } from './controller/fileDownload.controller'
import { FileCleanService } from './service/fileClean.service'

@Module({
  controllers: [
    FileQueryController,
    FileDeleteController,
    FileUploadController,
    FileDownloadController
  ],
  providers: [
    FileQueryService,
    FileDownloadService,
    FileDeleteService,
    FileStreamUploadService,
    FileMultipartUploadService,
    FileCreateVariantService,
    FilesDAO,
    MultipartUploadDAO,
    CreatePngCompressed,
    CreateJpegCompressed,
    FileCleanService
  ]
})
export class FileModule {}
