import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, test } from 'vitest'
import request from 'supertest'
import type { RawServerDefault } from 'fastify'
import { initTestApp } from '@/share/test'
import type { AppConfig } from '@/share/config'
import { createHash } from 'crypto'

describe('file chunk controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  test('multipart upload', async () => {
    const fileName = new Date().toString()
    const fileData = Buffer.from((0).toFixed(1).repeat(10 * 1024 ** 2))
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
    const chunkSize = (app.get('CONFIG') as AppConfig).upload.chunkSize

    await Promise.all(
      Array.from({ length: Math.ceil(fileSize / chunkSize) })
        .map((_, i) => {
          const chunkData = Buffer.from(
            Uint8Array.prototype.slice.call(
              fileData,
              i * chunkSize,
              (i + 1) * chunkSize
            )
          )
          const chunkHash = createHash('md5').update(chunkData).digest('hex')

          return { chunkData, chunkHash }
        })
        .map(({ chunkData, chunkHash }, i) =>
          request(app.getHttpServer())
            .post('/file/chunk/upload')
            .attach('file', chunkData)
            .field('chunkHash', chunkHash)
            .field('chunkIndex', i)
            .field('fileHash', fileHash)
            .expect(201)
        )
    )

    await request(app.getHttpServer())
      .post('/file/chunk/merge')
      .send({ fileHash })
      .expect(201)
  })
})
