import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, test } from 'vitest'
import { assert } from '@/share/assert'
import request from 'supertest'
import type { RawServerDefault } from 'fastify'
import { delay, getRandomPng, initTestApp } from '@/share/test'
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
      timeout: 2e4
    },
    async () => {
      const fileName = 'test.png'
      const fileData = Uint8Array.from(await getRandomPng())
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
          fileName,
          variants: ['PNG_COMPRESSED']
        })
        .on('end', resolve)
        .on('error', reject)

      readable.pipe(req as unknown as Writable)

      await promise
        .then(() => delay(2e3))
        .then(() =>
          request(app.getHttpServer())
            .get('/file/query/exist')
            .query({ hash: fileHash, variant: 'PNG_COMPRESSED' })
            .then((res) => assert(res.body.data))
        )
    }
  )

  // %% uploadFileByHash %%
  test('uploadFileByHash', async () => {
    const { fileSchema } = app.get(Providers.DBSchema)
    const files = await app.get(Providers.DBClient).select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    await request(app.getHttpServer())
      .post('/file/upload/hash')
      .send({ fileName: 'hashUpload.png', fileHash: files[0].hash })
      .expect(201)
  })

  // %% multipartUpload %%
  test('multipart upload', async () => {
    const fileName = 'multipartUpload.jpg'
    let text = new Date().toString()
    text = text.repeat((8 * 1024 ** 2) / Buffer.from(text).length)
    const fileData = Uint8Array.from(text)
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
      .send({ fileHash, fileName })
      .expect(201)
  })
})
