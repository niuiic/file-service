import { S3Service } from '@/modules/s3/service/s3'
import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import type { FileVariant } from './variant'
import type { Readable } from 'node:stream'
import { Transform } from 'node:stream'
import sharp from 'sharp'

// % FileCreateVariantService %
@Injectable()
export class FileCreateVariantService {
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service
  ) {}

  async createVariant(fileHash: string, variant: FileVariant) {
    const variants = await this.filesDAO.queryFilesByHash(fileHash, variant)
    if (variants.length > 0) {
      return
    }

    const files = await this.filesDAO.queryFilesByHash(fileHash)
    if (files.length === 0) {
      throw new Error('文件不存在')
    }

    const file = files[0]
    const variantData = await this.s3Service
      .downloadFile(file.relativePath)
      .then((x) => toVariant(x, variant))

    await this.uploadVariantByStream({
      fileData: variantData,
      fileName: file.name,
      originHash: file.hash,
      uploadTime: file.uploadTime,
      variant
    })
  }

  private async uploadVariantByStream({
    fileData,
    fileName,
    originHash,
    uploadTime,
    variant
  }: {
    fileData: Transform
    fileName: string
    originHash: string
    uploadTime: Date
    variant: FileVariant
  }) {
    // TODO: check if variant is supported
    const { relativePath, fileHash, fileSize } =
      await this.s3Service.uploadFileByStream({ fileData, fileName })
    await this.filesDAO.createFile({
      name: fileName,
      hash: fileHash,
      size: fileSize,
      relativePath,
      uploadTime,
      variant,
      origin_hash: originHash
    })
  }
}

// TODO: toVariant
const toVariant = (fileData: Readable, variant: FileVariant) =>
  fileData.pipe(sharp().jpeg({ quality: 80 })).pipe(
    new Transform({
      transform(chunk, _, callback) {
        this.push(chunk)
        callback()
      }
    })
  )

