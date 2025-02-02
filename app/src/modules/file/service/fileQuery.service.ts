import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { assert } from '@/share/assert'
import type { FileVariant } from './variant'

// % FileQueryService %
@Injectable()
export class FileQueryService {
  // %% constructor %%
  constructor(@Inject(FilesDAO) private readonly filesDAO: FilesDAO) {}

  // %% queryFileInfo %%
  async queryFileInfo(fileId: string) {
    return this.filesDAO.queryFileById(fileId).then((x) => {
      assert(x, '文件不存在')
      return x
    })
  }

  // %% queryFilesInfo %%
  async queryFilesInfo(fileIds: string[]) {
    return this.filesDAO.queryFilesById(fileIds)
  }

  // %% isFileUploaded %%
  async isFileUploaded(fileHash: string, variant?: FileVariant) {
    return this.filesDAO
      .queryFilesByHash(fileHash, variant)
      .then((x) => x.length > 0)
  }
}
