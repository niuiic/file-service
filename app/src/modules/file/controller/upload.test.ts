import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import request from 'supertest'
import type { RawServerDefault } from 'fastify'
import { createHash } from 'crypto'
import type { FileInfo } from './fileInfo'
import { initTestApp } from '@/share/test'

describe('file upload controller', () => {
  let app: NestFastifyApplication<RawServerDefault>

  beforeAll(async () => (app = await initTestApp()))

  afterAll(() => app.close())

  // %% uploadFileByStream %%
  test('uploadFileByStream', async () => {
    const text = new Date().toString().repeat(100)
    const fileData = Buffer.from(text)
    const fileHash = createHash('md5').update(text).digest('hex')

    let fileInfo: FileInfo

    const uploadFile = () =>
      request(app.getHttpServer())
        .post('/file/upload/stream')
        .set('Content-Type', 'application/octet-stream')
        .query({
          fileHash,
          fileName: 'test.txt'
        })
        .send(fileData)
        .then((x) => {
          fileInfo = x.body
          expect((fileInfo.name = 'test.txt'))
        })

    const uploadSameFile = () =>
      request(app.getHttpServer())
        .post('/file/upload/stream')
        .query({
          fileHash,
          fileName: 'test2.txt'
        })
        .send(fileData)
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
