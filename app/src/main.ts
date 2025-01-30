import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { isMockMode } from './share/mode'
import cors from '@fastify/cors'
import { TaskService } from './modules/task/task.service'
import { Providers } from './modules/symbol'
import type { AppConfig } from './share/config'
import { FileCleanService } from './modules/file/service/fileClean.service'

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(isMockMode()),
    new FastifyAdapter()
  )

  await app.register(cors as any, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true
  })

  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser('application/octet-stream', (_, payload, done) =>
      done(null, payload)
    )

  const taskService = app.get(TaskService)
  const fileCleanService = app.get(FileCleanService)
  const config: AppConfig = app.get(Providers.Config)
  taskService.registerTask(
    () => fileCleanService.cleanExpiredFiles(),
    config.cleanCron,
    config.timezone
  )

  await app.listen({ host: '0.0.0.0', port: 3000 })
}
bootstrap().catch(() => {})
