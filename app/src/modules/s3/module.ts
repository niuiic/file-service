import { Global, Module } from '@nestjs/common'
import { S3Service } from './service/s3'
import { newClient } from './service/client'

@Global()
@Module({
  providers: [
    {
      provide: 'S3',
      useClass: S3Service
    },
    {
      provide: 'CLIENT',
      useFactory: newClient,
      inject: ['CONFIG']
    }
  ],
  exports: ['S3']
})
export class S3Module {}
