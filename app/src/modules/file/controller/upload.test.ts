import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, test } from 'vitest'
import request from 'supertest'
import type { RawServerDefault } from 'fastify'
import { createHash } from 'crypto'
import { initTestApp } from '@/share/test'
import type { Writable } from 'stream'
import { Readable } from 'stream'

describe('file upload controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% uploadFileByStream %%
  test('uploadFileByStream', async () => {
    const fileData = new Date().toString().repeat(100)
    const fileHash = createHash('md5').update(fileData).digest('hex')

    const { promise, resolve } = Promise.withResolvers()
    setTimeout(() => resolve(undefined), 4000)
    const readable = new Readable({
      read() {
        this.push(fileData)
        this.push(null)
      }
    })

    readable.pipe(
      request(app.getHttpServer())
        .post('/file/upload/stream')
        .set('Content-Type', 'application/octet-stream')
        .query({
          fileHash,
          fileName: 'test.txt'
        }) as unknown as Writable
    )

    return promise
  })

  // %% uploadFileByHash %%
  test('uploadFileByHash', () =>
    request(app.getHttpServer())
      .post('/file/upload/hash')
      .field('fileName', new Date().toString())
      .field('fileHash', new Date().toString())
      .expect(400))
})
