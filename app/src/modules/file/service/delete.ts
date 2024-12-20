import { Inject, Injectable } from '@nestjs/common'
import { FileQueryService } from './query'
import { FileDAO } from '../dao'
import { S3Service } from '@/modules/s3/service/s3'

@Injectable()
export class FileDeleteService {
  constructor(
    @Inject(FileQueryService)
    private readonly fileQueryService: FileQueryService,
    @Inject(FileDAO) private readonly fileDAO: FileDAO,
    @Inject(S3Service) private readonly s3: S3Service
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
