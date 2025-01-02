import { Inject, Injectable } from '@nestjs/common'
import type { S3Client } from './client'
import type { AppConfig } from '@/share/config'
import type { SnowflakeIdGenerator } from 'snowflake-id'
import { join } from 'path'
import { createHash } from 'crypto'
import { Transform, type Readable } from 'stream'

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
    fileHash?: string
  ): Promise<{ relativePath: string; fileSize: number; fileHash: string }> {
    const relativePath = join(this.idGenerator.getId(), fileName)

    let fileSize = 0
    const hash = createHash('md5')
    const stream = new Transform({
      transform(chunk, _, callback) {
        hash.update(chunk)
        this.push(chunk)
        fileSize += chunk.length
        callback()
      }
    })
    await this.client.putObject(
      this.config.s3.bucket,
      relativePath,
      fileData.pipe(stream)
    )

    const hashValue = hash.digest('hex')
    if (fileHash && fileHash !== hashValue) {
      await this.client.removeObject(this.config.s3.bucket, relativePath)
      throw new Error('hash值不正确')
    }

    return {
      relativePath: join(this.config.s3.bucket, relativePath),
      fileSize,
      fileHash: hashValue
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
