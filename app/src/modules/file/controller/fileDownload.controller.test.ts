import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { RawServerDefault } from 'fastify'
import { initTestApp } from '@/share/test'
import { Providers } from '@/modules/symbol'
import request from 'supertest'

describe('file download controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% downloadFile %%
  test('downloadFile', async () => {
    const { fileSchema } = app.get(Providers.DBSchema)
    const files = await app.get(Providers.DBClient).select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    const fileSize: number = await request(app.getHttpServer())
      .get('/file/query/single')
      .query({ id: files[0].id })
      .then((x) => x.body.data.size)

    const { promise, resolve, reject } = Promise.withResolvers<undefined>()
    await request(app.getHttpServer())
      .get('/file/download')
      .query({
        id: files[0].id
      })
      .parse((stream, callback) => {
        const chunks: any[] = []
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => {
          const data = Buffer.concat(chunks)
          expect(data.length).toBe(fileSize)
          resolve(undefined)
          callback(null, data)
        })
        stream.on('error', reject)
      })
    await promise
  })
})
