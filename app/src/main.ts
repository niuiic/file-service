import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import fastifyMultipart from '@fastify/multipart'
import type { AppConfig } from './share/config'

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )
  await app.register(fastifyMultipart, {
    limits: { fileSize: app.get<AppConfig>('CONFIG').upload.maxBlobSize }
  })
  await app.listen({ host: '0.0.0.0', port: 3000 })
}
bootstrap().catch(() => {})
