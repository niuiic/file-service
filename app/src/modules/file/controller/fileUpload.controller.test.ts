import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, assert, beforeAll, describe, test } from 'vitest'
import request from 'supertest'
import type { RawServerDefault } from 'fastify'
import { initTestApp } from '@/share/test'
import type { AppConfig } from '@/share/config'
import { createHash } from 'crypto'
import type { Writable } from 'stream'
import { Readable } from 'stream'
import { Providers } from '@/modules/symbol'

describe('file upload controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% uploadFileByStream %%
  test(
    'uploadFileByStream',
    {
      timeout: 1e4
    },
    async () => {
      const fileData = Uint8Array.from(new Date().toString().repeat(100))
      const fileHash = createHash('md5').update(fileData).digest('hex')

      const { promise, resolve, reject } = Promise.withResolvers()
      const readable = new Readable({
        read() {
          this.push(fileData.slice(0, fileData.length / 2))
          this.push(fileData.slice(fileData.length / 2))
          this.push(null)
        }
      })

      const req = request(app.getHttpServer())
        .post('/file/upload/stream')
        .set('Content-Type', 'application/octet-stream')
        .query({
          fileHash,
          fileName: 'test.txt'
        })
      req.on('error', reject)
      req.on('end', resolve)

      readable.pipe(req as unknown as Writable)

      await promise.then(() =>
        request(app.getHttpServer())
          .get('/file/query/exist')
          .query({ hash: fileHash })
          .then((res) => assert(res.body))
      )
    }
  )

  // %% uploadFileByHash %%
  test('uploadFileByHash', () => {
    request(app.getHttpServer())
      .post('/file/upload/hash')
      .field('fileName', new Date().toString())
      .field('fileHash', new Date().toString())
      .expect(500)
  })

  // %% multipartUpload %%
  test('multipart upload', async () => {
    const fileName = new Date().toString()
    const fileData = Uint8Array.from(new Date().toString().repeat(100))
    const fileHash = createHash('md5').update(fileData).digest('hex')
    const fileSize = fileData.length

    await request(app.getHttpServer())
      .post('/file/chunk/request')
      .send({
        fileName,
        fileHash,
        fileSize
      })
      .expect(201)
    const chunkSize = (app.get(Providers.Config) as AppConfig).upload.chunkSize

    await Promise.all(
      Array.from({ length: Math.ceil(fileSize / chunkSize) })
        .map((_, i) => {
          const data = fileData.slice(i * chunkSize, (i + 1) * chunkSize)
          const chunkData = new Readable({
            read() {
              this.push(data)
              this.push(null)
            }
          })
          const chunkHash = createHash('md5').update(data).digest('hex')
          return { chunkData, chunkHash }
        })
        .map(({ chunkData, chunkHash }, i) => {
          const { promise, resolve, reject } = Promise.withResolvers()

          const req = request(app.getHttpServer())
            .post('/file/chunk/upload')
            .set('Content-Type', 'application/octet-stream')
            .query({
              chunkHash,
              chunkIndex: i,
              fileHash
            })
          req.on('error', reject)
          req.on('end', resolve)

          chunkData.pipe(req as unknown as Writable)

          return promise
        })
    )

    await request(app.getHttpServer())
      .post('/file/chunk/merge')
      .send({ fileHash })
      .expect(201)
  })
})
