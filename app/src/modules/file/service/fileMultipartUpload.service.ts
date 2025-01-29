import { Inject, Injectable } from '@nestjs/common'
import { FilesDAO } from './files.dao'
import { MultipartUploadDAO } from './multipartUpload.dao'
import { S3Service } from '@/modules/s3/service/s3.service'
import type { ChunksInfo } from './chunksInfo'
import type { FileVariant } from './variant'
import { FileCreateVariantService } from './fileCreateVariant.service'
import { Providers } from '@/modules/symbol'
import type { AppConfig } from '@/share/config'
import { validateFileType } from './validateFileType'

// % FileMultipartUploadService %
@Injectable()
export class FileMultipartUploadService {
  // %% constructor %%
  constructor(
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(MultipartUploadDAO)
    private readonly multipartUploadDAO: MultipartUploadDAO,
    @Inject(S3Service) private readonly s3Service: S3Service,
    @Inject(FileCreateVariantService)
    private readonly fileCreateVariantService: FileCreateVariantService,
    @Inject(Providers.Config) private readonly config: AppConfig
  ) {}

  // %% requestFileChunks %%
  async requestFileChunks(
    fileHash: string,
    fileName: string,
    fileSize: number
  ): Promise<ChunksInfo> {
    validateFileType(fileName, this.config.upload.acceptedFileTypes)

    const uploadInfo = await this.multipartUploadDAO.queryUploadInfo(fileHash)
    if (!uploadInfo) {
      const { relativePath, uploadId, chunkSize, chunkCount } =
        await this.s3Service.createMultipartUpload(fileName, fileSize)
      await this.multipartUploadDAO.createUpload({
        fileHash,
        fileSize,
        uploadId,
        chunkSize,
        chunkCount,
        relativePath
      })

      return {
        count: chunkCount,
        size: chunkSize,
        uploadedIndices: []
      }
    }

    return this.multipartUploadDAO.queryChunksInfo(
      fileHash
    ) as Promise<ChunksInfo>
  }

  // %% uploadFileChunk %%
  async uploadFileChunk({
    chunkData,
    chunkIndex,
    chunkHash,
    fileHash
  }: {
    chunkData: Buffer
    chunkIndex: number
    chunkHash: string
    fileHash: string
  }) {
    if (await this.multipartUploadDAO.isChunkUploaded(fileHash, chunkIndex)) {
      return
    }

    const uploadInfo = await this.multipartUploadDAO.queryUploadInfo(fileHash)
    if (!uploadInfo) {
      throw new Error('未创建分片方案')
    }
    await this.s3Service.uploadFileChunk({
      chunkData,
      relativePath: uploadInfo.relativePath,
      uploadId: uploadInfo.uploadId,
      chunkIndex,
      chunkHash
    })
    await this.multipartUploadDAO.setChunkUploaded({
      fileHash,
      chunkIndex,
      chunkHash
    })
  }

  // %% mergeFileChunks %%
  async mergeFileChunks({
    fileHash,
    fileName,
    variants,
    lifetime
  }: {
    fileHash: string
    fileName: string
    variants?: FileVariant[]
    lifetime?: number
  }) {
    const files = await this.filesDAO.queryFilesByHash(fileHash)
    if (files.length > 0) {
      const file = await this.filesDAO.createFile({
        name: fileName,
        hash: fileHash,
        size: files[0].size,
        relativePath: files[0].relativePath,
        uploadTime: files[0].uploadTime,
        expiryTime: lifetime ? getExpiryTime(lifetime) : undefined
      })

      this.createFileVariants(fileHash, variants).catch(() => {})

      return file
    }

    const uploadInfo = await this.multipartUploadDAO.queryUploadInfo(fileHash)
    if (!uploadInfo) {
      throw new Error('未创建分片方案')
    }

    if (!(await this.multipartUploadDAO.isReadyToMerge(fileHash))) {
      throw new Error('分片未全部上传完成')
    }

    const chunks = await this.multipartUploadDAO.queryChunks(fileHash)
    await this.s3Service.mergeFileChunks(
      uploadInfo.relativePath,
      uploadInfo.uploadId,
      Object.values(chunks)
    )

    const file = await this.filesDAO.createFile({
      name: fileName,
      hash: fileHash,
      size: uploadInfo.fileSize,
      relativePath: uploadInfo.relativePath,
      uploadTime: new Date(),
      expiryTime: lifetime ? getExpiryTime(lifetime) : undefined
    })

    await this.multipartUploadDAO.deleteUpload(fileHash)

    this.createFileVariants(fileHash, variants).catch(() => {})

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
}

// % extract %
const getExpiryTime = (lifetime: number) =>
  new Date(new Date().getTime() + lifetime * 1000)
