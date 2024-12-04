import { Global, Module } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { parse } from 'json-bigint'

const appConfigSchema = z.object({
  db: z.object({
    type: z.string(),
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    database: z.string()
  }),
  cache: z.object({
    type: z.string(),
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    db: z.number()
  }),
  clusterId: z.bigint(),
  machineId: z.bigint()
})

export type AppConfig = z.infer<typeof appConfigSchema>

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useFactory: () => {
        const config = parse(
          readFileSync(join(process.cwd(), 'config.json')).toString()
        )
        config.clusterId = BigInt(config.clusterId)
        config.machineId = BigInt(config.machineId)
        return appConfigSchema.parse(config)
      }
    }
  ],
  exports: ['CONFIG']
})
export class ConfigModule {}
