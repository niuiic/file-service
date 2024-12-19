import { Inject, Injectable } from '@nestjs/common'
import { FileDAO } from './dao'
import { isNil } from '@/share/isNil'
import type { FileSchema } from '../db/schema'
import type { S3Service } from '../s3/service/s3'

// % service %
@Injectable()
export class FileService {
  // %% constructor %%
  constructor(
    @Inject(FileDAO) private readonly dao: FileDAO,
    @Inject('S3') private readonly s3: S3Service
  ) {}

  // %% queryFileById %%
  async queryFileById(id: string): Promise<FileSchema | undefined> {
    return this.dao.queryFileById(id)
  }

  // %% queryFilesById %%
  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    return this.dao.queryFilesById(ids)
  }

  // %% queryFileByHash %%
  async queryFileByHash(hash: string): Promise<FileSchema[] | undefined> {
    return this.dao.queryFilesByHash(hash)
  }

  // %% uploadFileByBlob %%
  async uploadFileByBlob(
    fileData: Buffer,
    fileHash: string,
    fileName: string
  ): Promise<FileSchema> {
    const files = await this.dao.queryFilesByHash(fileHash)
    if (files.length > 0) {
      return this.uploadFileByHash({
        fileHash,
        fileName,
        skipCheck: true,
        uploadTime: files[0].uploadTime,
        fileSize: files[0].size,
        relativePath: files[0].relativePath
      })
    }

    const relativePath = await this.s3.uploadFileByBlob(
      fileData,
      fileName,
      fileHash
    )

    return this.dao.createFile({
      name: fileName,
      hash: fileHash,
      size: fileData.length,
      uploadTime: new Date(),
      relativePath,
      deleted: false
    })
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
      const files = await this.dao.queryFilesByHash(fileHash)
      if (files.length === 0) {
        throw new Error('文件未上传')
      }
      uploadTime = files[0].uploadTime
      fileSize = files[0].size
      relativePath = files[0].relativePath
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

  // %% deleteFileById %%
  async deleteFileById(fileId: string) {
    const file = await this.queryFileById(fileId)
    if (!file) {
      return
    }

    const files = await this.dao.queryFilesByHash(file.hash)
    if (files.length === 1) {
      await this.s3.deleteFile(file.relativePath)
    }

    return this.dao.deleteFileById(fileId)
  }
}
