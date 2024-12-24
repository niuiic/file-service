import { Inject, Injectable } from '@nestjs/common'
import type { S3Client } from './client'
import type { AppConfig } from '@/share/config'
import type { SnowflakeIdGenerator } from 'snowflake-id'
import { join } from 'path'

@Injectable()
export class S3Service {
  // %% constructor %%
  constructor(
    @Inject('CLIENT') private readonly client: S3Client,
    @Inject('CONFIG') private readonly config: AppConfig,
    @Inject('ID') private readonly idGenerator: SnowflakeIdGenerator
  ) {}

  // %% uploadFileByBlob %%
  async uploadFileByBlob(
    fileData: Buffer,
    fileName: string,
    fileHash: string
  ): Promise<string> {
    const relativePath = join(this.idGenerator.getId(), fileName)

    const { etag } = await this.client.putObject(
      this.config.s3.bucket,
      relativePath,
      fileData
    )

    if (etag !== fileHash) {
      await this.client.removeObject(this.config.s3.bucket, relativePath)
      throw new Error('文件hash值不正确')
    }

    return join(this.config.s3.bucket, relativePath)
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
  }): Promise<string> {
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
      .then((x) => x.etag)
  }

  // %% mergeFileChunks %%
  async mergeFileChunks(
    relativePath: string,
    uploadId: string,
    chunks: { index: number; hash: string }[]
  ) {
    const { bucket, filePath } = getBucketAndFilePath(relativePath)

    await this.client.completeMultipartUpload(
      bucket,
      filePath,
      uploadId,
      chunks.map(({ index, hash }) => ({ etag: hash, part: index + 1 }))
    )
  }
}

const getBucketAndFilePath = (relativePath: string) => {
  const [bucket, ...paths] = relativePath.split('/')
  const filePath = paths.join('/')

  return { bucket, filePath }
}
