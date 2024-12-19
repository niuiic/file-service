import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import multipart from '@fastify/multipart'
import { AppModule } from '@/app.module'
import type { AppConfig } from '@/share/config'
import type { RawServerDefault } from 'fastify'
import { createHash } from 'crypto'
import type { FileInfo } from './fileInfo'

describe('file upload controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule.forRoot(true)]
    })
      .compile()
      .then((x) =>
        x.createNestApplication<NestFastifyApplication<RawServerDefault>>(
          new FastifyAdapter()
        )
      )
    await app.register(multipart as any, {
      limits: { fileSize: app.get<AppConfig>('CONFIG').upload.maxBlobSize }
    })
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(() => app.close())

  // %% uploadFileByBlob %%
  test('uploadFileByBlob', async () => {
    const text = new Date().toString()
    const fileData = Buffer.from(text)
    const fileHash = createHash('md5').update(text).digest('hex')

    let fileInfo: FileInfo

    const uploadFile = () =>
      request(app.getHttpServer())
        .post('/file/upload/blob')
        .attach('file', fileData, { filename: 'test.txt' })
        .field('fileHash', fileHash)
        .then((x) => {
          fileInfo = x.body
          expect((fileInfo.name = 'test.txt'))
        })

    const uploadSameFile = () =>
      request(app.getHttpServer())
        .post('/file/upload/blob')
        .attach('file', fileData, { filename: 'test2.txt' })
        .field('fileHash', fileHash)
        .then((x) => {
          const newFileInfo: FileInfo = x.body
          expect(newFileInfo.uploadTime).toBe(fileInfo.uploadTime)
          expect(newFileInfo.relativePath).toBe(fileInfo.relativePath)
          expect(newFileInfo.name).not.toBe(fileInfo.name)
        })

    await uploadFile()
    await uploadSameFile()
  })

  // %% uploadFileByHash %%
  test('uploadFileByHash', () =>
    request(app.getHttpServer())
      .post('/file/upload/hash')
      .field('fileName', new Date().toString())
      .field('fileHash', new Date().toString())
      .expect(400))
})
