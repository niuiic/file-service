import { Module } from '@nestjs/common'
import { FileDAO } from './dao'
import { FileQueryController } from './controller'
import { FileService } from './service'

@Module({
  providers: [FileDAO, FileService],
  controllers: [FileQueryController]
})
export class FileModule {}
