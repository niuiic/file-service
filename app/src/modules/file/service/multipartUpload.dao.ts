import type { CacheClient } from '@/modules/cache/module'
import { Providers } from '@/modules/symbol'
import { isNil } from '@/share/isNil'
import { Inject, Injectable } from '@nestjs/common'
import type { ChunksInfo } from './chunksInfo'

@Injectable()
export class MultipartUploadDAO {
  // %% constructor %%
  constructor(
    @Inject(Providers.CacheClient) private readonly cacheClient: CacheClient
  ) {}

  // %% createUpload %%
  async createUpload({
    fileHash,
    fileSize,
    uploadId,
    chunkSize,
    chunkCount,
    relativePath
  }: {
    fileHash: string
    fileSize: number
    uploadId: string
    chunkSize: number
    chunkCount: number
    relativePath: string
  }) {
    return this.cacheClient.hset(getUploadKey(fileHash), {
      fileHash,
      fileSize,
      uploadId,
      chunkSize,
      chunkCount,
      relativePath
    })
  }

  // %% queryUploadInfo %%
  async queryUploadInfo(fileHash: string): Promise<
    | {
        uploadId: string
        fileSize: number
        relativePath: string
      }
    | undefined
  > {
    return this.cacheClient
      .hmget(getUploadKey(fileHash), 'uploadId', 'fileSize', 'relativePath')
      .then((data) => {
        if (data.some(isNil)) {
          return
        }

        const [uploadId, fileSize, relativePath] = data as string[]
        return {
          uploadId,
          fileSize: parseInt(fileSize, 10),
          relativePath
        }
      })
  }

  // %% deleteUpload %%
  async deleteUpload(fileHash: string) {
    return this.cacheClient
      .pipeline()
      .del(getUploadKey(fileHash))
      .del(getChunksKey(fileHash))
      .exec()
      .then(validateResults)
  }

  // %% isChunkUploaded %%
  async isChunkUploaded(
    fileHash: string,
    chunkIndex: number
  ): Promise<boolean> {
    return this.cacheClient
      .hget(getChunksKey(fileHash), chunkIndex.toString())
      .then(Boolean)
  }

  // %% setChunkUploaded %%
  async setChunkUploaded({
    fileHash,
    chunkIndex,
    chunkHash
  }: {
    fileHash: string
    chunkIndex: number
    chunkHash: string
  }) {
    return this.cacheClient.hset(getChunksKey(fileHash), {
      [chunkIndex]: chunkHash
    })
  }

  // %% queryChunksInfo %%
  async queryChunksInfo(fileHash: string): Promise<ChunksInfo | undefined> {
    return this.cacheClient
      .pipeline()
      .hmget(getUploadKey(fileHash), 'chunkCount', 'chunkSize')
      .hkeys(getChunksKey(fileHash))
      .exec()
      .then(validateResults)
      .then((results) => {
        if ((results[0] as string[]).some(isNil)) {
          return
        }

        const [chunkCount, chunkSize] = results[0] as string[]
        const uploadedIndices = results[1] as string[]

        const chunksInfo: ChunksInfo = {
          uploadedIndices: uploadedIndices.map((x) => parseInt(x, 10)),
          count: parseInt(chunkCount, 10),
          size: parseInt(chunkSize, 10)
        }

        return chunksInfo
      })
  }

  // %% queryChunks %%
  async queryChunks(fileHash: string) {
    return this.cacheClient.hgetall(getChunksKey(fileHash))
  }

  // %% isReadyToMerge %%
  async isReadyToMerge(fileHash: string): Promise<boolean> {
    return this.cacheClient
      .pipeline()
      .hget(getUploadKey(fileHash), 'chunkCount')
      .hlen(getChunksKey(fileHash))
      .exec()
      .then(validateResults)
      .then((results) => {
        const [chunkCount, uploadedCount] = results
        return parseInt(chunkCount as string, 10) === uploadedCount
      })
  }
}

// % extract %
const getUploadKey = (fileHash: string) => `FILESERVICE:UPLOAD:${fileHash}`

const getChunksKey = (fileHash: string) => `FILESERVICE:CHUNKS:${fileHash}`

const validateResults = (
  results: [error: Error | null, result: unknown][] | null
): unknown[] => {
  if (!results) {
    throw new Error('结果不存在')
  }

  return results.map(([err, value]) => {
    if (err) {
      throw err
    }
    return value
  })
}
