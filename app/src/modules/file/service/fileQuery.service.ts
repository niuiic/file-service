import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { toFileInfo, type FileInfo } from '../controller/fileInfo'
import assert from 'node:assert'
import type { FileVariant } from './variant'

// % FileQueryService %
@Injectable()
export class FileQueryService {
  // %% constructor %%
  constructor(@Inject(FilesDAO) private readonly filesDAO: FilesDAO) {}

  // %% queryFileInfo %%
  async queryFileInfo(fileId: string): Promise<FileInfo> {
    return this.filesDAO.queryFileById(fileId).then((x) => {
      assert(x, '文件不存在')
      return toFileInfo(x)
    })
  }

  // %% queryFilesInfo %%
  async queryFilesInfo(fileIds: string[]) {
    return this.filesDAO
      .queryFilesById(fileIds)
      .then((files) => files.map(toFileInfo))
  }

  // %% isFileUploaded %%
  async isFileUploaded(fileHash: string, variant?: FileVariant) {
    return this.filesDAO
      .queryFilesByHash(fileHash, variant)
      .then((x) => x.length > 0)
  }
}
