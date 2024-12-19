import { Inject, Injectable } from '@nestjs/common'
import { FileDAO } from './dao'
import type { AppConfig } from '@/share/config'
import { isNil } from '@/share/isNil'
import type { FileSchema } from '../db/schema'

// % service %
@Injectable()
export class FileService {
  constructor(
    @Inject(FileDAO) private readonly dao: FileDAO,
    @Inject('CONFIG') private readonly config: AppConfig
  ) {}

  // %% queryFilesById %%
  async queryFileById(id: string): Promise<FileSchema | undefined> {
    return this.dao.queryFileById(id)
  }

  // %% queryFilesById %%
  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    return this.dao.queryFilesById(ids)
  }

  // %% uploadFileByBlob %%
  async uploadFileByBlob(
    fileData: Buffer,
    fileHash: string,
    fileName: string
  ): Promise<FileSchema> {
    const file = await this.dao.queryFilesByHash(fileHash)
    if (file) {
      return this.uploadFileByHash({
        fileHash,
        fileName,
        skipCheck: true,
        uploadTime: file.uploadTime,
        fileSize: file.size,
        relativePath: file.relativePath
      })
    }
  }

  // %% uploadFileByHash %%
  async uploadFileByHash({
    fileHash,
    fileName,
    skipCheck,
    uploadTime,
    fileSize,
    relativePath
  }: {
    fileHash: string
    fileName: string
    skipCheck?: boolean
    uploadTime?: Date
    fileSize?: number
    relativePath?: string
  }): Promise<FileSchema> {
    if (!skipCheck) {
      const file = await this.dao.queryFilesByHash(fileHash)
      if (!file) {
        throw new Error('文件未上传')
      }
      uploadTime = file.uploadTime
      fileSize = file.size
      relativePath = file.relativePath
    }

    if (!uploadTime) {
      throw new Error('未指定文件上传时间')
    }

    if (isNil(fileSize)) {
      throw new Error('未指定文件大小')
    }

    if (isNil(relativePath)) {
      throw new Error('未指定文件相对路径')
    }

    return this.dao.createFile({
      name: fileName,
      hash: fileHash,
      size: fileSize,
      uploadTime,
      relativePath,
      deleted: false
    })
  }
}
