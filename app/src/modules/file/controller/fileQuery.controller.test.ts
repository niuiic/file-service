import { afterAll, assert, beforeAll, describe, test } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { RawServerDefault } from 'fastify'
import { initTestApp } from '@/share/test'
import { Providers } from '@/modules/symbol'
import request from 'supertest'

describe('file query controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% queryFileById %%
  test('queryFileById', async () => {
    const { fileSchema } = app.get(Providers.DBSchema)
    const files = await app.get(Providers.DBClient).select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    const file = await request(app.getHttpServer())
      .get('/file/query/single')
      .query({ id: files[0].id })
      .then((x) => x.body)

    assert(file)
  })

  // %% queryFilesById %%
  test('queryFilesById', async () => {
    const { fileSchema } = app.get(Providers.DBSchema)
    const files = await app.get(Providers.DBClient).select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    const results = await request(app.getHttpServer())
      .post('/file/query/batch')
      .send(files.map((x: any) => x.id))
      .then((x) => {
        return x.body
      })

    assert(files.every((x: any) => results.some((y: any) => y.id === x.id)))
  })

  // %% isFileUploaded %%
  test('isFileUploaded', async () => {
    const { fileSchema } = app.get(Providers.DBSchema)
    const files = await app.get(Providers.DBClient).select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    assert(
      await request(app.getHttpServer())
        .get('/file/query/exist')
        .query({ hash: files[0].hash })
        .then((x) => x.body)
    )
  })
})
