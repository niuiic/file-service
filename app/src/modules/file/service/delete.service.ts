import { Inject, Injectable } from '@nestjs/common'
import { FileQueryService } from './query'
import { S3Service } from '@/modules/s3/service/s3'
import { FilesDAO } from '../dao/files'

@Injectable()
export class FileDeleteService {
  constructor(
    @Inject(FileQueryService)
    private readonly fileQueryService: FileQueryService,
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3: S3Service
  ) {}

  // %% deleteFileById %%
  async deleteFileById(fileId: string) {
    const file = await this.fileQueryService.queryFileById(fileId)
    if (!file) {
      return
    }

    const files = await this.filesDAO.queryFilesByHash(file.hash)
    if (files.length === 1) {
      await this.s3.deleteFile(file.relativePath)
    }

    return this.filesDAO.deleteFileById(fileId)
  }
}
