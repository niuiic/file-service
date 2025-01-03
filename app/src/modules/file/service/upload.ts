import { Inject, Injectable } from '@nestjs/common'
import { S3Service } from '@/modules/s3/service/s3'
import type { FileSchema } from '@/modules/db/schema'
import { isNil } from '@/share/isNil'
import { FilesDAO } from '../dao/files'
import type { Readable } from 'stream'

@Injectable()
export class FileUploadService {
  // %% constructor %%
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3: S3Service
  ) {}

  // %% uploadFileByStream %%
  async uploadFileByStream(
    fileData: Readable,
    fileName: string,
    fileHash?: string
  ): Promise<FileSchema> {
    if (fileHash) {
      const files = await this.filesDAO.queryFilesByHash(fileHash)
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
    }

    const {
      relativePath,
      fileSize,
      fileHash: hash
    } = await this.s3.uploadFileByStream(fileData, fileName, fileHash)

    return this.filesDAO.createFile({
      name: fileName,
      hash: hash,
      size: fileSize,
      uploadTime: new Date(),
      relativePath
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
      const files = await this.filesDAO.queryFilesByHash(fileHash)
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

    return this.filesDAO.createFile({
      name: fileName,
      hash: fileHash,
      size: fileSize,
      uploadTime,
      relativePath
    })
  }
}
