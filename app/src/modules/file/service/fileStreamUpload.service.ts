import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { S3Service } from '@/modules/s3/service/s3'
import type { Readable } from 'stream'
import type { FileVariant } from './variant'
import { toFileInfo } from '../controller/fileInfo'
import { FileCreateVariantService } from './fileCreateVariant.service'
import assert from 'assert'

// % FileStreamUploadService %
@Injectable()
export class FileStreamUploadService {
  // %% constructor %%
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service,
    @Inject(FileCreateVariantService)
    private readonly fileCreateVariantService: FileCreateVariantService
  ) {}

  // %% uploadFileByStream %%
  async uploadFileByStream({
    fileData,
    fileName,
    fileHash,
    variants,
    lifetime
  }: {
    fileData: Readable
    fileName: string
    fileHash?: string
    variants?: FileVariant[]
    lifetime?: number
  }) {
    if (fileHash) {
      const files = await this.filesDAO.queryFilesByHash(fileHash)
      if (files.length > 0) {
        return this.filesDAO
          .createFile({
            name: fileName,
            hash: fileHash,
            size: files[0].size,
            relativePath: files[0].relativePath,
            uploadTime: files[0].uploadTime,
            expiryTime: lifetime ? getExpiryTime(lifetime) : undefined
          })
          .then(toFileInfo)
      }
    }

    const {
      fileHash: hash,
      relativePath,
      fileSize
    } = await this.s3Service.uploadFileByStream({
      fileData,
      fileName,
      fileHash
    })

    if (variants) {
      Promise.all(
        new Set(variants)
          .values()
          .map((x) =>
            this.fileCreateVariantService.createVariant(hash, x).catch(() => {})
          )
      ).catch(() => {})
    }

    return this.filesDAO
      .createFile({
        name: fileName,
        hash,
        size: fileSize,
        relativePath,
        uploadTime: new Date(),
        expiryTime: lifetime ? getExpiryTime(lifetime) : undefined
      })
      .then(toFileInfo)
  }

  // %% uploadFileByHash %%
  async uploadFileByHash({
    fileName,
    fileHash,
    variants,
    lifetime
  }: {
    fileName: string
    fileHash: string
    variants?: FileVariant[]
    lifetime?: number
  }) {
    const files = await this.filesDAO.queryFilesByHash(fileHash)
    assert(files.length > 0, '文件未上传')

    if (variants) {
      Promise.all(
        new Set(variants)
          .values()
          .map((x) =>
            this.fileCreateVariantService
              .createVariant(fileHash, x)
              .catch(() => {})
          )
      ).catch(() => {})
    }

    return this.filesDAO
      .createFile({
        name: fileName,
        hash: fileHash,
        size: files[0].size,
        relativePath: files[0].relativePath,
        uploadTime: files[0].uploadTime,
        expiryTime: lifetime ? getExpiryTime(lifetime) : undefined
      })
      .then(toFileInfo)
  }
}

const getExpiryTime = (lifetime: number) =>
  new Date(new Date().getTime() + lifetime * 1000)
