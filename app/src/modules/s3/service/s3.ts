import { Inject, Injectable } from '@nestjs/common'
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  UploadPartCommand,
  type S3Client
} from '@aws-sdk/client-s3'
import type { AppConfig } from '@/share/config'
import { join } from 'path'
import { Upload } from '@aws-sdk/lib-storage'
import { createHash } from 'crypto'
import { Transform, type Readable } from 'stream'
import { Providers } from '@/modules/symbol'
import { IdService } from '@/modules/id/id.service'
import { isNil } from '@/share/isNil'
import assert from 'assert'

// % service %
@Injectable()
export class S3Service {
  // %% constructor %%
  constructor(
    @Inject(Providers.S3Client) private readonly client: S3Client,
    @Inject(Providers.Config) private readonly config: AppConfig,
    @Inject(IdService) private readonly idGenerator: IdService
  ) {}

  // %% uploadFileByStream %%
  async uploadFileByStream({
    fileData,
    fileName,
    fileHash,
    fileSize
  }: {
    fileData: Readable
    fileName: string
    fileHash?: string
    fileSize?: number
  }): Promise<{ relativePath: string; fileSize: number; fileHash: string }> {
    const objectKey = this.newObjectKey(fileName)

    const hash = createHash('md5')
    let size: number = 0
    let stream: Readable | Transform
    if ([fileSize, fileHash].some(isNil)) {
      stream = fileData.pipe(
        new Transform({
          transform(chunk, _, callback) {
            hash.update(chunk)
            size += chunk.length
            this.push(chunk)
            callback()
          }
        })
      )
    } else {
      stream = fileData
    }

    await new Upload({
      client: this.client,
      params: {
        Bucket: this.config.s3.bucket,
        Key: objectKey,
        Body: stream
      }
    }).done()

    const relativePath = getRelativePath(this.config.s3.bucket, objectKey)
    const hashValue = hash.digest('hex')
    if ([fileSize, fileHash].some(isNil) || fileHash !== hashValue) {
      await this.deleteFile(relativePath)
      throw new Error('hash值不正确')
    }

    return {
      relativePath,
      fileSize: fileSize ?? size,
      fileHash: fileHash ?? hashValue
    }
  }

  // %% deleteFile %%
  async deleteFile(relativePath: string) {
    const { bucket, objectKey } = getBucketAndObjectKey(relativePath)

    return this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: objectKey
      })
    )
  }

  // %% createMultipartUpload %%
  async createMultipartUpload(
    fileName: string,
    fileSize: number
  ): Promise<{ relativePath: string; uploadId: string }> {
    if (fileSize / this.config.upload.chunkSize > this.maxChunkCount) {
      throw new Error('分片数量过多')
    }

    const objectKey = this.newObjectKey(fileName)

    const res = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.config.s3.bucket,
        Key: objectKey
      })
    )

    return {
      relativePath: getRelativePath(this.config.s3.bucket, objectKey),
      uploadId: res.UploadId!
    }
  }

  // %% uploadFileChunk %%
  async uploadFileChunk({
    chunkData,
    relativePath,
    uploadId,
    chunkIndex,
    chunkHash
  }: {
    chunkData: Buffer
    relativePath: string
    uploadId: string
    chunkIndex: number
    chunkHash: string
  }) {
    const { bucket, objectKey } = getBucketAndObjectKey(relativePath)

    const res = await this.client.send(
      new UploadPartCommand({
        Bucket: bucket,
        Key: objectKey,
        UploadId: uploadId,
        PartNumber: chunkIndex + 1,
        Body: chunkData
      })
    )

    assert(chunkHash === res.ETag, '分片数据有误')
  }

  // %% mergeFileChunks %%
  async mergeFileChunks(
    relativePath: string,
    uploadId: string,
    chunksHash: string[]
  ) {
    const { bucket, objectKey } = getBucketAndObjectKey(relativePath)

    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: objectKey,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: chunksHash.map((x, i) => ({
            PartNumber: i + 1,
            ETag: x
          }))
        }
      })
    )
  }

  // %% downloadFile %%
  async downloadFile(relativePath: string) {
    const { bucket, objectKey } = getBucketAndObjectKey(relativePath)

    return (
      await this.client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: objectKey
        })
      )
    ).Body!
  }

  // %% newObjectKey %%
  private newObjectKey(fileName: string) {
    return join(this.idGenerator.generateId(), fileName)
  }

  private maxChunkCount = 10000
}

// % extract %
const getBucketAndObjectKey = (relativePath: string) => {
  const [bucket, ...paths] = relativePath.split('/')
  const objectKey = paths.join('/')

  return { bucket, objectKey }
}

const getRelativePath = (bucket: string, objectKey: string) =>
  join(bucket, objectKey)
