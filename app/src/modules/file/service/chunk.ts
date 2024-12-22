import { Inject, Injectable } from '@nestjs/common'
import { UploadDAO } from '../dao/upload'
import type { AppConfig } from '@/share/config'
import type { ChunkInfo } from './chunkInfo'
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
  ): Promise<ChunkInfo[]> {
    let chunksInfo = await this.uploadDAO.queryChunksInfo(fileHash)
    if (chunksInfo.length > 0) {
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

    chunksInfo = Array.from({ length: chunkCount }).map(
      (_, i): ChunkInfo => ({
        index: i,
        size: fileSize,
        uploaded: false
      })
    )

    return chunksInfo
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

    if (uploadInfo.uploaded[chunkIndex]) {
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

    const chunksInfo = await this.uploadDAO.queryChunksInfo(fileHash)
    const uploadInfo = await this.uploadDAO.queryUploadInfo(fileHash)
    if (!uploadInfo) {
      throw new Error('未创建分片上传任务')
    }

    await this.s3.mergeFileChunks(
      uploadInfo.relativePath,
      uploadInfo.uploadId,
      chunksInfo.map((x) => ({ index: x.index, hash: x.hash! }))
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
