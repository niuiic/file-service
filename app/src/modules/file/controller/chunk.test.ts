import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, test } from 'vitest'
import request from 'supertest'
import type { RawServerDefault } from 'fastify'
import { initTestApp } from '@/share/test'

describe('file chunk controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% requestFileChunks %%
  test('requestFileChunks', async () => {
    const fileName = new Date().toString()
    const fileHash = new Date().toString()

    await request(app.getHttpServer())
      .post('/file/chunk/request')
      .send({
        fileName,
        fileHash,
        fileSize: 12 * 1024 ** 2
      })
      .expect(201)

    await request(app.getHttpServer())
      .post('/file/chunk/request')
      .send({
        fileName,
        fileHash,
        fileSize: 12 * 1024 ** 2
      })
      .expect(201)
  })
})
