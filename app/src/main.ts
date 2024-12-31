import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { isMockMode } from './share/mode'

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(isMockMode()),
    new FastifyAdapter()
  )
  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser(
      'application/octet-stream',
      {
        parseAs: 'buffer'
      },
      (_, body, done) => done(null, body)
    )
  await app.listen({ host: '0.0.0.0', port: 3000 })
}
bootstrap().catch(() => {})
