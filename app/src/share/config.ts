import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'

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
    database: z.number()
  }),
  s3: z.object({
    region: z.string(),
    endPoint: z.string(),
    accessKey: z.string(),
    secretKey: z.string(),
    bucket: z.string(),
    forcePathStyle: z.boolean()
  }),
  upload: z.object({
    chunkSize: z.number().min(5 * 1024 ** 2, 'chunkSize不能小于5M'),
    acceptedFileTypes: z.array(z.string())
  }),
  variant: z.object({
    quality: z
      .number()
      .min(0, 'quality不能小于0')
      .max(100, 'quality不能大于100')
  }),
  machineId: z
    .number()
    .min(0, 'machineId不能小于0')
    .max(2 ** 6 - 1, 'machineId不能超过63'),
  cleanCron: z.string(),
  timezone: z.string()
})

export type AppConfig = z.infer<typeof appConfigSchema>

export const loadConfig = (configPath: string): AppConfig => {
  const config = JSON.parse(readFileSync(configPath).toString())
  return appConfigSchema.parse(config)
}

export const configPath = join(process.cwd(), 'config.json')
export const configPathMock = join(process.cwd(), 'config.mock.json')
