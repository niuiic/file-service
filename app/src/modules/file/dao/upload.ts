import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from '@/modules/cache/module'
import type { ChunkInfo } from '../service/chunkInfo'
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
        uploadId,
        fileSize,
        fileHash,
        relativePath,
        chunkSize,
        uploadState: '0'.repeat(chunkCount)
      })
      .hset(getChunksKey(fileHash), {})
      .setbit(getStatusKey(fileHash), chunkCount - 1, 0)
      .exec()
      .then((results) =>
        results?.forEach(([err]) => {
          if (err) {
            throw err
          }
        })
      )
  }

  // %% queryChunksInfo %%
  async queryChunksInfo(fileHash: string): Promise<ChunkInfo[]> {
    return this.cache
      .pipeline()
      .hget(getUploadKey(fileHash), 'fileSize')
      .hgetall(getChunksKey(fileHash))
      .exec((results) => {
        // const [upload, chunks] = results
      })
    // .then((data) => {
    //   if (isObjEmpty(data)) {
    //     return []
    //   }
    //
    //   const chunksHash = JSON.parse(data.chunks)
    //
    //   return data.uploadState.split('').map(
    //     (x, i): ChunkInfo => ({
    //       index: i,
    //       size: parseInt(data.chunkSize, 10),
    //       uploaded: x === '1',
    //       hash: chunksHash[i]
    //     })
    //   )
    // })
  }

  // %% queryUploadInfo %%
  async queryUploadInfo(fileHash: string): Promise<
    | {
        uploadId: string
        fileSize: number
        relativePath: string
        uploaded: boolean[]
      }
    | undefined
  > {
    return this.cache.hgetall(getUploadKey(fileHash)).then((data) => {
      if (isObjEmpty(data)) {
        return
      }

      return {
        uploadId: data.uploadId,
        fileSize: parseInt(data.fileSize, 10),
        relativePath: data.relativePath,
        uploaded: data.uploadState.split('').map((x) => x === '1')
      }
    })
  }

  // %% setChunkUploaded %%
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

  // %% isReadyToMerge %%
  async isReadyToMerge(fileHash: string): Promise<boolean> {
    return this.cache
      .hget(getUploadKey(fileHash), 'uploadState')
      .then((x) => Boolean(x && !x.includes('0')))
  }

  // %% deleteUpload %%
  async deleteUpload(fileHash: string) {
    this.cache.del(getUploadKey(fileHash))
  }
}

// % extract %
const getUploadKey = (fileHash: string) => `UPLOAD:${fileHash}`
const getChunksKey = (fileHash: string) => `UPLOAD:CHUNKS:${fileHash}`
const getStatusKey = (fileHash: string) => `UPLOAD:STATUS:${fileHash}`

const isObjEmpty = (obj: Record<PropertyKey, any>) =>
  Object.keys(obj).length === 0

const getNewUploadState = (uploadState: string, index: number) =>
  uploadState.slice(0, index) + '1' + uploadState.slice(index + 1)
