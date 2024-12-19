import { Global, Module } from '@nestjs/common'
import { S3Service } from './service'

@Global()
@Module({
  providers: [
    {
      provide: 'S3',
      useClass: S3Service
    }
  ]
})
export class S3Module {}
