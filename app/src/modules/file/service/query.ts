import { Inject, Injectable } from '@nestjs/common'
import type { FileSchema } from '@/modules/db/schema'
import type { AppConfig } from '@/share/config'
import { FilesDAO } from '../dao/files'

// % service %
@Injectable()
export class FileQueryService {
  // %% constructor %%
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject('CONFIG') private readonly config: AppConfig
  ) {}

  // %% queryFileById %%
  async queryFileById(id: string): Promise<FileSchema | undefined> {
    return this.filesDAO.queryFileById(id)
  }

  // %% queryFilesById %%
  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    return this.filesDAO.queryFilesById(ids)
  }

  // %% queryFileByHash %%
  async queryFileByHash(hash: string): Promise<FileSchema[] | undefined> {
    return this.filesDAO.queryFilesByHash(hash)
  }

  // %% queryFileUrlById %%
  async queryFileUrlById(fileId: string) {
    const file = await this.filesDAO.queryFileById(fileId)
    if (!file) {
      throw new Error('文件不存在')
    }

    const protocol = this.config.s3.useSSL ? 'https' : 'http'
    const url = `${protocol}://${this.config.s3.endPoint}:${this.config.s3.port}/${file.relativePath}`

    return url
  }
}
