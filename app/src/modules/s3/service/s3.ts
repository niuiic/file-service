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
import { Transform, Readable } from 'stream'
import { Providers } from '@/modules/symbol'
import { IdService } from '@/modules/id/id.service'
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
    fileHash
  }: {
    fileData: Readable
    fileName: string
    fileHash?: string
  }): Promise<{ relativePath: string; fileSize: number; fileHash: string }> {
    const objectKey = this.newObjectKey(fileName)

    let size: number = 0
    const stream = fileData.pipe(
      new Transform({
        transform(chunk, _, callback) {
          size += chunk.length
          this.push(chunk)
          callback()
        }
      })
    )

    const { ETag } = await new Upload({
      client: this.client,
      params: {
        Bucket: this.config.s3.bucket,
        Key: objectKey,
        Body: stream
      }
    }).done()
    // HACK: ETag可能为undefined
    const hashValue = ETag?.slice(1, -1)

    const relativePath = getRelativePath(this.config.s3.bucket, objectKey)
    if (fileHash && fileHash !== hashValue) {
      await this.deleteFile(relativePath)
      throw new Error('hash值不正确')
    }

    return {
      relativePath,
      fileSize: size,
      fileHash: fileHash ?? (hashValue as string)
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
  ): Promise<{
    relativePath: string
    uploadId: string
    chunkSize: number
    chunkCount: number
  }> {
    const chunkCount = Math.ceil(fileSize / this.config.upload.chunkSize)
    if (chunkCount > this.maxChunkCount) {
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
      uploadId: res.UploadId!,
      chunkSize: this.config.upload.chunkSize,
      chunkCount
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

    const { ETag } = await this.client.send(
      new UploadPartCommand({
        Bucket: bucket,
        Key: objectKey,
        UploadId: uploadId,
        PartNumber: chunkIndex + 1,
        Body: chunkData
      })
    )
    const hash = ETag?.slice(1, -1)

    assert(chunkHash === hash, '分片数据有误')
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
  async downloadFile(relativePath: string): Promise<Readable> {
    const { bucket, objectKey } = getBucketAndObjectKey(relativePath)

    const webStream = (
      await this.client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: objectKey
        })
      )
    ).Body!.transformToWebStream()

    return toReadable(webStream)
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

const toReadable = (webStream: ReadableStream) => {
  const reader = webStream.getReader()

  return new Readable({
    read() {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            this.push(null)
          } else {
            this.push(value)
          }
        })
        .catch(() => {})
    }
  })
}
