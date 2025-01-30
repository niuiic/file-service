import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { S3Service } from '@/modules/s3/service/s3.service'
import type { Readable } from 'stream'
import type { FileVariant } from './variant'
import { FileCreateVariantService } from './fileCreateVariant.service'
import assert from 'assert'
import { validateFileType } from './validateFileType'
import { Providers } from '@/modules/symbol'
import type { AppConfig } from '@/share/config'
import { TimeService } from '@/modules/time/time.service'

// % FileStreamUploadService %
@Injectable()
export class FileStreamUploadService {
  // %% constructor %%
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3Service: S3Service,
    @Inject(FileCreateVariantService)
    private readonly fileCreateVariantService: FileCreateVariantService,
    @Inject(Providers.Config) private readonly config: AppConfig,
    @Inject(TimeService) private readonly timeService: TimeService
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
    validateFileType(fileName, this.config.upload.acceptedFileTypes)

    if (fileHash) {
      const files = await this.filesDAO.queryFilesByHash(fileHash)
      if (files.length > 0) {
        const file = await this.filesDAO.createFile({
          name: fileName,
          hash: fileHash,
          size: files[0].size,
          relativePath: files[0].relativePath,
          uploadTime: files[0].uploadTime,
          expiryTime: lifetime ? this.getExpiryTime(lifetime) : undefined
        })

        this.createFileVariants(fileHash, variants).catch(() => {})

        return file
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

    if (!fileHash) {
      const files = await this.filesDAO.queryFilesByHash(hash)
      if (files.length > 1) {
        await this.s3Service.deleteFile(relativePath)
      }
    }

    const file = await this.filesDAO.createFile({
      name: fileName,
      hash,
      size: fileSize,
      relativePath,
      uploadTime: this.timeService.getNow(),
      expiryTime: lifetime ? this.getExpiryTime(lifetime) : undefined
    })

    this.createFileVariants(hash, variants).catch(() => {})

    return file
  }

  // %% createFileVariants %%
  private async createFileVariants(fileHash: string, variants?: FileVariant[]) {
    if (!variants) {
      return
    }

    return Promise.allSettled(
      new Set(variants)
        .values()
        .map((x) => this.fileCreateVariantService.createVariant(fileHash, x))
    )
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

    const file = await this.filesDAO.createFile({
      name: fileName,
      hash: fileHash,
      size: files[0].size,
      relativePath: files[0].relativePath,
      uploadTime: files[0].uploadTime,
      expiryTime: lifetime ? this.getExpiryTime(lifetime) : undefined
    })

    await this.createFileVariants(fileHash, variants).catch(() => {})

    return file
  }

  private getExpiryTime(lifetime: number) {
    return this.timeService.toZonedTime(
      new Date(new Date().getTime() + lifetime * 1000)
    )
  }
}
