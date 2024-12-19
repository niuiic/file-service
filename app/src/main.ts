import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import multipart from '@fastify/multipart'
import type { AppConfig } from './share/config'
import { isMockMode } from './share/mode'

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(isMockMode()),
    new FastifyAdapter()
  )
  await app.register(multipart as any, {
    limits: { fileSize: app.get<AppConfig>('CONFIG').upload.maxBlobSize }
  })
  await app.listen({ host: '0.0.0.0', port: 3000 })
}
bootstrap().catch(() => {})
