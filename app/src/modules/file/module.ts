import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import {
  FileDeleteController,
  FileQueryController,
  FileUploadController
} from './controller'
import { FileService } from './service'

@Module({
  providers: [FileDAO, FileService],
  controllers: [FileQueryController, FileUploadController, FileDeleteController]
})
export class FileModule {}
