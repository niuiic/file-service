import { AppModule } from '@/app.module'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import type { RawServerDefault } from 'fastify'

export const initTestApp = async () => {
  const app: NestFastifyApplication<RawServerDefault> =
    await Test.createTestingModule({ imports: [AppModule.forRoot(true)] })
      .compile()
      .then((x) =>
        x.createNestApplication<NestFastifyApplication<RawServerDefault>>(
          new FastifyAdapter()
        )
      )

  // await app.register(multipart as any, {
  //   limits: { fileSize: app.get<AppConfig>('CONFIG').upload.maxBlobSize }
  // })

  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser(
      'application/octet-stream',
      {
        parseAs: 'buffer'
      },
      (_request, _rawBody, done) => {
        return done(null)
      }
    )

  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return app
}
