import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from '@/modules/cache/module'
import type { ChunksInfo } from '../service/chunksInfo'
import { isNil } from '@/share/isNil'

// % dao %
@Injectable()
export class UploadDAO {
  // %% constructor %%
  constructor(@Inject('CACHE') private readonly cache: Cache) {}

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
    return this.cache
      .pipeline()
      .hset(getUploadKey(fileHash), {
        fileHash,
        fileSize,
        uploadId,
        chunkSize,
        chunkCount,
        relativePath
      })
      .exec()
      .then(validateResults)
  }

  // %% queryChunksInfo %%
  async queryChunksInfo(fileHash: string): Promise<ChunksInfo | undefined> {
    return this.cache
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

  // %% queryUploadInfo %%
  async queryUploadInfo(fileHash: string): Promise<
    | {
        uploadId: string
        fileSize: number
        relativePath: string
      }
    | undefined
  > {
    return this.cache
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

  // %% setChunkUploaded %%
  async setChunkUploaded(
    fileHash: string,
    chunkIndex: number,
    chunkHash: string
  ) {
    return this.cache.hset(getChunksKey(fileHash), { [chunkIndex]: chunkHash })
  }

  // %% isReadyToMerge %%
  async isReadyToMerge(fileHash: string): Promise<boolean> {
    return this.cache
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

  // %% deleteUpload %%
  async deleteUpload(fileHash: string) {
    return this.cache
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
    return this.cache
      .hexists(getChunksKey(fileHash), chunkIndex.toString())
      .then((x) => x === 1)
  }

  // %% queryChunksHash %%
  async queryChunksHash(
    fileHash: string
  ): Promise<{ [index: string]: string }> {
    return this.cache.hgetall(getChunksKey(fileHash))
  }
}

// % extract %
const getUploadKey = (fileHash: string) => `UPLOAD:${fileHash}`
const getChunksKey = (fileHash: string) => `UPLOAD:CHUNKS:${fileHash}`

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
