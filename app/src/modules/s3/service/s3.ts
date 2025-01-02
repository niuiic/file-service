import { Inject, Injectable } from '@nestjs/common'
import type { S3Client } from './client'
import type { AppConfig } from '@/share/config'
import type { SnowflakeIdGenerator } from 'snowflake-id'
import { join } from 'path'
import type { Readable } from 'stream'

// % service %
@Injectable()
export class S3Service {
  // %% constructor %%
  constructor(
    @Inject('CLIENT') private readonly client: S3Client,
    @Inject('CONFIG') private readonly config: AppConfig,
    @Inject('ID') private readonly idGenerator: SnowflakeIdGenerator
  ) {}

  // %% uploadFileByStream %%
  async uploadFileByStream(
    fileData: Readable,
    fileName: string,
    _fileHash: string
  ): Promise<{ relativePath: string; fileSize: number }> {
    const relativePath = join(this.idGenerator.getId(), fileName)

    // FIXME: check hash
    await this.client.putObject(this.config.s3.bucket, relativePath, fileData)

    const stat = await this.client.statObject(
      this.config.s3.bucket,
      relativePath
    )

    return {
      relativePath: join(this.config.s3.bucket, relativePath),
      fileSize: stat.size
    }
  }

  // %% deleteFile %%
  async deleteFile(relativePath: string): Promise<void> {
    const { bucket, filePath } = getBucketAndFilePath(relativePath)

    return this.client.removeObject(bucket, filePath)
  }

  // %% createMultipartUpload %%
  async createMultipartUpload(
    fileName: string
  ): Promise<{ relativePath: string; uploadId: string }> {
    const relativePath = join(this.idGenerator.getId(), fileName)

    return this.client
      .initiateNewMultipartUpload(this.config.s3.bucket, relativePath, {})
      .then((uploadId) => ({
        relativePath: join(this.config.s3.bucket, relativePath),
        uploadId
      }))
  }

  // %% uploadFileChunk %%
  async uploadFileChunk({
    chunkData,
    relativePath,
    uploadId,
    chunkIndex
  }: {
    chunkData: Buffer
    relativePath: string
    uploadId: string
    chunkIndex: number
  }): Promise<{ hash: string; part: number }> {
    const { bucket, filePath } = getBucketAndFilePath(relativePath)

    return this.client
      .uploadPart(
        {
          bucketName: bucket,
          objectName: filePath,
          uploadID: uploadId,
          partNumber: chunkIndex + 1,
          headers: {}
        },
        chunkData
      )
      .then((x) => ({ hash: x.etag, part: x.part }))
  }

  // %% mergeFileChunks %%
  async mergeFileChunks(
    relativePath: string,
    uploadId: string,
    chunks: { part: number; hash: string }[]
  ) {
    const { bucket, filePath } = getBucketAndFilePath(relativePath)

    await this.client.completeMultipartUpload(
      bucket,
      filePath,
      uploadId,
      chunks.map(({ part, hash }) => ({ etag: hash, part }))
    )
  }
}

// % extract %
const getBucketAndFilePath = (relativePath: string) => {
  const [bucket, ...paths] = relativePath.split('/')
  const filePath = paths.join('/')

  return { bucket, filePath }
}
