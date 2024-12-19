import { Inject, Injectable } from '@nestjs/common'
import type { S3Client } from './client'
import type { AppConfig } from '@/share/config'
import type { SnowflakeIdGenerator } from 'snowflake-id'
import { join } from 'path'

@Injectable()
export class S3Service {
  // %% constructor %%
  constructor(
    @Inject('CLIENT') private client: S3Client,
    @Inject('CONFIG') private config: AppConfig,
    @Inject('ID') private idGenerator: SnowflakeIdGenerator
  ) {}

  // %% uploadFileByBlob %%
  async uploadFileByBlob(fileData: Buffer, fileName: string, fileHash: string) {
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
  async deleteFile(relativePath: string) {
    const [bucket, ...paths] = relativePath.split('/')
    const filePath = paths.join('/')

    return this.client.removeObject(bucket, filePath)
  }
}
