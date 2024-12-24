import { Inject, Injectable } from '@nestjs/common'
import { UploadDAO } from '../dao/upload'
import type { AppConfig } from '@/share/config'
import type { ChunksInfo } from './chunksInfo'
import { S3Service } from '@/modules/s3/service/s3'
import { FilesDAO } from '../dao/files'

// % service %
@Injectable()
export class FileChunkService {
  // %% constructor %%
  constructor(
    @Inject(UploadDAO) private readonly uploadDAO: UploadDAO,
    @Inject('CONFIG') private readonly config: AppConfig,
    @Inject(FilesDAO) private readonly filesDAO: FilesDAO,
    @Inject(S3Service) private readonly s3: S3Service
  ) {}

  // %% requestFileChunks %%
  async requestFileChunks(
    fileHash: string,
    fileName: string,
    fileSize: number
  ): Promise<ChunksInfo> {
    const chunksInfo = await this.uploadDAO.queryChunksInfo(fileHash)
    if (chunksInfo) {
      return chunksInfo
    }

    const chunkSize = this.config.upload.chunkSize

    if (fileSize < chunkSize) {
      throw new Error('文件大小小于最小分片大小')
    }

    const { relativePath, uploadId } =
      await this.s3.createMultipartUpload(fileName)

    const chunkCount = Math.ceil(fileSize / chunkSize)
    await this.uploadDAO.createUpload({
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
    const uploadInfo = await this.uploadDAO.queryUploadInfo(fileHash)
    if (!uploadInfo) {
      throw new Error('未创建分片上传任务')
    }

    if (await this.uploadDAO.isChunkUploaded(fileHash, chunkIndex)) {
      return
    }

    const hash = await this.s3.uploadFileChunk({
      chunkData,
      relativePath: uploadInfo.relativePath,
      uploadId: uploadInfo.uploadId,
      chunkIndex
    })
    if (hash !== chunkHash) {
      throw new Error('分片hash值错误')
    }

    await this.uploadDAO.setChunkUploaded(fileHash, chunkIndex, chunkHash)
  }

  // %% mergeFileChunks %%
  async mergeFileChunks(fileHash: string) {
    if (!(await this.uploadDAO.isReadyToMerge(fileHash))) {
      throw new Error('文件分片上传未完成')
    }

    const chunksHash = await this.uploadDAO.queryChunksHash(fileHash)
    const uploadInfo = await this.uploadDAO.queryUploadInfo(fileHash)
    if (!uploadInfo) {
      throw new Error('未创建分片上传任务')
    }

    await this.s3.mergeFileChunks(
      uploadInfo.relativePath,
      uploadInfo.uploadId,
      chunksHash.map((x, i) => ({ index: i, hash: x }))
    )

    await this.uploadDAO.deleteUpload(fileHash)

    return this.filesDAO.createFile({
      relativePath: uploadInfo.relativePath,
      name: uploadInfo.relativePath.split('/').at(-1)!,
      hash: fileHash,
      size: uploadInfo.fileSize,
      uploadTime: new Date()
    })
  }
}
