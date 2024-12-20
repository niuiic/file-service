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
  test('requestFileChunks', () =>
    request(app.getHttpServer())
      .post('/file/chunk/request')
      .field('fileName', new Date().toString())
      .field('fileHash', new Date().toString())
      .field('fileSize', 12 * 1024 ** 2)
      .expect(200))
})
