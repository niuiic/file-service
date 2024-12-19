import { Injectable } from '@nestjs/common'
import type { S3Service } from '@/modules/s3/service/s3'
import type { FileSchema } from '@/modules/db/schema'
import { isNil } from '@/share/isNil'
import type { FileDAO } from '../dao'

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileDAO: FileDAO,
    private readonly s3: S3Service
  ) {}

  // %% uploadFileByBlob %%
  async uploadFileByBlob(
    fileData: Buffer,
    fileHash: string,
    fileName: string
  ): Promise<FileSchema> {
    const files = await this.fileDAO.queryFilesByHash(fileHash)
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

    return this.fileDAO.createFile({
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
      const files = await this.fileDAO.queryFilesByHash(fileHash)
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

    return this.fileDAO.createFile({
      name: fileName,
      hash: fileHash,
      size: fileSize,
      uploadTime,
      relativePath,
      deleted: false
    })
  }
}
