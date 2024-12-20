import { Inject, Injectable } from '@nestjs/common'
import type { FileSchema } from '@/modules/db/schema'
import { FileDAO } from '../dao'
import type { AppConfig } from '@/share/config'

// % service %
@Injectable()
export class FileQueryService {
  // %% constructor %%
  constructor(
    @Inject(FileDAO) private fileDAO: FileDAO,
    @Inject('CONFIG') private config: AppConfig
  ) {}

  // %% queryFileById %%
  async queryFileById(id: string): Promise<FileSchema | undefined> {
    return this.fileDAO.queryFileById(id)
  }

  // %% queryFilesById %%
  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    return this.fileDAO.queryFilesById(ids)
  }

  // %% queryFileByHash %%
  async queryFileByHash(hash: string): Promise<FileSchema[] | undefined> {
    return this.fileDAO.queryFilesByHash(hash)
  }

  // %% queryFileUrlById %%
  async queryFileUrlById(fileId: string) {
    const file = await this.fileDAO.queryFileById(fileId)
    if (!file) {
      throw new Error('文件不存在')
    }

    const protocol = this.config.s3.useSSL ? 'https' : 'http'
    const url = `${protocol}://${this.config.s3.endPoint}:${this.config.s3.port}/${file.relativePath}`

    return url
  }
}
