import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { S3Service } from '@/modules/s3/service/s3'
import type { FileVariant } from './variant'
import assert from 'assert'

@Injectable()
export class FileDownloadService {
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service
  ) {}

  async downloadFile(fileId: string, variant?: FileVariant) {
    const file = await this.filesDAO.queryFileById(fileId, variant)
    assert(file, '文件不存在')

    return this.s3Service.downloadFile(file.relativePath)
  }
}
