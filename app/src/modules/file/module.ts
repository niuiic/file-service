import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import { FileDeleteController } from './controller/delete'
import { FileQueryController } from './controller/query'
import { FileUploadController } from './controller/upload'
import { FileDeleteService } from './service/delete'
import { FileQueryService } from './service/query'
import { FileUploadService } from './service/upload'

@Module({
  providers: [FileDAO, FileQueryService, FileUploadService, FileDeleteService],
  controllers: [FileQueryController, FileUploadController, FileDeleteController]
})
export class FileModule {}
