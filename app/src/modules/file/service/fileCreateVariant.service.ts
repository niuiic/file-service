import { S3Service } from '@/modules/s3/service/s3.service'
import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { FileVariant } from './variant'
import type { Readable } from 'node:stream'
import type { Transform } from 'node:stream'
import { CreateJpegCompressed, CreatePngCompressed } from './createVariant'
import assert from 'node:assert'
import { never } from '@/share/never'

// % FileCreateVariantService %
@Injectable()
export class FileCreateVariantService {
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service,
    @Inject(CreatePngCompressed)
    private readonly createPngCompressed: CreatePngCompressed,
    @Inject(CreateJpegCompressed)
    private readonly createJpegCompressed: CreateJpegCompressed
  ) {}

  async createVariant(fileHash: string, variant: FileVariant) {
    const variants = await this.filesDAO.queryFilesByHash(fileHash, variant)
    if (variants.length > 0) {
      return
    }

    const files = await this.filesDAO.queryFilesByHash(fileHash)
    assert(files.length > 0, '文件不存在')

    const file = files[0]
    const variantData = await this.s3Service
      .downloadFile(file.relativePath)
      .then((x) => this.toVariant(x, variant))

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

  private toVariant(fileData: Readable, variant: FileVariant) {
    switch (variant) {
      case FileVariant.PngCompressed:
        return this.createJpegCompressed.execute(fileData)
      case FileVariant.JpegCompressed:
        return this.createPngCompressed.execute(fileData)
      default: {
        never(variant)
        throw new Error('不支持的变体')
      }
    }
  }
}

