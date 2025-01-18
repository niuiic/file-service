import { S3Service } from '@/modules/s3/service/s3'
import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import assert from 'assert'

@Injectable()
export class FileDeleteService {
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service
  ) {}

  async deleteFile(fileId: string) {
    const file = await this.filesDAO.queryFileById(fileId)
    assert(file, '文件不存在')

    await this.filesDAO.deleteFileById(fileId)

    const sameFiles = await this.filesDAO.queryFilesByHash(file.hash)
    if (sameFiles.length > 0) {
      return
    }

    await this.s3Service.deleteFile(file.relativePath)

    const variants = await this.filesDAO.queryVariantsByOriginHash(file.hash)
    variants.forEach(async (x) => {
      await this.filesDAO.deleteFileById(x.id)
      await this.s3Service.deleteFile(file.relativePath)
    })
  }
}
