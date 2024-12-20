import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from '@/modules/cache/module'

// % dao %
@Injectable()
export class UploadDAO {
  // %% constructor %%
  constructor(@Inject('CACHE') private readonly cache: Cache) {}

  // %% createMultipartUpload %%
  async createMultipartUpload({
    fileHash,
    uploadId,
    chunkSize,
    chunkCount,
    relativePath
  }: {
    fileHash: string
    uploadId: string
    chunkSize: number
    chunkCount: number
    relativePath: string
  }) {
    return this.cache.hset(getUploadKey(fileHash), {
      uploadId,
      fileHash,
      relativePath,
      chunkSize,
      chunks: [],
      uploadState: '0'.repeat(chunkCount)
    })
  }
}

const getUploadKey = (fileHash: string) => `UPLOAD:${fileHash}`
