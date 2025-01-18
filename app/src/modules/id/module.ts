import { Global, Module } from '@nestjs/common'
import { Id } from './id.service'

@Global()
@Module({
  providers: [Id],
  exports: [Id]
})
export class IdModule {}
