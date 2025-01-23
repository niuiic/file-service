import { Global, Module } from '@nestjs/common'
import { S3Service } from './service/s3.service'
import { newClient } from './service/client'
import { Providers } from '../symbol'

@Global()
@Module({
  providers: [
    {
      provide: Providers.S3Client,
      useFactory: newClient,
      inject: [Providers.Config]
    },
    S3Service
  ],
  exports: [S3Service]
})
export class S3Module {}
