import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from '@/modules/cache/module'
import type { ChunkInfo } from '../service/chunkInfo'
import { isNil } from '@/share/isNil'

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
      chunks: {},
      uploadState: '0'.repeat(chunkCount)
    })
  }

  // %% queryChunksInfo %%
  async queryChunksInfo(fileHash: string): Promise<ChunkInfo[]> {
    return this.cache.hgetall(getUploadKey(fileHash)).then((data) => {
      if (isObjEmpty(data)) {
        return []
      }

      return data.uploadState.split('').map(
        (x, i): ChunkInfo => ({
          index: i,
          size: parseInt(data.chunkSize, 10),
          uploaded: x === '1'
        })
      )
    })
  }

  // %% queryUploadInfo %%
  async queryUploadInfo(
    fileHash: string
  ): Promise<
    { uploadId: string; relativePath: string; uploaded: boolean[] } | undefined
  > {
    return this.cache.hgetall(getUploadKey(fileHash)).then((data) => {
      if (isObjEmpty(data)) {
        return
      }

      return {
        uploadId: data.uploadId,
        relativePath: data.relativePath,
        uploaded: data.uploadState.split('').map((x) => x === '1')
      }
    })
  }

  async setChunkUploaded(
    fileHash: string,
    chunkIndex: number,
    chunkHash: string
  ) {
    const uploadState = await this.cache.hget(
      getUploadKey(fileHash),
      'uploadState'
    )
    if (isNil(uploadState)) {
      throw new Error('分片上传任务不存在')
    }

    await this.cache.hset(
      getUploadKey(fileHash),
      'uploadState',
      getNewUploadState(uploadState, chunkIndex)
    )

    const chunksStr = await this.cache.hget(getUploadKey(fileHash), 'chunks')
    if (isNil(chunksStr)) {
      throw new Error('分片信息不存在')
    }

    await this.cache.hset(getUploadKey(fileHash), 'chunks', {
      ...JSON.parse(chunksStr),
      [chunkIndex]: chunkHash
    })
  }
}

const getUploadKey = (fileHash: string) => `UPLOAD:${fileHash}`

const isObjEmpty = (obj: Record<PropertyKey, any>) =>
  Object.keys(obj).length === 0

const getNewUploadState = (uploadState: string, index: number) =>
  uploadState.slice(0, index) + '1' + uploadState.slice(index + 1)
