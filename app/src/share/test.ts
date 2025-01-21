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

  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser('application/octet-stream', (_, payload, done) =>
      done(null, payload)
    )

  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return app
}

export const delay = (time: number) => {
  const { promise, resolve } = Promise.withResolvers()
  setTimeout(() => resolve(undefined), time)
  return promise
}
