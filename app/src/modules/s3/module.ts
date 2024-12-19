import { Global, Module } from '@nestjs/common'
import { S3Service } from './service/s3'
import { newClient } from './service/client'

@Global()
@Module({
  providers: [
    {
      provide: 'CLIENT',
      useFactory: newClient,
      inject: ['CONFIG']
    },
    S3Service
  ],
  exports: [S3Service]
})
export class S3Module {}
