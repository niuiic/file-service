import { initTestApp } from '@/share/test'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { RawServerDefault } from 'fastify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { FileCleanService } from './fileClean.service'
import { Providers } from '@/modules/symbol'
import type { DBClient, DBSchema } from '@/modules/db/db.module'
import { eq } from 'drizzle-orm'

describe('file clean service', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  test('clean expired files', async () => {
    const { fileSchema }: DBSchema = app.get(Providers.DBSchema)
    const dbClient: DBClient = app.get(Providers.DBClient)
    const fileCleanService = app.get(FileCleanService)

    const files = await dbClient.select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    const file = files[0]
    await dbClient
      .update(fileSchema)
      .set({
        expiryTime: new Date(Date.now() - 1e3)
      })
      .where(eq(fileSchema.id, file.id))

    await fileCleanService.cleanExpiredFiles()

    const expiredFiles = await dbClient
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.id, file.id))
    expect(expiredFiles.length).toBe(0)
  })
})
