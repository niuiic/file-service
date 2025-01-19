import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { S3Service } from '@/modules/s3/service/s3'
import { IdService } from '@/modules/id/id.service'
import type { Readable } from 'stream'
import type { FileVariant } from './variant'

// % FileStreamUploadService %
@Injectable()
export class FileStreamUploadService {
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service,
    @Inject(IdService) private readonly idService: IdService
  ) {}

  async uploadFileByStream({
    fileData,
    fileName,
    fileHash,
    variants
  }: {
    fileData: Readable
    fileName: string
    fileHash?: string
    variants?: FileVariant[]
  }) {}
}
