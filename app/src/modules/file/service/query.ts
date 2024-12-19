import { Injectable } from '@nestjs/common'
import type { FileSchema } from '@/modules/db/schema'
import type { FileDAO } from '../dao'

// % service %
@Injectable()
export class FileQueryService {
  // %% constructor %%
  constructor(private fileDAO: FileDAO) {}

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
}
