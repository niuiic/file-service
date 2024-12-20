import { Inject, Injectable } from '@nestjs/common'
import { UploadDAO } from '../dao/upload'
import type { AppConfig } from '@/share/config'
import type { ChunkInfo } from './chunkInfo'
import { S3Service } from '@/modules/s3/service/s3'

// % service %
@Injectable()
export class FileChunkService {
  constructor(
    @Inject(UploadDAO) private readonly uploadDAO: UploadDAO,
    @Inject('CONFIG') private readonly config: AppConfig,
    @Inject(S3Service) private readonly s3: S3Service
  ) {}

  async requestFileChunks(
    fileHash: string,
    fileName: string,
    fileSize: number
  ): Promise<ChunkInfo[]> {
    const chunkSize = this.config.upload.chunkSize

    if (fileSize < chunkSize) {
      throw new Error('文件大小小于最小分片大小')
    }

    const { relativePath, uploadId } =
      await this.s3.createMultipartUpload(fileName)

    const chunkCount = Math.ceil(fileSize / chunkSize)
    await this.uploadDAO.createMultipartUpload({
      fileHash,
      uploadId,
      chunkSize,
      chunkCount,
      relativePath
    })

    const fileChunks: ChunkInfo[] = Array.from({ length: chunkCount }).map(
      (_, i): ChunkInfo => ({
        index: i,
        size: fileSize,
        uploaded: false
      })
    )

    return fileChunks
  }
}
