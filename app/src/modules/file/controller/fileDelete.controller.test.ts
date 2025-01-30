import { afterAll, beforeAll, describe, test } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { RawServerDefault } from 'fastify'
import { initTestApp } from '@/share/test'
import { Providers } from '@/modules/symbol'
import request from 'supertest'

describe('file delete controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% deleteFile %%
  test('deleteFile', async () => {
    const { fileSchema } = app.get(Providers.DBSchema)
    const files = await app.get(Providers.DBClient).select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    const file = files[0]

    await request(app.getHttpServer())
      .post('/file/delete')
      .send({ fileId: file.id })
      .expect(201)
  })
})
