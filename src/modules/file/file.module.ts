import { Module } from '@nestjs/common'
import { FileDao } from './file.dao'

@Module({
  providers: [FileDao]
})
export class FileModule {}
