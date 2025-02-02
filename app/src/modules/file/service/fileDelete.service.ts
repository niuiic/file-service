import { S3Service } from '@/modules/s3/service/s3.service'
import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { assert } from '@/share/assert'

@Injectable()
export class FileDeleteService {
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service
  ) {}

  async deleteFile(fileId: string) {
    const file = await this.filesDAO.queryFileById(fileId, undefined, true)
    assert(file, '文件不存在')

    await this.filesDAO.deleteFileById(fileId)

    const sameFiles = await this.filesDAO.queryFilesByHash(file.hash)
    if (sameFiles.length > 0) {
      return
    }

    await this.s3Service.deleteFile(file.relativePath)

    const variants = await this.filesDAO.queryVariantsByOriginHash(file.hash)
    variants.forEach((x) =>
      Promise.all([
        this.filesDAO.deleteFileById(x.id),
        this.s3Service.deleteFile(file.relativePath)
      ]).catch(() => {})
    )
  }
}
