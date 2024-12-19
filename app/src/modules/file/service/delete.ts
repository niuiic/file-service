import { Injectable } from '@nestjs/common'
import type { FileQueryService } from './query'
import type { FileDAO } from '../dao'
import type { S3Service } from '@/modules/s3/service/s3'

@Injectable()
export class FileDeleteService {
  constructor(
    private readonly fileQueryService: FileQueryService,
    private readonly fileDAO: FileDAO,
    private readonly s3: S3Service
  ) {}

  // %% deleteFileById %%
  async deleteFileById(fileId: string) {
    const file = await this.fileQueryService.queryFileById(fileId)
    if (!file) {
      return
    }

    const files = await this.fileDAO.queryFilesByHash(file.hash)
    if (files.length === 1) {
      await this.s3.deleteFile(file.relativePath)
    }

    return this.fileDAO.deleteFileById(fileId)
  }
}
