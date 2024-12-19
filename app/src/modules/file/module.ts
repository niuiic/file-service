import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import { FileQueryController, FileUploadController } from './controller'
import { FileService } from './service'

@Module({
  providers: [FileDAO, FileService],
  controllers: [FileQueryController, FileUploadController]
})
export class FileModule {}
